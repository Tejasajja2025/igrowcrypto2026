
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { safeJson } from '@/lib/utils';

export default function Hero() {
  const router = useRouter();
  const [data, setData] = useState({
    title: "Institutional Global Liquidity Network",
    description: "Connect to the world's most robust trading ecosystem. Precision execution across crypto and forex, powered by Orng's high-fidelity backbone.",
    imageUrl: "/Group 2.png",
    popupTitle: "iGrow Learning Institute Offers",
    popupDescription: "Discover special programs, mentorship access, and exclusive training offers tailored for ambitious traders and learners.",
    popupImageUrl: "/Your crypto journey starts here (1).png",
    popupHighlights: "• Free strategy coaching for early enrollees\n• Monthly market intelligence sessions\n• Direct signal access and trade reviews\n• Mobile-ready learning community",
    popupHowItWorks: "Join the institute, access the trading dashboard, and receive curated education with real-world signal guidance, all optimized for desktop and mobile users."
  });

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        const data = await safeJson(response);
        if (response.ok && data?.success && data.content?.hero) {
          setData(data.content.hero);
        } else if (!response.ok) {
          console.warn('Hero content fetch failed', response.status, data);
        }
      } catch (error) {
        console.error('Error fetching hero content:', error);
      }
    };
    fetchHero();
  }, []);

  const [isOfferOpen, setIsOfferOpen] = useState(true);

  const popupHighlights = (data.popupHighlights || "• Free strategy coaching for early enrollees\n• Monthly market intelligence sessions\n• Direct signal access and trade reviews\n• Mobile-ready learning community").split('\n').filter(Boolean);
  const popupHowItWorks = data.popupHowItWorks || "Join the institute, access the trading dashboard, and receive curated education with real-world signal guidance, all optimized for desktop and mobile users.";

  const handleAdminAccess = () => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('igrow_admin_token') : null;
    router.push(token === 'authenticated' ? '/admin/dashboard' : '/admin');
  };

  return (
    <section 
      className="relative w-full m-0 p-0 overflow-visible min-h-[90vh] flex flex-col"
      style={{ 
        backgroundImage: 'url(/Group\ 2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ background: 'linear-gradient(to bottom, #080D1B 0%, #273D5D 30%, #A3B3CA 70%, #EFEFEF 100%)' }}
      />
      
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center pt-24 md:pt-18 pb-0">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-[95rem] mx-auto space-y- md:space-y-04">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-headline font-bold leading-[1.2] tracking-normal text-white">
              {data.title.split('<br />').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/60 font-medium max-w-4xl mx-auto leading-[1.4] px-4">
              {data.description}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-2 md:pt-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button size="lg" className="h-16 md:h-20 px-10 md:px-16 text-lg md:text-2xl font-bold rounded-full bg-primary text-black hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40 active:scale-95" onClick={handleAdminAccess}>
                  Get Started
                  <ArrowRight className="ml-4 w-6 h-6 md:w-8 md:h-8" />
                </Button>
                <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="lg" className="h-16 md:h-20 px-10 md:px-16 text-lg md:text-2xl rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/15 transition-all shadow-2xl shadow-black/20">
                      View Offer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0B1323]/95 border border-white/10 text-white w-[min(94vw,760px)] max-h-[90vh] overflow-y-auto p-3 sm:p-6 rounded-[24px] shadow-2xl shadow-black/40">
                    <DialogHeader className="text-center sm:text-left">
                      <DialogTitle className="text-2xl sm:text-3xl font-headline font-bold tracking-tight">
                        {data.popupTitle || "iGrow Learning Institute Offers"}
                      </DialogTitle>
                      <DialogDescription className="mt-2 text-sm sm:text-base text-slate-300 leading-6">
                        {data.popupDescription || "Discover special programs, mentorship access, and exclusive training offers tailored for ambitious traders and learners."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 grid gap-3 lg:grid-cols-[1.05fr_0.95fr] items-start">
                      <div className="space-y-2.5 order-2 lg:order-1">
                        <div className="rounded-2xl bg-white/5 p-3 shadow-sm border border-white/10">
                          <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-primary font-semibold">Offer highlights</p>
                          <ul className="mt-2 space-y-1.5 text-sm text-slate-200">
                            {popupHighlights.map((item, index) => (
                              <li key={`${item}-${index}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-2xl bg-white/5 p-3 shadow-sm border border-white/10">
                          <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-primary font-semibold">How it works</p>
                          <p className="mt-2 text-sm text-slate-200 leading-6">
                            {popupHowItWorks}
                          </p>
                        </div>
                      </div>
                      <div className="order-1 lg:order-2 rounded-[20px] overflow-hidden border border-white/10 bg-slate-950/80 shadow-lg shadow-black/40 h-[180px] sm:h-[240px] lg:min-h-[280px]">
                        <Image
                          src={data.popupImageUrl || "/Your crypto journey starts here (1).png"}
                          alt="iGrow Learning Institute offer"
                          width={640}
                          height={540}
                          className="w-full h-full object-cover"
                          quality={90}
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-4 justify-center sm:justify-end">
                      <DialogClose asChild>
                        <Button variant="secondary" size="default" className="w-full sm:w-auto rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/15 px-5 py-2.5 text-sm">
                          Close
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-0 mx-0 mt-0 pb-0">
        <div className="relative w-full overflow-hidden">
          <Image
            src={data.imageUrl}
            alt="OrngFinance Dashboard"
            width={2560}
            height={1080}
            className="w-full h-auto block opacity-95"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080D1B] via-transparent to-transparent opacity-80 pointer-events-none" />
        </div>
        
        {/* Gradient transition image */}
        <div className="relative w-full overflow-hidden">
          <Image
            src="/Gradient.png"
            alt="Gradient Transition"
            width={2560}
            height={400}
            className="w-full h-auto block"
            quality={100}
          />
        </div>
      </div>
    </section>
  );
}
