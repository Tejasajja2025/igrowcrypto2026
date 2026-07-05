"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp, Flame, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { createChart, CandlestickSeries, type CandlestickData, type UTCTimestamp } from 'lightweight-charts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const topAssets = [
  { 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    price: 'Loading…',
    change: '--',
    isUp: true,
    iconColor: 'bg-[#F7931A]',
    iconText: 'B',
    line: 'M0 80 L5 75 L10 85 L15 65 L20 70 L25 50 L30 55 L35 30 L40 40 L45 20 L50 25 L55 10 L60 15 L65 5 L70 8 L75 2 L80 12 L85 5 L90 15 L95 10 L100 20', 
    stroke: '#10B981' 
  },
  { 
    name: 'Ripple', 
    symbol: 'XRP', 
    price: 'Loading…',
    change: '--',
    isUp: true,
    iconColor: 'bg-[#346AA9]',
    iconText: 'X',
    line: 'M0 50 L10 45 L20 55 L30 40 L40 50 L50 35 L60 45 L70 30 L80 40 L90 25 L100 35', 
    stroke: '#10B981' 
  },
  { 
    name: 'Euro / Dollar', 
    symbol: 'EUR/USD', 
    price: 'Loading…',
    change: '--',
    isUp: true,
    iconColor: 'bg-[#5563C1]',
    iconText: 'EUR',
    line: 'M0 70 L10 65 L20 75 L30 60 L40 68 L50 55 L60 63 L70 52 L80 58 L90 45 L100 50', 
    stroke: '#38BDF8' 
  },
  { 
    name: 'Pound / Yen', 
    symbol: 'GBP/JPY', 
    price: 'Loading…',
    change: '--',
    isUp: true,
    iconColor: 'bg-[#0F766E]',
    iconText: 'GJ',
    line: 'M0 45 L10 50 L20 48 L30 60 L40 55 L50 70 L60 65 L70 80 L80 75 L90 90 L100 85', 
    stroke: '#FB7185' 
  },
  { 
    name: 'Dollar / Yen', 
    symbol: 'USD/JPY', 
    price: 'Loading…',
    change: '--',
    isUp: true,
    iconColor: 'bg-[#F97316]',
    iconText: 'UJ',
    line: 'M0 60 L10 55 L20 65 L30 50 L40 58 L50 45 L60 53 L70 40 L80 48 L90 35 L100 42', 
    stroke: '#22C55E' 
  },
  { 
    name: 'Ethereum', 
    symbol: 'ETH', 
    price: 'Loading…',
    change: '--',
    isUp: false,
    iconColor: 'bg-[#627EEA]',
    iconText: 'E',
    line: 'M0 20 L5 25 L10 15 L15 35 L20 30 L25 50 L30 45 L35 70 L40 60 L45 80 L50 75 L55 90 L60 85 L65 95 L70 92 L75 98 L80 88 L85 92 L90 82 L95 87 L100 77', 
    stroke: '#FF5E5E' 
  },
  { 
    name: 'Solana', 
    symbol: 'SOL', 
    price: 'Loading…',
    change: '--',
    isUp: true,
    iconColor: 'bg-[#14F195]',
    iconText: 'S',
    line: 'M0 90 L10 85 L20 95 L30 75 L40 80 L50 60 L60 65 L70 40 L80 45 L90 20 L100 25', 
    stroke: '#10B981' 
  },
  { 
    name: 'Cronos', 
    symbol: 'CRO', 
    price: 'Loading…',
    change: '--',
    isUp: false,
    iconColor: 'bg-[#002D74]',
    iconText: 'C',
    line: 'M0 30 L10 40 L20 35 L30 60 L40 55 L50 80 L60 75 L70 95 L80 90 L90 98 L100 85', 
    stroke: '#FF5E5E' 
  },
  { 
    name: 'Pudgy Penguins', 
    symbol: 'PENGU', 
    price: 'Loading…',
    change: '--',
    isUp: true,
    iconColor: 'bg-slate-200',
    iconText: 'P',
    line: 'M0 80 L10 70 L20 75 L30 50 L40 60 L50 30 L60 45 L70 10 L80 25 L90 5 L100 15', 
    stroke: '#10B981' 
  },
];

