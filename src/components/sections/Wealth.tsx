
"use client";

import { Star, Globe, ShieldCheck, Fingerprint } from 'lucide-react';

export default function Wealth() {
  return (
    <section className="bg-[#080D1B] -mt-10 md:-mt-36 pt-0 pb-24 md:pt-0 md:pb-40 relative">
      <div className="container mx-auto px-6 text-center relative z-10 pt-12 md:pt-16">
        <div className="relative z-20 pb-16 md:pb-24">
          <div className="space-y-12 md:space-y-16">
            <div className="space-y-8">
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-headline font-bold text-white tracking-normal leading-[1.2]">
                Built for wealth, <br className="hidden sm:block" /> made for everyone
              </h2>
              <div className="flex flex-wrap justify-center gap-10 md:gap-24">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-4 text-primary">
                    <span className="font-bold text-5xl md:text-7xl">4.6</span>
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 md:w-8 md:h-8 fill-primary text-primary" />)}
                    </div>
                  </div>
                  <span className="text-xs md:text-sm uppercase tracking-[0.4em] font-bold text-white/40">App Store Rating</span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-4 text-primary">
                    <span className="font-bold text-5xl md:text-7xl">4.5</span>
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 md:w-8 md:h-8 fill-primary text-primary" />)}
                    </div>
                  </div>
                  <span className="text-xs md:text-sm uppercase tracking-[0.4em] font-bold text-white/40">Google Play Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-[90rem] mx-auto text-left relative z-10">
          {[
            { 
              icon: <Globe className="w-10 h-10 md:w-14 md:h-14" />, 
              title: "150m+ users globally", 
              desc: "Trusted by institutional and retail investors around the world since 2016." 
            },
            { 
              icon: <ShieldCheck className="w-10 h-10 md:w-14 md:h-14" />, 
              title: "Sign up in minutes", 
              desc: "Our friction-less onboarding ensures you begin trading in a matter of seconds." 
            },
            { 
              icon: <Fingerprint className="w-10 h-10 md:w-14 md:h-14" />, 
              title: "Zero-fee deposits", 
              desc: "Experience fluid liquidity. Fund your wallet with zero cost across major currencies." 
            }
          ].map((item, i) => (
            <div key={i} className="p-10 md:p-14 rounded-[3rem] md:rounded-[4.5rem] bg-white/5 backdrop-blur-xl border border-white/5 space-y-10 hover:border-primary/30 transition-all group shadow-2xl">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-[28px] md:rounded-[40px] bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110 shadow-inner border border-primary/20">
                {item.icon}
              </div>
              <div className="space-y-6 md:space-y-8">
                <h3 className="text-3xl md:text-4xl font-bold text-white tracking-normal leading-[1.2]">{item.title}</h3>
                <p className="text-white/50 text-lg md:text-xl leading-[1.4] font-medium">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
