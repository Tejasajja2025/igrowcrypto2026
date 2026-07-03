import { NextResponse } from 'next/server';
import { safeJson } from '@/lib/utils';

function sanitizeSymbol(symbol: string) {
  return symbol.replace(/[\/\-\s]/g, '').toUpperCase();
}

function extractHistory(data: any) {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.values)) {
    return data.values;
  }

  if (Array.isArray(data.candles)) {
    return data.candles;
  }

  if (Array.isArray(data.history)) {
    return data.history;
  }

  if (Array.isArray(data.prices)) {
    return data.prices;
  }

  if (Array.isArray(data.result)) {
    return data.result;
  }

  return [];
}

function normalizeQuote(item: any) {
  if (!item) return null;

  if (Array.isArray(item)) {
    const [time, open, high, low, close] = item;
    return {
      open,
      high,
      low,
      close,
      time,
    };
  }

  if (typeof item === 'object') {
    return {
      open: item.open ?? item.O ?? item.o ?? item.ask ?? item.bid,
      high: item.high ?? item.H ?? item.h,
      low: item.low ?? item.L ?? item.l,
      close: item.close ?? item.C ?? item.c ?? item.price ?? item.mid?.c ?? item.ask ?? item.bid,
      time: item.time ?? item.timestamp ?? item.date ?? item.dt,
    };
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'EUR/USD';
  const period = searchParams.get('period') || '1m';
  const limitValue = Number(searchParams.get('limit') || '10');
  const limit = Number.isNaN(limitValue) ? 10 : Math.min(Math.max(limitValue, 1), 50);
  const apiUrl = process.env.MARKET_DATA_PROVIDER_URL;
  const apiKey = process.env.MARKET_DATA_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json({ error: 'Market data provider configuration is missing.' }, { status: 500 });
  }

  const providerSymbol = sanitizeSymbol(symbol);
  const url = apiUrl
    .replace('{symbol}', encodeURIComponent(providerSymbol))
    .replace('{period}', encodeURIComponent(period))
    .replace('{limit}', encodeURIComponent(String(limit)))
    .replace('{apikey}', encodeURIComponent(apiKey));

  try {
    const response = await fetch(url);
    const providerBody = await response.clone().text().catch(() => null)

    if (!response.ok) {
      // provider responded with error status — try internal mock fallback before failing
      try {
        const origin = new URL(request.url).origin;
        const mockUrl = `${origin}/api/mock-market?symbol=${encodeURIComponent(symbol)}&period=${encodeURIComponent(period)}&limit=${encodeURIComponent(String(limit))}`;
        const mockRes = await fetch(mockUrl);
        const mockData = await safeJson(mockRes);
        if (mockRes.ok && mockData) {
          return NextResponse.json({ ...mockData, note: 'returned from internal mock fallback (provider status ' + response.status + ')' });
        }
      } catch (e) {
        // ignore
      }

      return NextResponse.json({
        error: 'Market provider request failed',
        provider: { url, status: response.status, statusText: response.statusText, body: providerBody?.slice?.(0, 500) }
      }, { status: 502 })
    }

    const data = await safeJson(response.clone());
    const rawHistory = extractHistory(data);
    const normalized = rawHistory
      .map(normalizeQuote)
      .filter((item): item is { open: number; high: number; low: number; close: number; time: any } => !!item && item.close !== undefined && item.open !== undefined)
      .slice(-limit)
      .map((item) => {
        const iso = item.time ? new Date(item.time).toISOString() : new Date().toISOString();
        const label = new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
          time: iso,
          label,
        };
      });

    if (!normalized.length) {
      const useFallback = process.env.NODE_ENV !== 'production' || process.env.MARKET_DATA_USE_FALLBACK === 'true';

      if (useFallback) {
        const now = Date.now();
        const fallbackStart = now - (limit * 60 * 1000);
        let base = 1
        // try to infer a sensible base from provider body or symbol
        if (symbol && symbol.toUpperCase().includes('USD')) base = 1.1
        const rnd = (v = 0.005) => (Math.random() - 0.5) * v
        let price = base + Math.random() * 0.01
        const candles = Array.from({ length: limit }).map((_, i) => {
          const t = new Date(fallbackStart + i * 60 * 1000).toISOString();
          const open = price
          const close = Math.max(0.0001, open + rnd())
          const high = Math.max(open, close) + Math.abs(rnd(0.003))
          const low = Math.min(open, close) - Math.abs(rnd(0.003))
          price = close
          const label = new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return { open: Number(open.toFixed(6)), high: Number(high.toFixed(6)), low: Number(low.toFixed(6)), close: Number(close.toFixed(6)), time: t, label }
        })

        const last = candles[candles.length - 1]
        const priceNum = Number(last.close)
        const openNum = Number(last.open)
        const change = openNum ? (((priceNum - openNum) / openNum) * 100).toFixed(2) : '0.00'

        return NextResponse.json({
          symbol,
          price: priceNum,
          change: `${change.startsWith('-') ? '' : '+'}${change}%`,
          high: Number(last.high),
          low: Number(last.low),
          updatedAt: last.time,
          candles,
          note: 'fallback sample data (development)',
        })
      }

      // Attempt internal mock-market fallback before failing
      try {
        const origin = new URL(request.url).origin;
        const mockUrl = `${origin}/api/mock-market?symbol=${encodeURIComponent(symbol)}&period=${encodeURIComponent(period)}&limit=${encodeURIComponent(String(limit))}`;
        const mockRes = await fetch(mockUrl);
        const mockData = await safeJson(mockRes);
        if (mockRes.ok && mockData) {
          return NextResponse.json({ ...mockData, note: 'returned from internal mock fallback' });
        }
      } catch (e) {
        // ignore and return provider error below
      }

      return NextResponse.json({
        error: 'Unable to parse market data from provider response.',
        provider: { url, data: Array.isArray(data) ? data.slice(-3) : undefined, body: providerBody?.slice?.(0, 1000) },
      }, { status: 502 });
    }

    const candle = normalized[normalized.length - 1];
    const price = Number(candle.close);
    const open = Number(candle.open);
    const change = open ? (((price - open) / open) * 100).toFixed(2) : '0.00';

    return NextResponse.json({
      symbol,
      price,
      change: `${change.startsWith('-') ? '' : '+'}${change}%`,
      high: candle.high !== undefined ? Number(candle.high) : price,
      low: candle.low !== undefined ? Number(candle.low) : price,
      updatedAt: candle.time ? new Date(candle.time).toLocaleTimeString() : new Date().toLocaleTimeString(),
      candles: normalized,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Market data fetch failed.', detail: String(error) }, { status: 502 });
  }
}
