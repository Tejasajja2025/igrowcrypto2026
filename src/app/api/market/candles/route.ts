import { NextResponse } from 'next/server'
import { safeJson } from '@/lib/utils'

const marketCandlesCache = new Map<string, { expiresAt: number; data: any }>()
const CACHE_TTL_MS = 60_000 // increase default cache to reduce provider pressure
const RATE_LIMIT_TTL_MS = 60_000 // cache provider rate-limit state briefly
const providerRateLimitCache = new Map<string, number>()

function cacheResponse(key: string, data: any) {
  const payload = { expiresAt: Date.now() + CACHE_TTL_MS, data }
  marketCandlesCache.set(key, payload)
  return payload.data
}

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

const coinGeckoIdMap: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  CRO: 'cronos',
  DOGE: 'dogecoin',
  ADA: 'cardano',
  XRP: 'ripple',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  DOT: 'polkadot',
  LINK: 'chainlink',
}

function normalizeProviderData(value: any, symbol: string) {
  if (!value) return null

  if (value.success === true && value.data && typeof value.data === 'object') {
    const payload = value.data.data || value.data
    if (payload && typeof payload === 'object' && payload.open_price != null && payload.lp != null) {
      const open = Number(payload.open_price)
      const high = Number(payload.high_price ?? payload.high ?? open)
      const low = Number(payload.low_price ?? payload.low ?? open)
      const close = Number(payload.lp)
      const time = payload.lp_time ? new Date(Number(payload.lp_time) * 1000).toISOString() : new Date().toISOString()
      const changeValue = Number(payload.ch ?? payload.change ?? 0)
      const change = `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}%`

      return {
        symbol,
        source: 'tradingview',
        price: close,
        change,
        high,
        low,
        updatedAt: time,
        candles: [
          {
            time,
            open,
            high,
            low,
            close,
          },
        ],
      }
    }
  }

  if (Array.isArray(value.candles)) {
    return { symbol, ...value }
  }

  if (Array.isArray(value.data) && value.data.length > 0 && typeof value.data[0] === 'object') {
    return { symbol, ...value, candles: value.data }
  }

  if (
    value.s === 'ok' &&
    Array.isArray(value.t) &&
    Array.isArray(value.o) &&
    Array.isArray(value.h) &&
    Array.isArray(value.l) &&
    Array.isArray(value.c)
  ) {
    const candles = value.t.map((time: number, index: number) => ({
      time: new Date(time * 1000).toISOString(),
      open: Number(value.o[index]),
      high: Number(value.h[index]),
      low: Number(value.l[index]),
      close: Number(value.c[index]),
    }))
    const last = candles[candles.length - 1]
    const price = Number(last.close)
    const open = Number(candles[0].open) || price
    const change = open ? (((price - open) / open) * 100).toFixed(2) : '0.00'

    return {
      symbol,
      price,
      change: `${change.startsWith('-') ? '' : '+'}${change}%`,
      high: Math.max(...candles.map((c: any) => c.high)),
      low: Math.min(...candles.map((c: any) => c.low)),
      updatedAt: last.time,
      candles,
    }
  }

  return null
}

function parseSymbolParts(symbol: string) {
  const pair = symbol.toUpperCase().replace(/\s+/g, '').split('/')
  return pair.length === 2 ? pair : [symbol.toUpperCase(), 'USD']
}

function getTradingViewSymbol(symbol: string) {
  const [base, quote] = parseSymbolParts(symbol)
  if (quote === 'USD') return `BINANCE:${base}USDT`
  if (quote === 'USDT') return `BINANCE:${base}USDT`
  return `BINANCE:${base}${quote}`
}

function isTradingViewDefaultSymbol(symbol: string) {
  const [, quote] = parseSymbolParts(symbol)
  return quote === 'USD' || quote === 'USDT'
}

function getProviderSymbolVariants(symbol: string) {
  const raw = symbol.toUpperCase().replace(/\s+/g, '')
  const noSlash = sanitizeSymbol(symbol)
  const dash = raw.replace('/', '-')
  const underscore = raw.replace('/', '_')
  const usdt = noSlash.replace(/USD$/, 'USDT')

  return {
    raw,
    noSlash,
    dash,
    underscore,
    usdt,
  }
}

