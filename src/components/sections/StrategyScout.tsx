"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { createChart, CandlestickSeries, type CandlestickData, type UTCTimestamp } from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

const marketOptions = [
  { symbol: 'BTC/USD', label: 'Bitcoin', category: 'Crypto' },
  { symbol: 'ETH/USD', label: 'Ethereum', category: 'Crypto' },
  { symbol: 'XRP/USD', label: 'Ripple', category: 'Crypto' },
  { symbol: 'SOL/USD', label: 'Solana', category: 'Crypto' },
  { symbol: 'LINK/USD', label: 'Chainlink', category: 'Crypto' },
  { symbol: 'CRO/USD', label: 'Cronos', category: 'Crypto' },
  { symbol: 'PENGU/USD', label: 'Pudgy Penguins', category: 'Crypto' },
  { symbol: 'EUR/USD', label: 'Euro / Dollar', category: 'Forex' },
  { symbol: 'GBP/JPY', label: 'Pound / Yen', category: 'Forex' },
  { symbol: 'USD/JPY', label: 'Dollar / Yen', category: 'Forex' },
];

const categories = ['Crypto', 'Forex'] as const;

function formatPrice(value: number | string) {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 6 }).format(value);
  }
  return String(value);
}

function CandlestickChart({ data }: { data: CandlestickData[] }) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartApiRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 380,
      layout: {
        background: { color: 'transparent' },
        textColor: '#E5E7EB',
      },
      grid: {
        vertLines: { color: 'rgba(148,163,184,0.08)' },
        horzLines: { color: 'rgba(148,163,184,0.08)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(148,163,184,0.16)',
      },
      timeScale: {
        borderColor: 'rgba(148,163,184,0.16)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#34D399',
      downColor: '#F87171',
      borderVisible: false,
      wickUpColor: '#34D399',
      wickDownColor: '#F87171',
    });

    chartApiRef.current = chart;
    seriesRef.current = series;

    return () => chart.remove();
  }, []);

  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;
    seriesRef.current.setData(data);
    chartApiRef.current?.timeScale().fitContent();
  }, [data]);

  return <div ref={chartRef} className="w-full h-[380px] rounded-[28px] overflow-hidden" />;
}

export default function StrategyScout() {
  const [category, setCategory] = useState<typeof categories[number]>('Crypto');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
  const [marketDetails, setMarketDetails] = useState<{
    source?: string;
    price?: number | string;
    change?: string;
    high?: number;
    low?: number;
    candles?: CandlestickData[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(
    () => marketOptions.filter((item) => item.category === category),
    [category]
  );

  useEffect(() => {
    if (!options.length) return;
    setSelectedSymbol(options[0].symbol);
  }, [category]);

  useEffect(() => {
    const loadMarket = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/market/candles?symbol=${encodeURIComponent(selectedSymbol)}&period=1m&limit=20`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setError(body?.error || 'Unable to load market data');
          setMarketDetails({});
          return;
        }

        const json = await res.json();
        if (!json || !json.candles) {
          setError('No live market data available');
          setMarketDetails({});
          return;
        }

        const candles = json.candles.map((c: any) => ({
          time: Math.floor(new Date(c.time).getTime() / 1000) as UTCTimestamp,
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
        }));

        setMarketDetails({
          source: json.source,
          price: json.price,
          change: json.change,
          high: json.high,
          low: json.low,
          candles,
        });
      } catch (err) {
        setError('Unable to load market data');
        setMarketDetails({});
      } finally {
        setLoading(false);
      }
    };

    loadMarket();
    const interval = setInterval(loadMarket, 15000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const selectedOption = marketOptions.find((item) => item.symbol === selectedSymbol);

  return (
    <section id="market-selector" className="py-24 md:py-32 relative z-10 bg-[#080D1C]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          <div className="lg:w-[360px] space-y-8">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-white/50">Market Selector</p>
                  <h2 className="mt-3 text-3xl md:text-4xl font-headline font-bold text-white">Crypto & Forex</h2>
                </div>
                <div className="rounded-3xl bg-primary/10 text-primary p-3">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${category === item ? 'bg-primary text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {options.map((item) => {
                  const active = item.symbol === selectedSymbol;
                  return (
                    <button
                      key={item.symbol}
                      type="button"
                      onClick={() => setSelectedSymbol(item.symbol)}
                      className={`w-full text-left rounded-[24px] border px-5 py-4 transition ${active ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-base">{item.label}</p>
                          <p className="text-sm text-white/50">{item.symbol}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">{active ? 'Selected' : 'View'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-3xl">
              <p className="text-sm uppercase tracking-[0.3em] text-white/40 mb-4">Live rates</p>
              <div className="grid gap-4">
                {options.slice(0, 4).map((item) => {
                  const active = item.symbol === selectedSymbol;
                  return (
                    <div key={item.symbol} className={`rounded-3xl p-4 ${active ? 'bg-primary/10 border border-primary/20' : 'bg-white/5 border border-white/10'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-white/50">{item.label}</p>
                          <p className="text-lg font-bold text-white">{item.symbol}</p>
                        </div>
                        <span className="text-xs uppercase tracking-[0.35em] text-white/40">{item.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-white/50">{selectedOption?.category ?? 'Market'} Market</p>
                  <h3 className="mt-2 text-4xl md:text-5xl font-headline font-bold text-white">{selectedOption?.label ?? selectedSymbol}</h3>
                </div>
                <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm font-semibold text-white/80">
                  Source: {marketDetails.source ?? 'Live'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-[24px] bg-black/40 p-5 border border-white/10">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/40">Current Price</p>
                  <p className="mt-3 text-3xl font-bold text-white">{marketDetails.price ? formatPrice(marketDetails.price) : '—'}</p>
                </div>
                <div className="rounded-[24px] bg-black/40 p-5 border border-white/10">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/40">24h Change</p>
                  <p className={`mt-3 text-3xl font-bold ${marketDetails.change?.startsWith('+') ? 'text-emerald-300' : 'text-rose-300'}`}>{marketDetails.change ?? '—'}</p>
                </div>
                <div className="rounded-[24px] bg-black/40 p-5 border border-white/10">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/40">Range</p>
                  <p className="mt-3 text-sm font-semibold text-white/80">{marketDetails.high ? formatPrice(marketDetails.high) : '—'} / {marketDetails.low ? formatPrice(marketDetails.low) : '—'}</p>
                </div>
              </div>

              {error ? (
                <div className="rounded-[30px] border border-rose-500/20 bg-rose-500/10 p-8 text-white">
                  <p className="font-semibold">{error}</p>
                  <p className="mt-2 text-sm text-white/70">Try selecting another asset or refresh the page.</p>
                </div>
              ) : (
                <div className="rounded-[30px] overflow-hidden border border-white/10 bg-black/30">
                  {loading ? (
                    <div className="h-[380px] flex items-center justify-center text-white/60">Loading chart…</div>
                  ) : marketDetails.candles?.length ? (
                    <CandlestickChart data={marketDetails.candles} />
                  ) : (
                    <div className="h-[380px] flex items-center justify-center text-white/50">Select a market to view the live candlestick.</div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-white/50">Market insight</p>
                  <h4 className="mt-2 text-2xl font-headline font-bold text-white">Real-time performance</h4>
                </div>
                <ArrowRight className="w-6 h-6 text-white/40" />
              </div>
              <p className="text-white/60 leading-relaxed">Browse crypto and forex pairs from the left panel, then watch their live rate and candlestick chart update instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
