"use client";

import { useState } from 'react';
import { defineTradingPersona, StrategyScoutAIDefinePersonaOutput } from '@/ai/flows/strategy-scout-ai-define-persona-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Loader2, Target, PieChart, ShieldCheck } from 'lucide-react';

export default function StrategyScout() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StrategyScoutAIDefinePersonaOutput | null>(null);

  const [formData, setFormData] = useState({
    investmentGoals: '',
    riskTolerance: 'medium',
    preferredAssets: 'crypto',
    investmentHorizon: '1-3 years',
    marketSentiment: 'bullish'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const output = await defineTradingPersona(formData);
      setResult(output);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai" className="py-24 md:py-32 relative z-10">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[20px] md:rounded-[24px] bg-primary flex items-center justify-center text-black shadow-2xl shadow-primary/30 rotate-3">
                  <BrainCircuit className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-headline font-bold leading-[1.2] text-white tracking-tight">
                  Neural <span className="text-primary italic">Scout AI</span>
                </h2>
                <p className="text-white/50 leading-relaxed text-base md:text-xl font-medium">
                  Define your institutional DNA. Our AI engine correlates your preferences with live market metrics.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[35px] md:rounded-[45px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -z-10" />
                
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">Core Objective</Label>
                  <Input 
                    placeholder="e.g. Wealth preservation & growth" 
                    className="bg-black/40 border-white/10 h-14 md:h-16 rounded-2xl md:rounded-3xl focus:ring-4 focus:ring-primary/10 transition-all text-white placeholder:text-white/20 px-6 text-base"
                    value={formData.investmentGoals}
                    onChange={e => setFormData({...formData, investmentGoals: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">Risk Profile</Label>
                    <Select onValueChange={v => setFormData({...formData, riskTolerance: v})} defaultValue={formData.riskTolerance}>
                      <SelectTrigger className="bg-black/40 border-white/10 h-14 md:h-16 rounded-2xl md:rounded-3xl text-white px-6 text-sm focus:ring-4 focus:ring-primary/10 transition-all">
                        <SelectValue placeholder="Balanced" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0C1222] border-white/10 text-white rounded-2xl p-2">
                        <SelectItem value="low" className="rounded-xl py-2 px-4">Conservative</SelectItem>
                        <SelectItem value="medium" className="rounded-xl py-2 px-4">Balanced</SelectItem>
                        <SelectItem value="high" className="rounded-xl py-2 px-4">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">Horizon</Label>
                    <Select onValueChange={v => setFormData({...formData, investmentHorizon: v})} defaultValue={formData.investmentHorizon}>
                      <SelectTrigger className="bg-black/40 border-white/10 h-14 md:h-16 rounded-2xl md:rounded-3xl text-white px-6 text-sm focus:ring-4 focus:ring-primary/10 transition-all">
                        <SelectValue placeholder="Medium Term" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0C1222] border-white/10 text-white rounded-2xl p-2">
                        <SelectItem value="< 1 year" className="rounded-xl py-2 px-4">Short Term</SelectItem>
                        <SelectItem value="1-3 years" className="rounded-xl py-2 px-4">Medium Term</SelectItem>
                        <SelectItem value="3-5 years" className="rounded-xl py-2 px-4">Long Term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button disabled={loading} className="w-full h-16 md:h-20 rounded-[24px] md:rounded-[28px] font-bold text-lg md:text-xl shadow-2xl shadow-primary/40 transition-all hover:scale-[1.01] active:scale-[0.98] bg-primary text-black group">
                  {loading ? (
                    <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Synthesizing...</>
                  ) : (
                    <>Analyze My DNA <ShieldCheck className="ml-2 w-6 h-6 transition-transform group-hover:rotate-12" /></>
                  )}
                </Button>
              </form>
            </div>

            <div className="lg:col-span-3 h-full">
              {result ? (
                <div className="space-y-6 animate-fade-in-up">
                  <Card className="bg-white/5 border-white/10 p-8 md:p-12 rounded-[40px] md:rounded-[50px] overflow-hidden relative group shadow-2xl backdrop-blur-md">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-700">
                      <Target className="w-48 h-48 text-white" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4 text-primary">
                        <Target className="w-8 h-8 md:w-10 md:h-10" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Persona Verified</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-headline font-bold text-white leading-tight">
                        {result.personaDescription}
                      </h3>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {result.portfolioAllocation.map((item, i) => (
                      <Card key={i} className="bg-white/5 border-white/5 p-8 rounded-[30px] md:rounded-[35px] hover:border-primary/40 transition-all group relative overflow-hidden shadow-xl">
                        <div className="flex justify-between items-start mb-6">
                          <h4 className="font-headline font-bold text-xl text-white">{item.assetClass}</h4>
                          <div className="px-4 py-2 bg-primary/20 text-primary rounded-xl font-code text-lg font-bold shadow-inner">
                            {item.percentage}%
                          </div>
                        </div>
                        <p className="text-sm md:text-base text-white/50 leading-relaxed font-medium">
                          {item.rationale}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[500px] md:min-h-[600px] border-2 border-dashed border-white/10 rounded-[40px] md:rounded-[60px] flex flex-col items-center justify-center text-center p-12 space-y-8 relative overflow-hidden bg-white/[0.01]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                    <PieChart className="w-24 h-24 md:w-32 md:h-32 text-white/10 relative z-10" />
                  </div>
                  <div className="space-y-4 max-w-sm">
                    <h3 className="font-headline font-bold text-2xl md:text-3xl text-white/40 tracking-tight">System Ready</h3>
                    <p className="text-white/20 text-lg font-medium leading-relaxed">Configure parameters to generate your neural performance matrix.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
