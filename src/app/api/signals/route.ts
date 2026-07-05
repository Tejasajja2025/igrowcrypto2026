import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const signalsTable = 'mt5_signals';

async function ensureSignalsTable() {
  // Create table if not exists
  await query(`
    CREATE TABLE IF NOT EXISTS ${signalsTable} (
      id VARCHAR(100) PRIMARY KEY,
      follower_key VARCHAR(255) NULL,
      currency_pair VARCHAR(64) NOT NULL,
      direction VARCHAR(32) NULL,
      action VARCHAR(32) NOT NULL DEFAULT 'OPEN',
      entry_price DECIMAL(18,8) NULL,
      stop_loss DECIMAL(18,8) NULL,
      take_profit DECIMAL(18,8) NULL,
      lot_size DECIMAL(18,8) NULL,
      order_type VARCHAR(32) NOT NULL DEFAULT 'Market',
      comment TEXT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      acknowledged_at TIMESTAMP NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Alter table to make fields nullable (for backward compatibility with existing tables)
  try {
    await query(`ALTER TABLE ${signalsTable} MODIFY direction VARCHAR(32) NULL;`).catch(() => null);
    await query(`ALTER TABLE ${signalsTable} MODIFY entry_price DECIMAL(18,8) NULL;`).catch(() => null);
    await query(`ALTER TABLE ${signalsTable} MODIFY lot_size DECIMAL(18,8) NULL;`).catch(() => null);
  } catch (e) {
    console.warn('[SIGNALS] Table columns already optimized or cannot be modified');
  }
}

function normalizeSignalPayload(payload: any) {
  const rawPair = payload.currencyPair || payload.symbol || '';
  const normalizedPair = String(rawPair)
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/\//g, '');

  return {
    id: payload.id || payload.signalId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    currencyPair: normalizedPair,
    direction: payload.direction || payload.side || '',
    action: payload.action || 'OPEN',
    entryPrice: Number(payload.entryPrice || 0),
    stopLoss: payload.stopLoss != null ? Number(payload.stopLoss) : null,
    takeProfit: payload.takeProfit != null ? Number(payload.takeProfit) : null,
    lotSize: Number(payload.lotSize || payload.volume || 0),
    orderType: payload.orderType || 'Market',
    comment: payload.comment || '',
    followerKey: payload.followerKey || payload.follower_key || null,
  };
}

async function fetchPendingSignals(followerKey?: string, sinceTimestamp?: number) {
  await ensureSignalsTable();
  const params: any[] = [];
  let whereClause = `WHERE status = 'pending'`;

  console.log('[SIGNALS-FETCH] Starting fetch with:', {
    followerKey,
    sinceTimestamp,
    currentTime: new Date().toISOString(),
    currentUnixSeconds: Math.floor(Date.now() / 1000),
  });

  if (sinceTimestamp) {
    const sinceSeconds = Math.floor(sinceTimestamp / 1000);
    const nowSeconds = Math.floor(Date.now() / 1000);
    
    console.log('[SIGNALS-FETCH] Time analysis:', {
      sinceSeconds,
      nowSeconds,
      diffSeconds: nowSeconds - sinceSeconds,
      isInFuture: sinceSeconds > nowSeconds,
      diffToNow: sinceSeconds - nowSeconds,
    });

    // MT5 might send a timestamp that's slightly in the future due to clock drift
    // If since is more than 5 minutes in the future, use default window instead
    if (sinceSeconds > nowSeconds + 300) {
      console.warn('[SIGNALS-FETCH] ⚠️  Since timestamp is in future by >5 mins, using 2-hour default window', {
        sinceSeconds,
        nowSeconds,
        diffSeconds: sinceSeconds - nowSeconds,
      });
      whereClause += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)';
    } else {
      console.log('[SIGNALS-FETCH] Using UNIX_TIMESTAMP filter:', { sinceSeconds });
      whereClause += ' AND UNIX_TIMESTAMP(created_at) >= ?';
      params.push(sinceSeconds);
    }
  } else {
    console.log('[SIGNALS-FETCH] No sinceTimestamp, using 2-hour default window');
    whereClause += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)';
  }

  if (followerKey) {
    whereClause += ' AND follower_key = ?';
    params.push(followerKey);
  }

  const sql = `
    SELECT
      id,
      follower_key AS followerKey,
      currency_pair AS currencyPair,
      direction,
      action,
      entry_price AS entryPrice,
      stop_loss AS stopLoss,
      take_profit AS takeProfit,
      lot_size AS lotSize,
      order_type AS orderType,
      comment,
      status,
      created_at AS createdAt,
      acknowledged_at AS acknowledgedAt
    FROM ${signalsTable}
    ${whereClause}
    ORDER BY created_at ASC
    LIMIT 20
  `;

  console.log('[SIGNALS-FETCH] Executing query:', {
    sql: sql.replace(/\n/g, ' ').substring(0, 200),
    whereClause,
    params,
  });

  const rows = await query(sql, params);

  console.log('[SIGNALS-FETCH] Query results:', {
    rowCount: Array.isArray(rows) ? rows.length : 0,
    rows: Array.isArray(rows) ? rows.map(r => ({
      id: r.id,
      currencyPair: r.currencyPair,
      direction: r.direction,
      createdAt: r.createdAt,
    })) : [],
  });

  return rows;
}

async function savePendingSignal(signal: any) {
  try {
    console.log('[SIGNALS-SAVE] ===== SAVING SIGNAL TO DATABASE =====');
    console.log('[SIGNALS-SAVE] Signal object:', JSON.stringify(signal, null, 2));
    
    await ensureSignalsTable();
    
    // For CLOSE signals, direction and entry_price should be NULL
    const direction = signal.action === 'CLOSE' ? null : signal.direction;
    const entryPrice = signal.action === 'CLOSE' ? null : signal.entryPrice;
    const lotSize = signal.action === 'CLOSE' ? null : signal.lotSize;
    
    const params = [
      signal.id,
      signal.followerKey,
      signal.currencyPair || 'ALL',
      direction,
      signal.action,
      entryPrice,
      signal.stopLoss,
      signal.takeProfit,
      lotSize,
      signal.orderType,
      signal.comment,
    ];

    console.log('[SIGNALS-SAVE] Parameters to insert:', {
      id: params[0],
      follower_key: params[1],
      currency_pair: params[2],
      direction: params[3],
      action: params[4],
      entry_price: params[5],
      stop_loss: params[6],
      take_profit: params[7],
      lot_size: params[8],
      order_type: params[9],
      comment: params[10],
    });

    const sql = `
      INSERT INTO ${signalsTable} (
        id,
        follower_key,
        currency_pair,
        direction,
        action,
        entry_price,
        stop_loss,
        take_profit,
        lot_size,
        order_type,
        comment,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      ON DUPLICATE KEY UPDATE
        follower_key = VALUES(follower_key),
        currency_pair = VALUES(currency_pair),
        direction = VALUES(direction),
        action = VALUES(action),
        entry_price = VALUES(entry_price),
        stop_loss = VALUES(stop_loss),
        take_profit = VALUES(take_profit),
        lot_size = VALUES(lot_size),
        order_type = VALUES(order_type),
        comment = VALUES(comment),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
    `;

    console.log('[SIGNALS-SAVE] Executing INSERT query...');
    const result = await query(sql, params);

    console.log('[SIGNALS-SAVE] ✅ INSERT result:', {
      affectedRows: (result as any).affectedRows,
      insertId: (result as any).insertId,
      changeTime: (result as any).changedRows,
      fullResult: result,
    });

    console.log('[SIGNALS-SAVE] ✅ SIGNAL SAVED:', {
      signalId: signal.id,
      currencyPair: signal.currencyPair,
      direction: direction,
      action: signal.action,
      status: 'pending',
      timestamp: new Date().toISOString(),
    });

    return signal;
  } catch (error) {
    console.error('[SIGNALS-SAVE] ❌ DATABASE SAVE ERROR:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      signal,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Failed to save signal to database: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function acknowledgeSignal(signalId: string) {
  await ensureSignalsTable();
  const result = await query(`
    UPDATE ${signalsTable}
    SET status = 'acknowledged', acknowledged_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [signalId]);

  return Boolean((result as any).affectedRows !== 0);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const followerKey = url.searchParams.get('followerKey') || undefined;
    const sinceParam = url.searchParams.get('since');
    const sinceTimestamp = sinceParam ? Number(sinceParam) : undefined;
    
    console.log('[SIGNALS-GET] ===== POLL REQUEST FROM MT5 =====');
    console.log('[SIGNALS-GET] Query parameters:', {
      followerKey,
      sinceParam,
      sinceTimestamp,
      currentTime: new Date().toISOString(),
      currentUnixSeconds: Math.floor(Date.now() / 1000),
      timestamp: new Date().toISOString(),
    });

    const pendingSignals = await fetchPendingSignals(followerKey, sinceTimestamp);

    console.log('[SIGNALS-GET] ✅ Query results:', {
      count: pendingSignals.length,
      followerKey,
      sinceTimestamp,
      signals: pendingSignals.map(s => ({
        id: s.id,
        currencyPair: s.currencyPair,
        direction: s.direction,
        createdAt: s.createdAt,
      })),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      signals: pendingSignals,
      count: pendingSignals.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[SIGNALS-GET] ❌ GET error:', {
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const payload = await request.json().catch(() => ({}));

    console.log('[SIGNALS-POST] ===== BROADCAST SIGNAL RECEIVED =====');
    console.log('[SIGNALS-POST] Raw payload:', JSON.stringify(payload, null, 2));
    console.log('[SIGNALS-POST] Payload keys:', Object.keys(payload));
    console.log('[SIGNALS-POST] Request details:', {
      action: payload.action,
      currencyPair: payload.currencyPair || payload.symbol,
      direction: payload.direction || payload.side,
      entryPrice: payload.entryPrice,
      timestamp: new Date().toISOString(),
    });

    // Handle signal acknowledgement
    if (payload.action === 'ack' && payload.signalId) {
      try {
        const acknowledged = await acknowledgeSignal(payload.signalId);
        console.log('[SIGNALS-POST] Acknowledgement processed:', {
          signalId: payload.signalId,
          acknowledged,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json({ 
          success: acknowledged, 
          acknowledged: acknowledged, 
          signalId: payload.signalId 
        });
      } catch (ackError) {
        console.error('[SIGNALS-POST] Ack error:', ackError);
        throw ackError;
      }
    }

    // Normalize and validate signal payload
    const signal = normalizeSignalPayload(payload);
    
    console.log('[SIGNALS-POST] Normalized signal:', JSON.stringify(signal, null, 2));
    console.log('[SIGNALS-POST] Validation checks:', {
      hasCurrencyPair: !!signal.currencyPair,
      currencyPair: signal.currencyPair,
      hasDirection: !!signal.direction,
      direction: signal.direction,
      entryPrice: signal.entryPrice,
      entryPriceValid: signal.entryPrice > 0,
      action: signal.action,
    });
    
    // For CLOSE actions, currencyPair can be empty/null/ALL to close all positions
    const isCloseAll = signal.action === 'CLOSE' && (!signal.currencyPair || signal.currencyPair === 'ALL' || signal.currencyPair === '*');
    
    if (!signal.currencyPair && !isCloseAll) {
      console.warn('[SIGNALS-POST] ❌ VALIDATION FAILED: Missing currencyPair', { 
        payload, 
        signal,
        originalCurrencyPair: payload.currencyPair,
        originalSymbol: payload.symbol,
      });
      return NextResponse.json({ 
        success: false, 
        error: 'currencyPair is required.' 
      }, { status: 400 });
    }
    
    if (signal.action === 'OPEN' && !signal.direction) {
      console.warn('[SIGNALS-POST] ❌ VALIDATION FAILED: Missing direction for OPEN signal', { 
        payload, 
        signal,
        originalDirection: payload.direction,
        originalSide: payload.side,
      });
      return NextResponse.json({ 
        success: false, 
        error: 'direction is required for OPEN signals.' 
      }, { status: 400 });
    }

    if (signal.action === 'OPEN' && signal.entryPrice <= 0) {
      console.warn('[SIGNALS-POST] ❌ VALIDATION FAILED: Invalid entry price', { 
        signal,
        originalEntryPrice: payload.entryPrice,
      });
      return NextResponse.json({ 
        success: false, 
        error: 'entryPrice must be greater than 0 for OPEN signals.' 
      }, { status: 400 });
    }
    
    // Log signal type
    if (signal.action === 'CLOSE') {
      console.log('[SIGNALS-POST] ✅ CLOSE signal validated:', {
        closeType: isCloseAll ? 'CLOSE ALL' : `CLOSE ${signal.currencyPair}`,
        currencyPair: signal.currencyPair,
      });
    } else {
      console.log('[SIGNALS-POST] ✅ OPEN signal validated:', {
        currencyPair: signal.currencyPair,
        direction: signal.direction,
        entryPrice: signal.entryPrice,
      });
    }

    // Save signal to database
    console.log('[SIGNALS-POST] ✅ All validations passed, saving to database...');
    const saved = await savePendingSignal(signal);
    
    console.log('[SIGNALS-POST] ✅ SIGNAL SAVED SUCCESSFULLY:', {
      signalId: saved.id,
      currencyPair: saved.currencyPair,
      direction: saved.direction,
      status: 'pending',
      followerKey: saved.followerKey,
      processingTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      signal: saved, 
      message: 'Signal queued for MT5 bridge delivery.' 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[SIGNALS-POST] ❌ POST ERROR:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      processingTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
