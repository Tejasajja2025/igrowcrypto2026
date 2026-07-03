
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { safeJson } from '@/lib/utils';

export default function Navbar() {
  const [logoUrl, setLogoUrl] = useState("/igrow_logo footer - Copy.png");
  const router = useRouter();

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        const data = await safeJson(response);
        if (response.ok && data?.success && data.content?.branding?.logoUrl) {
          setLogoUrl(data.content.branding.logoUrl);
        } else if (!response.ok) {
          console.warn('Navbar branding fetch failed', response.status, data);
        }
      } catch (error) {
        console.error('Error fetching branding:', error);
      }
    };
    fetchBranding();
  }, []);

  const handleAdminAccess = () => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('igrow_admin_token') : null;
    router.push(token === 'authenticated' ? '/admin/dashboard' : '/admin');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm border-b border-white/5">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Image 
            src={logoUrl}
            alt="Logo"
            width={160}
            height={48}
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <Link href="#market" className="hover:text-primary transition-colors">Market</Link>
          <Link href="#ai" className="hover:text-primary transition-colors">Strategy Scout</Link>
          <Link href="#staking" className="hover:text-primary transition-colors">Staking</Link>
          <Link href="#about" className="hover:text-primary transition-colors">Institution</Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex text-white hover:text-primary" onClick={handleAdminAccess}>Log In</Button>
          <Button className="font-bold bg-primary text-black hover:bg-primary/90" onClick={handleAdminAccess}>Get Started</Button>
          <Button variant="ghost" size="icon" className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