export default function MarketCatalog() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  const [marketData, setMarketData] = useState<Record<string, { price: string; change: string; isUp: boolean }>>({});

  const getMarketSymbol = (symbol: string) => symbol.includes('/') ? symbol : `${symbol}/USD`;

  useEffect(() => {
    let mounted = true;

    const loadMarketPrices = async () => {
      try {
        const entries = await Promise.all(
          topAssets.map(async (asset) => {
            const symbol = getMarketSymbol(asset.symbol);
            const res = await fetch(`/api/market/candles?symbol=${encodeURIComponent(symbol)}&period=1m&limit=20`);
            if (!res.ok) return null;
            const json = await res.json();
            if (!json || json.price == null || json.change == null || json.source === 'mock') return null;

            const price = typeof json.price === 'number'
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 6 }).format(json.price)
              : String(json.price);

            return [asset.symbol, {
              price,
              change: String(json.change),
              isUp: String(json.change).startsWith('+'),
            }] as const;
          })
        );

        if (!mounted) return;

        const data = Object.fromEntries(entries.filter(Boolean) as Array<[string, { price: string; change: string; isUp: boolean }]>)
        setMarketData(data);
      } catch {
        // ignore load errors
      }
    };

    loadMarketPrices();
    const interval = setInterval(loadMarketPrices, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  function MiniCandlestick({ symbol }: { symbol: string }) {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const seriesRef = useRef<any>(null);
    const chartApiRef = useRef<any>(null);
    const [data, setData] = useState<CandlestickData[]>([]);

    useEffect(() => {
      if (!chartRef.current) return;

      const chart = createChart(chartRef.current, {
        width: 300,
        height: 140,
        layout: {
          background: { color: 'transparent' },
          textColor: '#E5E7EB',
        },
        grid: {
          vertLines: { color: 'transparent' },
          horzLines: { color: 'transparent' },
        },
        rightPriceScale: {
          visible: false,
          borderColor: 'transparent',
        },
        timeScale: {
          visible: true,
          borderColor: 'transparent',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#4ade80',
        downColor: '#fb7185',
        borderVisible: false,
        wickUpColor: '#4ade80',
        wickDownColor: '#fb7185',
      });

      chartApiRef.current = chart;
      seriesRef.current = series;

      return () => chart.remove();
    }, []);

    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          const symbolWithPair = getMarketSymbol(symbol);
          const res = await fetch(`/api/market/candles?symbol=${encodeURIComponent(symbolWithPair)}&period=1m&limit=20`);
          const json = await res.json();
          if (!mounted || !res.ok || !json?.candles || json.source === 'mock') return;

          const chartData = json.candles.map((c: any) => ({
            time: Math.floor(new Date(c.time).getTime() / 1000) as UTCTimestamp,
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close),
          }));

          setData(chartData);
        } catch {
          // ignore
        }
      };
      load();
      const id = setInterval(load, 15000);
      return () => {
        mounted = false;
        clearInterval(id);
      };
    }, [symbol]);

    useEffect(() => {
      if (!seriesRef.current || data.length === 0) return;
      seriesRef.current.setData(data);
      chartApiRef.current?.timeScale().fitContent();
    }, [data]);

    return <div ref={chartRef} className="w-full h-full min-h-[140px]" />;
  }

  function LiveMarket({ symbol, stroke }: { symbol: string; stroke: string }) {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          const symbolWithPair = getMarketSymbol(symbol);
          const res = await fetch(`/api/market/candles?symbol=${encodeURIComponent(symbolWithPair)}&period=1m&limit=30`);
          const json = await res.json();
          if (mounted && res.ok && json?.candles && json.source !== 'mock') setData(json);
        } catch (e) {
          // ignore
        }
      };
      load();
      const id = setInterval(load, 15000);
      return () => {
        mounted = false;
        clearInterval(id);
      };
    }, [symbol]);

    useEffect(() => {
      if (!data || !Array.isArray(data.candles) || !chartRef.current) return;

      const chart = createChart(chartRef.current, {
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
        localization: {
          priceFormatter: (price: number) => `$${price.toFixed(2)}`,
        },
      });

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#4ade80',
        downColor: '#fb7185',
        borderVisible: false,
        wickUpColor: '#4ade80',
        wickDownColor: '#fb7185',
      });

      const chartData: CandlestickData[] = data.candles.map((c: any) => ({
        time: Math.floor(new Date(c.time).getTime() / 1000) as UTCTimestamp,
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
      }));

      candleSeries.setData(chartData);
      chart.timeScale().fitContent();

      return () => chart.remove();
    }, [data]);

    if (!data || !Array.isArray(data.candles)) {
      return <div className="w-full h-full flex items-center justify-center text-white/40">Live data unavailable</div>;
    }

    return (
      <div className="w-full h-full text-white/80">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-bold">{symbol.includes('/') ? symbol : `${symbol}/USD`}</div>
          <div className="text-right">
            <div className="text-2xl font-semibold">{data.price}</div>
            <div className={`text-sm ${String(data.change).startsWith('-') ? 'text-rose-400' : 'text-emerald-300'}`}>{data.change}</div>
          </div>
        </div>
        <div ref={chartRef} className="w-full h-full min-h-[240px]" />
      </div>
    );
  }

  return (
    <section id="market" className="pt-16 md:pt-24 pb-12 relative overflow-hidden">
      {/* Dynamic Background Gradient matching Hero flow */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ background: 'linear-gradient(to bottom, #080D1B 0%, #273D5D 30%, #A3B3CA 70%, #EFEFEF 100%)' }} 
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold tracking-normal text-white leading-[1.3] drop-shadow-md">
              Modular Catalog <br className="hidden sm:block" />
              <span className="text-white/70">Precision data at your fingertips.</span>
            </h2>
            <Link href="#" className="inline-flex items-center text-primary font-bold hover:opacity-80 transition-opacity gap-2 text-[10px] md:text-sm uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
              View Live Prices
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            <div className="flex bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/10 overflow-hidden">
              <Button size="sm" variant="ghost" className="rounded-full bg-primary text-black hover:bg-primary/90 font-bold px-4 md:px-6 h-8 md:h-10 text-[10px] md:text-xs">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Trending
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full text-white/60 hover:text-white px-4 md:px-6 font-bold h-8 md:h-10 text-[10px] md:text-xs">
                <Flame className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Top Movers
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={scrollPrev} variant="outline" size="icon" className="rounded-full border-white/20 h-9 w-9 md:h-11 md:w-11 hover:bg-white/10 text-white bg-black/10 backdrop-blur-sm">
                <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
              </Button>
              <Button onClick={scrollNext} variant="outline" size="icon" className="rounded-full border-white/20 h-9 w-9 md:h-11 md:w-11 hover:bg-white/10 text-white bg-black/10 backdrop-blur-sm">
                <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6 pb-4">
            {topAssets.map((asset, idx) => (
              <Dialog key={idx}>
                <DialogTrigger asChild>
                  <div className="flex-[0_0_auto] min-w-[280px] md:min-w-[320px] bg-card/60 backdrop-blur-2xl rounded-[24px] md:rounded-[32px] border border-white/10 p-6 md:p-8 relative overflow-hidden group hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-black/50">
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-6 md:mb-8">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${asset.iconColor} flex items-center justify-center font-headline font-bold text-lg md:text-xl text-white shadow-2xl`}>
                            {asset.iconText}
                          </div>
                          <div>
                            <h3 className="font-headline font-bold text-base md:text-lg text-white leading-tight">{asset.name}</h3>
                            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{asset.symbol}</span>
                          </div>
                        </div>
                        {(() => {
                          const current = marketData[asset.symbol]
                          const change = current?.change ?? asset.change
                          const isUp = current?.isUp ?? asset.isUp
                          return (
                            <div className={`text-[10px] md:text-sm font-bold flex items-center gap-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                              {isUp ? '▲' : '▼'} {change}
                            </div>
                          )
                        })()}
                      </div>

                      <div className="h-24 md:h-32 w-full mb-6 md:mb-8 relative -mx-8 overflow-hidden">
                        <MiniCandlestick symbol={asset.symbol} />
                      </div>

                      <div className="flex items-end justify-between mt-auto">
                        <div className="space-y-1">
                          <div className="text-xl md:text-2xl font-code font-bold text-white tracking-tight">
                            {marketData[asset.symbol]?.price ?? 'Unavailable'}
                          </div>
                          <div className="text-[8px] md:text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Market Value (USD)</div>
                        </div>
                        <Button size="sm" className="bg-primary text-black font-bold px-4 md:px-6 rounded-xl hover:bg-primary/80 transition-all h-9 md:h-10 shadow-lg shadow-primary/20 text-xs">
                          Buy
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                
                <DialogContent className="bg-[#0C1222]/95 backdrop-blur-3xl border-white/10 text-white max-w-2xl p-0 overflow-hidden rounded-[24px] md:rounded-[32px] shadow-2xl shadow-black w-[95vw] md:w-full">
                  <div className="p-6 md:p-12 space-y-6 md:space-y-10">
                    <DialogHeader className="flex-row items-center gap-4 md:gap-6 space-y-0">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${asset.iconColor} flex items-center justify-center font-headline font-bold text-xl md:text-3xl text-white shadow-2xl`}>
                        {asset.iconText}
                      </div>
                      <div className="text-left space-y-0.5 md:space-y-1">
                        <DialogTitle className="text-xl md:text-3xl font-headline font-bold tracking-tight">{asset.name} Analytics</DialogTitle>
                        <p className="text-white/50 font-medium uppercase tracking-widest text-[8px] md:text-xs flex items-center gap-2">
                          <Activity className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          {asset.symbol} / USD Real-Time Performance
                        </p>
                      </div>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 md:gap-12 bg-white/5 p-4 md:p-8 rounded-[16px] md:rounded-[24px] border border-white/5">
                      <div className="space-y-1 md:space-y-2">
                        <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-white/40">Current Rate</p>
                        <div className="text-xl md:text-4xl font-code font-bold text-white tracking-tighter">{marketData[asset.symbol]?.price ?? 'Unavailable'}</div>
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-white/40">24h Performance</p>
                        <div className={`text-xl md:text-4xl font-code font-bold tracking-tighter ${marketData[asset.symbol]?.isUp ?? asset.isUp ? 'text-green-400' : 'text-red-400'}`}>
                          {marketData[asset.symbol]?.change ?? '--'}
                        </div>
                      </div>
                    </div>

                    <div className="h-48 md:h-72 w-full bg-[#080D1B] rounded-[20px] md:rounded-[32px] border border-white/10 p-4 md:p-10 relative group overflow-hidden">
                      <LiveMarket symbol={asset.symbol} stroke={asset.stroke} />
                      <div className="absolute top-4 right-4 md:top-6 md:right-8 flex gap-1 md:gap-2">
                        {['1H', '24H', '1W'].map(time => (
                          <Button key={time} variant="ghost" size="sm" className={`h-6 md:h-8 rounded-lg text-[8px] md:text-[10px] font-bold tracking-widest px-2 md:px-3 ${time === '24H' ? 'bg-primary text-black' : 'bg-white/5 text-white/50'}`}>
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                      <Button className="flex-1 h-12 md:h-16 rounded-[12px] md:rounded-[20px] bg-primary text-black hover:bg-primary/90 font-bold text-base md:text-lg shadow-2xl shadow-primary/20">Buy {asset.name}</Button>
                      <Button variant="outline" className="flex-1 h-12 md:h-16 rounded-[12px] md:rounded-[20px] border-white/10 hover:bg-white/5 font-bold text-base md:text-lg text-white">Advanced View</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
