import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query(`
      SELECT id, name, account_id AS accountId, followers_count AS followers, performance, equity, balance, open_trades AS openTrades, last_signal AS lastSignal, risk_level AS risk
      FROM followers
      ORDER BY followers_count DESC
      LIMIT 100
    `);

    return NextResponse.json({ success: true, followers: rows });
  } catch (error) {
    console.error('Followers fetch error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const { id, name, accountId, followers, performance, equity, balance, openTrades, lastSignal, risk } = payload as Record<string, any>;

  if (!id || !name) {
    return NextResponse.json({ success: false, error: 'Follower id and name are required.' }, { status: 400 });
  }

  try {
    await query(`
      INSERT INTO followers (id, name, account_id, followers_count, performance, equity, balance, open_trades, last_signal, risk_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        account_id = VALUES(account_id),
        followers_count = VALUES(followers_count),
        performance = VALUES(performance),
        equity = VALUES(equity),
        balance = VALUES(balance),
        open_trades = VALUES(open_trades),
        last_signal = VALUES(last_signal),
        risk_level = VALUES(risk_level)
    `, [id, name, accountId, followers || 0, performance || '', equity || '', balance || '', openTrades || 0, lastSignal || '', risk || '']);

    return NextResponse.json({ success: true, follower: payload });
  } catch (error) {
    console.error('Followers save error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
