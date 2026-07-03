"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Zap, Lock, Globe } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Ecosystem() {
  const getImg = (id: string) => PlaceHolderImages.find(img => img.id === id);

  return (
    <div className="container mx-auto px-6 mb-12">
      <div className="text-center space-y-8 md:space-y-12 mb-16 md:mb-24 relative z-10">
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-bold text-white tracking-normal leading-[1.2] max-w-5xl mx-auto">
          Your crypto journey <br className="hidden sm:block" /> starts here
        </h2>
        <p className="text-white/50 text-base md:text-2xl lg:text-3xl font-medium tracking-normal leading-[1.4] max-w-4xl mx-auto">
          Trade with ease and the lowest fees. Institutional precision meets retail accessibility.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-8">
          <Button size="lg" className="rounded-full w-full sm:w-auto h-12 md:h-16 px-10 md:px-14 font-bold bg-white text-black hover:bg-white/90 text-lg md:text-xl active:scale-95 transition-all">
            Create Account
            <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6" />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto h-12 md:h-16 px-10 md:px-14 font-bold border-white/20 text-white hover:bg-white/10 text-lg md:text-xl active:scale-95 transition-all">
            Get the app
          </Button>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto mb-24 md:mb-32 group px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[60px] md:blur-[120px] rounded-full opacity-30 group-hover:opacity-40 transition-opacity" />
        <div className="relative flex justify-center items-center">
            <Image 
              src={getImg('ecosystem-showcase')?.imageUrl || '/Your crypto journey starts here (1).png'} 
              alt="OrngFinance Ecosystem Showcase" 
              width={1200} 
              height={700} 
              className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-[1.02]"
              priority
            />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-24 relative z-10">
        {[
          { icon: <Globe className="w-8 h-8 md:w-10 md:h-10" />, title: "BTC, ETH, and 400+ crypto", desc: "Buy, sell, and trade in your local currency with deep liquidity" },
          { icon: <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />, title: "Security Protection", desc: "Up to US$250,000 against unauthorized transactions" },
          { icon: <Zap className="w-8 h-8 md:w-10 md:h-10" />, title: "Near-zero trading fees", desc: "Industry-leading rates when you buy crypto with a card" },
          { icon: <Lock className="w-8 h-8 md:w-10 md:h-10" />, title: "Secure by design", desc: "Leading the industry in licenses and global certifications" }
        ].map((item, i) => (
          <div key={i} className="space-y-6 p-8 rounded-[40px] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors group">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[20px] bg-white/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform border border-white/5">
              {item.icon}
            </div>
            <div className="space-y-3">
              <h3 className="text-xl md:text-2xl font-bold text-white leading-[1.2]">{item.title}</h3>
              <p className="text-white/40 text-sm md:text-base leading-relaxed font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
