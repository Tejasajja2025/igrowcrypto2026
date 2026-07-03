import { NextResponse } from 'next/server';

function parsePeriodSeconds(period: string) {
  if (!period) return 60;
  if (period.endsWith('m')) return Number(period.replace('m','')) * 60;
  if (period.endsWith('h')) return Number(period.replace('h','')) * 60 * 60;
  if (period.endsWith('d')) return Number(period.replace('d','')) * 60 * 60 * 24;
  return 60;
}

function makeCandles(limit: number, periodSec: number) {
  const now = Math.floor(Date.now() / 1000);
  const candles = [];
  let price = 100 + Math.random() * 50;
  for (let i = limit - 1; i >= 0; i--) {
    const time = new Date((now - i * periodSec) * 1000).toISOString();
    const open = price + (Math.random() - 0.5) * 2;
    const close = open + (Math.random() - 0.5) * 4;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    candles.push({ open, high, low, close, time });
    price = close;
  }
  return candles;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'TESTUSD';
  const period = searchParams.get('period') || '1m';
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || '12'), 1), 100);
  const seconds = parsePeriodSeconds(period);

  const candles = makeCandles(limit, seconds);
  const last = candles[candles.length - 1];
  const price = Number(last.close);
  const open = Number(candles[0].open) || price;
  const change = open ? (((price - open) / open) * 100).toFixed(2) : '0.00';

  return NextResponse.json({
    symbol,
    price,
    change: `${change.startsWith('-') ? '' : '+'}${change}%`,
    high: Math.max(...candles.map(c => c.high)),
    low: Math.min(...candles.map(c => c.low)),
    updatedAt: last.time,
    candles,
  });
}
