"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TerminalSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TradeBridgeTerminal } from '@/components/TradeBridgeTerminal';

export default function TradingTerminalPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('igrow_admin_token') : null;
    if (token !== 'authenticated') {
      router.replace('/admin');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#080D1B] text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <TerminalSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Live trading</p>
              <h1 className="text-lg font-semibold">Copy Trading Terminal</h1>
            </div>
          </div>

          <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black/20 shadow-2xl p-4 sm:p-6">
          <TradeBridgeTerminal />
        </div>
      </main>
    </div>
  );
}
