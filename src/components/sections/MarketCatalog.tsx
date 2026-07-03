"use client";

import { useState, useCallback, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp, Flame, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
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
    price: '$73,241.50',
    change: '+2.45%',
    isUp: true,
    iconColor: 'bg-[#F7931A]',
    iconText: 'B',
    line: 'M0 80 L5 75 L10 85 L15 65 L20 70 L25 50 L30 55 L35 30 L40 40 L45 20 L50 25 L55 10 L60 15 L65 5 L70 8 L75 2 L80 12 L85 5 L90 15 L95 10 L100 20', 
    stroke: '#10B981' 
  },
  { 
    name: 'Ethereum', 
    symbol: 'ETH', 
    price: '$3,845.12',
    change: '-1.12%',
    isUp: false,
    iconColor: 'bg-[#627EEA]',
    iconText: 'E',
    line: 'M0 20 L5 25 L10 15 L15 35 L20 30 L25 50 L30 45 L35 70 L40 60 L45 80 L50 75 L55 90 L60 85 L65 95 L70 92 L75 98 L80 88 L85 92 L90 82 L95 87 L100 77', 
    stroke: '#FF5E5E' 
  },
  { 
    name: 'Solana', 
    symbol: 'SOL', 
    price: '$182.67',
    change: '+5.82%',
    isUp: true,
    iconColor: 'bg-[#14F195]',
    iconText: 'S',
    line: 'M0 90 L10 85 L20 95 L30 75 L40 80 L50 60 L60 65 L70 40 L80 45 L90 20 L100 25', 
    stroke: '#10B981' 
  },
  { 
    name: 'Cronos', 
    symbol: 'CRO', 
    price: '$0.1542',
    change: '-2.40%',
    isUp: false,
    iconColor: 'bg-[#002D74]',
    iconText: 'C',
    line: 'M0 30 L10 40 L20 35 L30 60 L40 55 L50 80 L60 75 L70 95 L80 90 L90 98 L100 85', 
    stroke: '#FF5E5E' 
  },
  { 
    name: 'Pudgy Penguins', 
    symbol: 'PENGU', 
    price: '$12,450.00',
    change: '+12.50%',
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

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  function LiveMarket({ symbol, stroke }: { symbol: string; stroke: string }) {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          const res = await fetch(`/api/market/candles?symbol=${encodeURIComponent(symbol + '/USD')}&period=1m&limit=30`);
          const json = await res.json();
          if (mounted && res.ok) setData(json);
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

    if (!data || !Array.isArray(data.candles)) {
      return <div className="w-full h-full flex items-center justify-center text-white/40">Live data unavailable</div>;
    }

    const candles = data.candles;
    const allPrices = candles.flatMap((c: any) => [c.high, c.low, c.open, c.close]).filter(Number.isFinite);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);

    const width = 800; const height = 320; const padding = 8;
    const count = candles.length;
    const step = (width - padding * 2) / Math.max(1, count - 1);

    return (
      <div className="w-full h-full text-white/80">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-bold">{symbol}/USD</div>
          <div className="text-right">
            <div className="text-2xl font-semibold">{data.price}</div>
            <div className={`text-sm ${String(data.change).startsWith('-') ? 'text-rose-400' : 'text-emerald-300'}`}>{data.change}</div>
          </div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {candles.map((c: any, i: number) => {
            const x = padding + i * step;
            const yOpen = height - padding - ((c.open - min) / (max - min || 1)) * (height - padding * 2);
            const yClose = height - padding - ((c.close - min) / (max - min || 1)) * (height - padding * 2);
            const yHigh = height - padding - ((c.high - min) / (max - min || 1)) * (height - padding * 2);
            const yLow = height - padding - ((c.low - min) / (max - min || 1)) * (height - padding * 2);
            const candleWidth = Math.max(4, step * 0.6);
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));
            const color = c.close >= c.open ? '#4ade80' : '#fb7185';

            return (
              <g key={i}>
                <line x1={x} x2={x} y1={yHigh} y2={yLow} stroke={color} strokeWidth={1.5} />
                <rect x={x - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyHeight} fill={color} opacity={0.9} />
              </g>
            );
          })}
        </svg>
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
                        <div className={`text-[10px] md:text-sm font-bold flex items-center gap-1 ${asset.isUp ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.isUp ? '▲' : '▼'} {asset.change}
                        </div>
                      </div>

                      <div className="h-24 md:h-32 w-full mb-6 md:mb-8 relative -mx-8 overflow-hidden">
                        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={asset.stroke} stopOpacity="0.4" />
                              <stop offset="100%" stopColor={asset.stroke} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d={`${asset.line} L 100 100 L 0 100 Z`}
                            fill={`url(#gradient-${idx})`}
                          />
                          <path
                            d={asset.line}
                            fill="none"
                            stroke={asset.stroke}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <div className="flex items-end justify-between mt-auto">
                        <div className="space-y-1">
                          <div className="text-xl md:text-2xl font-code font-bold text-white tracking-tight">
                            {asset.price}
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
                        <div className="text-xl md:text-4xl font-code font-bold text-white tracking-tighter">{asset.price}</div>
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-white/40">24h Performance</p>
                        <div className={`text-xl md:text-4xl font-code font-bold tracking-tighter ${asset.isUp ? 'text-green-400' : 'text-red-400'}`}>{asset.change}</div>
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