function getCryptoId(symbol: string) {
  const [base] = parseSymbolParts(symbol)
  return coinGeckoIdMap[base] || base.toLowerCase()
}

async function fetchCryptoOhlc(symbol: string, limit: number) {
  const id = getCryptoId(symbol)
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/ohlc?vs_currency=usd&days=1`)
    const ohlc = await safeJson(res)
    if (!res.ok || !Array.isArray(ohlc) || ohlc.length === 0) return null

    const candles = ohlc
      .slice(-limit)
      .map((item: any) => ({
        time: new Date(item[0]).toISOString(),
        open: Number(item[1]),
        high: Number(item[2]),
        low: Number(item[3]),
        close: Number(item[4]),
      }))

    const last = candles[candles.length - 1]
    const price = Number(last.close)
    const open = Number(candles[0].open) || price
    const change = open ? (((price - open) / open) * 100).toFixed(2) : '0.00'

    return {
      symbol,
      source: 'coingecko',
      price,
      change: `${change.startsWith('-') ? '' : '+'}${change}%`,
      high: Math.max(...candles.map((c) => c.high)),
      low: Math.min(...candles.map((c) => c.low)),
      updatedAt: last.time,
      candles,
    }
  } catch (error) {
    return null
  }
}

function isCryptoSymbol(symbol: string) {
  const [base, quote] = parseSymbolParts(symbol)
  return quote === 'USD' || quote === 'USDT'
}

async function fetchBinanceOhlc(symbol: string, limit: number) {
  const [base, quote] = parseSymbolParts(symbol)
  const normalizedQuote = quote === 'USD' ? 'USDT' : quote
  const pair = `${base}${normalizedQuote}`
  const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(pair)}&interval=1m&limit=${limit}`

  try {
    const res = await fetch(url)
    const data = await safeJson(res)
    if (!res.ok || !Array.isArray(data) || data.length === 0) return null

    const candles = data.map((item: any) => ({
      time: new Date(Number(item[0])).toISOString(),
      open: Number(item[1]),
      high: Number(item[2]),
      low: Number(item[3]),
      close: Number(item[4]),
    }))

    const last = candles[candles.length - 1]
    const price = Number(last.close)
    const open = Number(candles[0].open) || price
    const change = open ? (((price - open) / open) * 100).toFixed(2) : '0.00'

    return {
      symbol,
      source: 'binance',
      price,
      change: `${change.startsWith('-') ? '' : '+'}${change}%`,
      high: Math.max(...candles.map((c) => c.high)),
      low: Math.min(...candles.map((c) => c.low)),
      updatedAt: last.time,
      candles,
    }
  } catch (error) {
    return null
  }
}

