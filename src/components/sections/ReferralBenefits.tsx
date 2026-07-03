"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from 'lucide-react';
import { safeJson } from '@/lib/utils';

const levelBenefits = [
  { name: "GROW STAR", volume: "2.5 Lakh", reward: "3%", type: "Reward" },
  { name: "GROW SILVER", volume: "7.5 Lakh", reward: "3%", type: "Reward" },
  { name: "GROW GOLD", volume: "15 Lakh", reward: "3%", type: "Reward" },
  { name: "GROW PEARL", volume: "25 Lakh", reward: "3%", type: "Reward" },
  { name: "GROW RUBY", volume: "40 Lakh", reward: "5%", type: "Reward" },
  { name: "GROW SAPPHIRE", volume: "60 Lakh", reward: "5%", type: "Reward" },
  { name: "GROW DIAMOND", volume: "80 Lakh", reward: "5%", type: "Reward" },
  { name: "GROW KOHINOOR", volume: "1 Crore", reward: "5%", type: "Reward" },
];

export default function ReferralBenefits() {
  const [data, setData] = useState({
    title: "iGrow Referral Benefits",
    description: "Scale your network and unlock exponential rewards. Our unique referral structure is designed to reward active participants.",
    imageUrl: "/commiso.png"
  });

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        const data = await safeJson(response);
        if (response.ok && data?.success && data.content?.referral) {
          setData(data.content.referral);
        } else if (!response.ok) {
          console.warn('Referral content fetch failed', response.status, data);
        }
      } catch (error) {
        console.error('Error fetching referral content:', error);
      }
    };
    fetchReferral();
  }, []);

  return (
    <section id="referral" className="py-24 md:py-32 bg-[#080D1B] border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8 mb-20 md:mb-32">
          <Badge variant="outline" className="border-primary/40 text-primary px-6 py-2 rounded-full bg-primary/10 uppercase tracking-[0.3em] text-[10px] font-bold">Affiliate Ecosystem</Badge>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-bold text-white leading-[1.2] tracking-tight">
            {data.title.split('Referral').map((part, i) => (
              <span key={i} className="block">{part}{i === 0 && <span className="text-primary italic">Referral </span>}</span>
            ))}
          </h2>
          <p className="text-white/50 text-base md:text-xl lg:text-2xl max-w-4xl mx-auto font-medium leading-relaxed">
            {data.description}
          </p>
        </div>

        <div className="w-full mb-20 md:mb-32 flex justify-center px-4">
          <div className="w-full max-w-5xl rounded-[30px] overflow-hidden border border-white/5 shadow-2xl">
            <Image 
              src={data.imageUrl}
              alt="iGrow Commission Structure"
              width={1600}
              height={900}
              className="w-full h-auto object-contain block"
              priority
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start max-w-6xl mx-auto">
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-sm md:text-base font-bold text-white/40 font-headline tracking-[0.3em] uppercase px-4">Key Benefits</h3>
            <div className="p-8 md:p-10 rounded-[40px] bg-white/5 border border-white/5 space-y-8 hover:bg-white/[0.08] transition-all group shadow-xl">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[18px] md:rounded-[20px] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner border border-primary/20">
                <Users className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xl md:text-2xl tracking-tight">Direct Benefit</h4>
                <p className="text-5xl md:text-6xl font-code font-bold text-primary">5%</p>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-4">Of Admission Fees</p>
              </div>
            </div>
            
            <div className="p-8 md:p-10 rounded-[40px] bg-white/5 border border-white/5 space-y-8 hover:bg-white/[0.08] transition-all group shadow-xl">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[18px] md:rounded-[20px] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner border border-primary/20">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xl md:text-2xl tracking-tight">Level Structure</h4>
                <p className="text-3xl md:text-4xl font-code font-bold text-white">60:40 / 40:60</p>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-4">Balanced Ratio</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="rounded-[40px] md:rounded-[50px] bg-white/5 border border-white/5 overflow-hidden backdrop-blur-xl shadow-xl">
              <div className="p-8 md:p-12 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-white font-headline tracking-tight">Rewards Matrix</h3>
                  <p className="text-xs md:text-base text-white/40 font-medium">Target volume in INR (₹)</p>
                </div>
                <Badge className="bg-primary text-black font-bold border-none px-6 py-2 text-sm rounded-full">Institutional Data</Badge>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="hover:bg-transparent border-white/5 h-16 md:h-20">
                      <TableHead className="text-white/40 font-bold pl-8 md:pl-12 uppercase tracking-widest text-[9px] md:text-[10px]">Tier</TableHead>
                      <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">Volume</TableHead>
                      <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">Benefit</TableHead>
                      <TableHead className="text-white/40 font-bold pr-8 md:pr-12 text-right uppercase tracking-widest text-[9px] md:text-[10px]">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levelBenefits.map((level, i) => (
                      <TableRow key={i} className="hover:bg-white/[0.04] border-white/5 transition-colors group h-16 md:h-24">
                        <TableCell className="font-bold text-white pl-8 md:pl-12 group-hover:text-primary transition-colors text-lg md:text-2xl whitespace-nowrap tracking-tight">{level.name}</TableCell>
                        <TableCell className="font-code text-white/70 text-base md:text-xl whitespace-nowrap">₹{level.volume}</TableCell>
                        <TableCell className="font-code font-bold text-primary text-xl md:text-3xl">{level.reward}</TableCell>
                        <TableCell className="pr-8 md:pr-12 text-right whitespace-nowrap">
                          <span className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 px-4 md:px-6 py-2 bg-white/10 rounded-full">{level.type}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
