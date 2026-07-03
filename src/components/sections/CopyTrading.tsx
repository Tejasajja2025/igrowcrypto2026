
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ShieldCheck, Zap, BarChart3, Globe, Coins, ArrowRight } from 'lucide-react';
import { safeJson } from '@/lib/utils';

const tradingCategories = [
  {
    title: "Forex Copy Trading",
    icon: <Globe className="w-8 h-8 md:w-10 md:h-10 text-primary" />,
    description: "Mirror institutional strategies across major, minor, and exotic pairs with lightning-fast execution.",
    stats: "18.5% Avg Monthly Yield",
    features: ["Major Pairs (EUR/USD)", "High-Liquidity Execution", "24/5 Automated"]
  },
  {
    title: "Crypto Copy Trading",
    icon: <Coins className="w-8 h-8 md:w-10 md:h-10 text-primary" />,
    description: "Connect to elite crypto traders. Scale your portfolio with automated Bitcoin and Altcoin strategies.",
    stats: "32.1% Avg Monthly Yield",
    features: ["BTC & ETH Strategies", "DeFi Pulse Tracking", "24/7 Market Coverage"]
  }
];

export default function CopyTrading() {
  const [data, setData] = useState({
    title: "Precision Copy Trading",
    description: "Mirror the performance of the world's most successful traders. Precision execution for Forex and Crypto markets.",
    videoUrl: "/Untitled design.mp4"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        const data = await safeJson(response);
        if (response.ok && data?.success && data.content?.copyTrading) {
          setData(data.content.copyTrading);
        } else if (!response.ok) {
          console.warn('CopyTrading content fetch failed', response.status, data);
        }
      } catch (error) {
        console.error('Error fetching copy trading content:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <section id="copy-trading" className="py-24 md:py-32 bg-[#080D1B] relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="w-full mb-16 md:mb-24 rounded-[30px] md:rounded-[50px] overflow-hidden border border-white/5 shadow-2xl bg-black/40 aspect-video">
            <video 
              src={data.videoUrl} 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="w-full h-full object-cover opacity-90"
            />
          </div>

          <div className="space-y-12 md:space-y-20">
            <div className="space-y-6 text-center md:text-left max-w-4xl">
              <Badge variant="outline" className="border-primary/30 text-primary px-6 py-2 rounded-full bg-primary/5 uppercase tracking-[0.3em] text-[10px] font-bold">
                Institutional Services
              </Badge>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-bold text-white leading-[1.2] tracking-normal">
                {data.title.split('Copy Trading').map((part, i) => (
                  <span key={i}>{part}{i === 0 && <span className="text-primary italic">Copy Trading</span>}</span>
                ))}
              </h2>
              <p className="text-white/50 text-lg md:text-xl lg:text-2xl font-medium leading-[1.4] tracking-normal">
                {data.description}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {tradingCategories.map((cat, i) => (
                <Card 
                  key={i} 
                  className="p-8 md:p-12 rounded-[40px] md:rounded-[50px] bg-white/5 border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BarChart3 className="w-48 h-48 text-white" />
                  </div>
                  
                  <div className="relative z-10 space-y-8 md:space-y-10">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[20px] md:rounded-[24px] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner border border-primary/20">
                      {cat.icon}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{cat.title}</h3>
                      <p className="text-white/40 text-base md:text-lg leading-relaxed font-medium">
                        {cat.description}
                      </p>
                    </div>

                    <div className="py-6 border-y border-white/5">
                      <p className="text-primary font-code text-2xl md:text-3xl font-bold tracking-tight">
                        {cat.stats}
                      </p>
                    </div>

                    <ul className="space-y-4">
                      {cat.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-4 text-white/60 text-sm md:text-base font-medium">
                          <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <Button size="lg" className="w-full h-14 md:h-16 rounded-[20px] md:rounded-[24px] bg-white text-black hover:bg-white/90 font-bold text-lg active:scale-95 transition-all shadow-xl group/btn">
                      Start Copying
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