async function fetchForexOhlc(symbol: string, limit: number) {
  const [base, quote] = parseSymbolParts(symbol)
  const now = new Date()
  const endDate = new Date(now)
  const startDate = new Date(now)
  startDate.setDate(now.getDate() - Math.max(limit, 7))

  const frankfurterUrl = `https://api.frankfurter.app/${startDate.toISOString().slice(0, 10)}..${endDate.toISOString().slice(0, 10)}?from=${encodeURIComponent(base)}&to=${encodeURIComponent(quote)}`

  try {
    const res = await fetch(frankfurterUrl)
    const data = await safeJson(res)
    if (!res.ok || !data || !data.rates) return null

    const dates = Object.keys(data.rates).sort()
    const candles = dates
      .slice(-limit)
      .map((date) => {
        const rate = Number(data.rates[date]?.[quote])
        return {
          time: new Date(date).toISOString(),
          open: rate,
          high: rate,
          low: rate,
          close: rate,
        }
      })
      .filter((c) => Number.isFinite(c.close))

    if (candles.length === 0) return null
    const last = candles[candles.length - 1]
    const price = Number(last.close)
    const open = Number(candles[0].open) || price
    const change = open ? (((price - open) / open) * 100).toFixed(2) : '0.00'

    return {
      symbol,
      source: 'frankfurter',
      price,
      change: `${change.startsWith('-') ? '' : '+'}${change}%`,
      high: Math.max(...candles.map((c) => c.high)),
      low: Math.min(...candles.map((c) => c.low)),
      updatedAt: last.time,
      candles,
    }
  } catch (error) {
    return null
  }
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
  const cacheKey = `${symbol}|${period}|${limit}`

  const cached = marketCandlesCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data)
  }

  const providerKey = process.env.MARKET_CANDLES_API_KEY || process.env.MARKET_CANDLES_PROVIDER_KEY || ''
  const providerBearer = process.env.MARKET_CANDLES_PROVIDER_BEARER || ''
  const providerHost = process.env.MARKET_CANDLES_PROVIDER_HOST || 'tradingview-data1.p.rapidapi.com'
  const providerAuthHeader = process.env.MARKET_CANDLES_PROVIDER_AUTH_HEADER || 'Authorization'
  const providerAuthScheme = process.env.MARKET_CANDLES_PROVIDER_AUTH_SCHEME || 'Bearer'
  let providerTemplate = process.env.MARKET_CANDLES_PROVIDER_URL || ''
  const providerVariants = getProviderSymbolVariants(symbol)
  const tradingViewSymbol = getTradingViewSymbol(symbol)

  if (!providerTemplate && providerKey && isTradingViewDefaultSymbol(symbol)) {
    providerTemplate = 'https://tradingview-data1.p.rapidapi.com/api/quote/{tvSymbol}?session=regular&fields=all'
  }

  const providerRateLimitKey = `${providerTemplate}|${providerVariants.noSlash}`
  const providerRateLimitExpires = providerRateLimitCache.get(providerRateLimitKey) || 0

  if (providerTemplate && (providerKey || providerBearer) && providerRateLimitExpires <= Date.now()) {
    const url = providerTemplate
      .replace('{symbol}', encodeURIComponent(providerVariants.noSlash))
      .replace('{symbolRaw}', encodeURIComponent(providerVariants.raw))
      .replace('{symbolDash}', encodeURIComponent(providerVariants.dash))
      .replace('{symbolUnderscore}', encodeURIComponent(providerVariants.underscore))
      .replace('{symbolUsdt}', encodeURIComponent(providerVariants.usdt))
      .replace('{tvSymbol}', encodeURIComponent(tradingViewSymbol))
      .replace('{period}', encodeURIComponent(period))
      .replace('{limit}', encodeURIComponent(String(limit)))
      .replace('{apikey}', encodeURIComponent(providerKey))

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (providerBearer) {
      headers[providerAuthHeader] = `${providerAuthScheme} ${providerBearer}`
    } else if (providerKey) {
      headers['x-rapidapi-host'] = providerHost
      headers['x-rapidapi-key'] = providerKey
    }

    try {
      const res = await fetch(url, { headers })
      const response = await safeJson(res)
      if (res.ok && response) {
        const normalized = normalizeProviderData(response, symbol)
        if (normalized) {
          return NextResponse.json(cacheResponse(cacheKey, { source: 'provider', ...normalized }))
        }
      }

      // Handle rate limiting explicitly: cache the rate-limited state briefly and then continue to fallback sources.
      if (res.status === 429) {
        console.warn('market/candles provider failed or rate limited', { status: res.status, statusText: res.statusText })
        providerRateLimitCache.set(providerRateLimitKey, Date.now() + RATE_LIMIT_TTL_MS)
      } else if (!res.ok) {
        console.warn('market/candles provider failed, continuing to alternative sources', { status: res.status, statusText: res.statusText })
      }
    } catch (error) {
      console.warn('market/candles provider fetch failed', error)
    }
  }

  let cryptoLive = null
  if (isCryptoSymbol(symbol)) {
    cryptoLive = await fetchCryptoOhlc(symbol, limit)
    if (!cryptoLive) {
      cryptoLive = await fetchBinanceOhlc(symbol, limit)
    }
  }

  if (cryptoLive) {
    return NextResponse.json(cacheResponse(cacheKey, cryptoLive))
  }

  const forexLive = await fetchForexOhlc(symbol, limit)
  if (forexLive) {
    return NextResponse.json(cacheResponse(cacheKey, forexLive))
  }

  // Only return mock/sample data when explicitly allowed via env.
  const allowMock = process.env.MARKET_CANDLES_ALLOW_MOCK === 'true'
  if (allowMock) {
    const mockData = makeMockResponse(symbol, period, limit)
    return NextResponse.json(cacheResponse(cacheKey, { source: 'mock', ...mockData }))
  }

  return NextResponse.json({ error: 'No live market data available' }, { status: 503 })
}
