import { NextResponse } from 'next/server'
import { safeJson } from '@/lib/utils'

function sanitizeSymbol(symbol: string) {
  return symbol.replace(/[\/\-\s]/g, '').toUpperCase()
}

function parsePeriodSeconds(period: string) {
  if (!period) return 60
  if (period.endsWith('m')) return Number(period.replace('m', '')) * 60
  if (period.endsWith('h')) return Number(period.replace('h', '')) * 60 * 60
  if (period.endsWith('d')) return Number(period.replace('d', '')) * 60 * 60 * 24
  return 60
}

function makeMockCandles(limit: number, periodSec: number) {
  const now = Math.floor(Date.now() / 1000)
  const candles = []
  let price = 100 + Math.random() * 50

  for (let i = limit - 1; i >= 0; i--) {
    const time = new Date((now - i * periodSec) * 1000).toISOString()
    const open = price + (Math.random() - 0.5) * 2
    const close = open + (Math.random() - 0.5) * 4
    const high = Math.max(open, close) + Math.random() * 2
    const low = Math.min(open, close) - Math.random() * 2
    candles.push({ open, high, low, close, time })
    price = close
  }

  return candles
}

function makeMockResponse(symbol: string, period: string, limit: number) {
  const seconds = parsePeriodSeconds(period)
  const candles = makeMockCandles(limit, seconds)
  const last = candles[candles.length - 1]
  const price = Number(last.close)
  const open = Number(candles[0].open) || price
  const change = open ? (((price - open) / open) * 100).toFixed(2) : '0.00'

  return {
    symbol,
    price,
    change: `${change.startsWith('-') ? '' : '+'}${change}%`,
    high: Math.max(...candles.map((c) => c.high)),
    low: Math.min(...candles.map((c) => c.low)),
    updatedAt: last.time,
    candles,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'EUR/USD'
  const period = searchParams.get('period') || '1m'
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || '12'), 1), 100)

  const providerTemplate = process.env.MARKET_CANDLES_PROVIDER_URL || ''
  const providerKey = process.env.MARKET_CANDLES_API_KEY || ''

  if (providerTemplate) {
    const providerSymbol = sanitizeSymbol(symbol)
    const url = providerTemplate
      .replace('{symbol}', encodeURIComponent(providerSymbol))
      .replace('{period}', encodeURIComponent(period))
      .replace('{limit}', encodeURIComponent(String(limit)))
      .replace('{apikey}', encodeURIComponent(providerKey))

    try {
      const res = await fetch(url)
      const data = await safeJson(res)
      if (res.ok && data) {
        return NextResponse.json({ source: 'provider', data })
      }
    } catch (error) {
      console.warn('market/candles provider fetch failed', error)
    }
  }

  const mockData = makeMockResponse(symbol, period, limit)
  return NextResponse.json({ source: 'mock', ...mockData })
}
