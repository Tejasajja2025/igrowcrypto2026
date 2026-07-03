
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, BarChart3, MessageCircle, Settings } from 'lucide-react';
import { safeJson } from '@/lib/utils';

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState("/igrow_logo footer - Copy.png");

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        const data = await safeJson(response);
        if (response.ok && data?.success && data.content?.branding?.logoUrl) {
          setLogoUrl(data.content.branding.logoUrl);
        } else if (!response.ok) {
          console.warn('Footer branding fetch failed', response.status, data);
        }
      } catch (error) {
        console.error('Error fetching branding:', error);
      }
    };
    fetchBranding();
  }, []);

  return (
    <footer className="py-20 bg-transparent border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center">
              <Image 
                src={logoUrl}
                alt="Logo"
                width={140}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              Global liquidity provider and institutional-grade trading ecosystem for the modern era.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-white">Ecosystem</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><Link href="#" className="hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Yield Terminal</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Neural Scout</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Orng API</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-white">Contact Us</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><a href="mailto:igrow201@gmail.com" className="hover:text-primary transition-colors">igrow201@gmail.com</a></li>
              <li><a href="tel:+916290050426" className="hover:text-primary transition-colors">+91 62900 50426</a></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Knowledge Base</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Support Portal</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Regulatory Status</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/30">
          <p>© 2024 iGrow Finance. All rights reserved. Precision finance for a digital age.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">Discord</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
          </div>
        </div>

        <div className="mt-10 block md:hidden">
          <div className="grid grid-cols-4 gap-2 rounded-3xl border border-white/10 bg-white/5 p-2">
            <Link href="#" className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-center text-white/80 hover:bg-white/10 hover:text-white">
              <Home className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-[0.2em]">Home</span>
            </Link>
            <Link href="#market" className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-center text-white/80 hover:bg-white/10 hover:text-white">
              <BarChart3 className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-[0.2em]">Market</span>
            </Link>
            <Link href="#" className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-center text-white/80 hover:bg-white/10 hover:text-white">
              <MessageCircle className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-[0.2em]">Support</span>
            </Link>
            <Link href="#" className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-center text-white/80 hover:bg-white/10 hover:text-white">
              <Settings className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-[0.2em]">More</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
