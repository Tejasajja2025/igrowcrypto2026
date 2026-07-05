'use client';

import { useEffect, useState } from 'react';

const tickerSymbols = [
  'BTC/USD',
  'ETH/USD',
  'EUR/USD',
  'SOL/USD',
  'GBP/JPY',
  'XAU/USD',
  'LINK/USD',
  'USD/JPY',
];

const getMarketSymbol = (symbol: string) => symbol.includes('/') ? symbol : `${symbol}/USD`;

const isMockMarketResponse = (response: any) => response?.source === 'mock';

export default function AssetTicker() {
  const [tickerData, setTickerData] = useState<Record<string, { price: string; change: string }>>({});

  useEffect(() => {
    let mounted = true;

    const loadTickerData = async () => {
      try {
        const entries = await Promise.all(
          tickerSymbols.map(async (symbol) => {
              const res = await fetch(`/api/market/candles?symbol=${encodeURIComponent(getMarketSymbol(symbol))}&period=1m&limit=1`);
            if (!res.ok) return null;
            const json = await res.json();
            if (isMockMarketResponse(json)) return null;
            if (!json || json.price == null || json.change == null) return null;

            const price = typeof json.price === 'number'
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 6 }).format(json.price)
              : String(json.price);

            return [symbol, {
              price,
              change: String(json.change),
            }] as const;
          })
        );

        if (!mounted) return;
        setTickerData(Object.fromEntries(entries.filter(Boolean) as Array<[string, { price: string; change: string }]>));
      } catch {
        // ignore fetch errors
      }
    };

    loadTickerData();
    const interval = setInterval(loadTickerData, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full bg-secondary overflow-hidden border-y border-white/5 py-3">
      <div className="flex animate-scroll whitespace-nowrap">
        {tickerSymbols.concat(tickerSymbols).map((symbol, i) => {
          const asset = tickerData[symbol];
          const price = asset?.price ?? 'Unavailable';
          const change = asset?.change ?? '—';
          const isPositive = change.startsWith('+');

          return (
            <div key={`${symbol}-${i}`} className="flex items-center gap-6 px-8 border-r border-white/5 last:border-0">
              <span className="font-headline font-medium text-sm text-foreground">{symbol}</span>
              <span className="font-code text-sm font-medium">{price}</span>
              <span className={`text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
