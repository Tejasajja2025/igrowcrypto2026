import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const signalsTable = 'mt5_signals';

async function ensureSignalsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS ${signalsTable} (
      id VARCHAR(100) PRIMARY KEY,
      follower_key VARCHAR(255) NULL,
      currency_pair VARCHAR(64) NOT NULL,
      direction VARCHAR(32) NOT NULL,
      action VARCHAR(32) NOT NULL DEFAULT 'OPEN',
      entry_price DECIMAL(18,8) NOT NULL,
      stop_loss DECIMAL(18,8) NULL,
      take_profit DECIMAL(18,8) NULL,
      lot_size DECIMAL(18,8) NOT NULL,
      order_type VARCHAR(32) NOT NULL DEFAULT 'Market',
      comment TEXT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      acknowledged_at TIMESTAMP NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
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

  if (sinceTimestamp) {
    whereClause += ' AND UNIX_TIMESTAMP(created_at) >= ?';
    params.push(Math.floor(sinceTimestamp / 1000));
  } else {
    whereClause += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)';
  }

  if (followerKey) {
    whereClause += ' AND follower_key = ?';
    params.push(followerKey);
  }

  const rows = await query(`
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
  `, params);

  return rows;
}

async function savePendingSignal(signal: any) {
  await ensureSignalsTable();
  await query(`
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
  `, [
    signal.id,
    signal.followerKey,
    signal.currencyPair,
    signal.direction,
    signal.action,
    signal.entryPrice,
    signal.stopLoss,
    signal.takeProfit,
    signal.lotSize,
    signal.orderType,
    signal.comment,
  ]);

  return signal;
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
    const pendingSignals = await fetchPendingSignals(followerKey, sinceTimestamp);

    return NextResponse.json({ success: true, signals: pendingSignals });
  } catch (error) {
    console.error('Signals GET error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));

    if (payload.action === 'ack' && payload.signalId) {
      const acknowledged = await acknowledgeSignal(payload.signalId);
      return NextResponse.json({ success: acknowledged, acknowledged: acknowledged, signalId: payload.signalId });
    }

    const signal = normalizeSignalPayload(payload);
    if (!signal.currencyPair) {
      return NextResponse.json({ success: false, error: 'currencyPair is required.' }, { status: 400 });
    }
    if (signal.action === 'OPEN' && !signal.direction) {
      return NextResponse.json({ success: false, error: 'direction is required for OPEN signals.' }, { status: 400 });
    }

    const saved = await savePendingSignal(signal);
    return NextResponse.json({ success: true, signal: saved, message: 'Signal queued for MT5 bridge delivery.' });
  } catch (error) {
    console.error('Signals POST error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
