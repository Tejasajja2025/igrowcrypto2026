"use client";

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, LineChart, Sparkles } from 'lucide-react';

export default function RewardVisualizer() {
  const [amount, setAmount] = useState([5000]);
  const apy = 8.5; // Fixed annual percentage yield
  
  const annualReturn = (amount[0] * apy) / 100;
  const monthlyReturn = annualReturn / 12;

  return (
    <div id="staking" className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-sm rounded-[32px] border border-white/10 p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold py-1 px-3">Yield Engine</Badge>
                <h2 className="text-4xl font-headline font-bold text-white">Dynamic <span className="text-primary">Reward</span> Visualizer</h2>
                <p className="text-white/60">Calculate your growth potential with our premium staking protocol. Precision yields, automated distribution.</p>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-xs uppercase tracking-widest font-bold text-white/40">Staking Amount</span>
                  <span className="text-3xl font-code font-bold text-primary">${amount[0].toLocaleString()}</span>
                </div>
                <Slider 
                  defaultValue={[5000]} 
                  max={100000} 
                  step={100} 
                  className="py-4"
                  onValueChange={(val) => setAmount(val)}
                />
                <div className="flex justify-between text-xs font-mono text-white/30">
                  <span>$0</span>
                  <span>$100,000</span>
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-white/80">Estimated APY: <span className="font-bold text-white">8.50%</span> Fixed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card className="p-8 bg-black/20 border-white/5 space-y-2 relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="text-xs uppercase tracking-widest font-bold text-white/40">Monthly Interest</div>
                <div className="text-4xl font-code font-bold text-primary">${monthlyReturn.toFixed(2)}</div>
                <div className="text-xs text-white/30">Paid out every 24 hours</div>
                <LineChart className="absolute -bottom-2 -right-2 w-24 h-24 opacity-5 text-primary group-hover:opacity-10 transition-opacity" />
              </Card>

              <Card className="p-8 bg-black/20 border-white/5 space-y-2 relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="text-xs uppercase tracking-widest font-bold text-white/40">Total Annual Return</div>
                <div className="text-4xl font-code font-bold text-primary">${annualReturn.toFixed(2)}</div>
                <div className="text-xs text-white/30">Compound interest enabled</div>
                <Coins className="absolute -bottom-2 -right-2 w-24 h-24 opacity-5 text-primary group-hover:opacity-10 transition-opacity" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
