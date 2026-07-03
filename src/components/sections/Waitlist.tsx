"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Send, Sparkles } from 'lucide-react';

export default function Waitlist() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="waitlist" className="py-32 relative overflow-hidden bg-background">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest animate-fade-in-up">
              <Sparkles className="w-3 h-3" />
              Limited Beta Access
            </div>
            <h2 className="text-5xl md:text-7xl font-headline font-bold text-white leading-[1.3] tracking-normal">
              Join the <span className="text-primary italic">Beta</span> Network
            </h2>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
              Experience the convergence of institutional liquidity and sovereign AI. Secure your priority access to the iGrow ecosystem today.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="relative group max-w-xl mx-auto transform transition-all hover:scale-[1.01]">
              <div className="flex flex-col sm:flex-row p-2 rounded-[24px] bg-white/5 backdrop-blur-2xl border border-white/10 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-500 shadow-2xl gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your professional email" 
                  className="bg-transparent border-none h-14 md:h-16 text-lg focus-visible:ring-0 placeholder:text-white/20 text-white pl-6"
                  required
                />
                <Button className="h-14 md:h-16 px-10 rounded-[18px] font-bold text-lg bg-primary text-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group">
                  Get Priority Access
                  <Send className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Button>
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-6">
                By subscribing, you agree to our institutional security protocols.
              </p>
            </form>
          ) : (
            <div className="max-w-md mx-auto p-10 rounded-[40px] bg-white/5 border border-primary/20 backdrop-blur-3xl animate-fade-in-up shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 animate-pulse" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-black shadow-2xl shadow-primary/40 rotate-12">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline font-bold text-3xl text-white">Access Authorized</h3>
                  <p className="text-white/50 text-lg font-medium">Your credentials have been added to the priority sequence.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
