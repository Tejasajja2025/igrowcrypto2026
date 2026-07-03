"use client";

import { useState, useEffect } from 'react';
import { Check, GraduationCap, Lightbulb, Shield, Rocket, TrendingUp, Briefcase, Trophy, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { safeJson } from '@/lib/utils';

const programs = [
  {
    name: "Basic Program",
    price: "₹11,000",
    duration: "12 Months",
    extra: "+ 50 USDT Copy",
    icon: <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />,
    highlight: false
  },
  {
    name: "Advanced Program",
    price: "₹21,000",
    duration: "18 Months",
    extra: "+ 100 USDT Copy",
    icon: <Rocket className="w-6 h-6 md:w-8 md:h-8 text-primary" />,
    highlight: false
  },
  {
    name: "Advanced 2.0",
    price: "₹31,000",
    duration: "24 Months",
    extra: "+ 150 USDT Copy",
    icon: <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary" />,
    highlight: true
  },
  {
    name: "Combo Program",
    price: "₹45,000",
    duration: "60 Months",
    extra: "+ 200 USDT Copy",
    icon: <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-primary" />,
    highlight: false
  },
  {
    name: "Internship",
    price: "₹15,000",
    duration: "Conditions Apply",
    extra: "Career Path",
    icon: <Trophy className="w-6 h-6 md:w-8 md:h-8 text-primary" />,
    highlight: false
  }
];

const benefits = [
  "Professional Trading Education",
  "Live Market Learning",
  "Copy Trading Setup",
  "Long-term Mentorship",
  "Career Opportunity",
  "Free Signal Guide",
  "Professional Market Analysis"
];

export default function Packages() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [content, setContent] = useState({
    instituteName: "IGROW LEARNING INSTITUTE",
    subtitle: "Course & Admission Programs"
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        const data = await safeJson(response);
        if (response.ok && data?.success && data.content?.packages) {
          setContent(data.content.packages);
        } else if (!response.ok) {
          console.warn('Packages content fetch failed', response.status, data);
        }
      } catch (error) {
        console.error('Error fetching packages content:', error);
      }
    };
    fetchContent();
  }, []);

  const handleJoinNow = (programName: string) => {
    setSelectedProgram(programName);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setIsOpen(false);
    toast({
      title: "Enrollment Request Received",
      description: "An iGrow counselor will contact you shortly to finalize your admission.",
    });
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/916290050426", "_blank");
  };

  return (
    <section id="packages" className="py-20 md:py-32 bg-[#080D1B]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-5xl mx-auto mb-20 md:mb-32 space-y-6">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-bold text-white tracking-tight leading-[1.2]">
            {content.instituteName}
          </h2>
          <p className="text-primary text-xl md:text-3xl font-medium italic">{content.subtitle}</p>
        </div>

        <div className="space-y-16 md:space-y-24">
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <GraduationCap className="w-8 h-8 md:w-12 md:h-12 text-primary" />
            <h3 className="text-xl md:text-4xl font-bold text-white tracking-[0.2em] uppercase">Our Programs</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
            {programs.map((pkg, i) => (
              <Card 
                key={i} 
                className={`relative p-8 md:p-10 rounded-[35px] md:rounded-[45px] border transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between overflow-hidden group ${
                  pkg.highlight 
                    ? 'bg-white/10 border-primary/50 shadow-2xl' 
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                {pkg.highlight && (
                   <div className="absolute top-0 right-0 px-6 py-2 bg-primary text-black text-[10px] font-bold uppercase tracking-widest rounded-bl-2xl">Popular</div>
                )}
                <div className="space-y-8 relative z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[20px] md:rounded-[24px] bg-white/5 flex items-center justify-center shadow-inner group-hover:bg-primary/20 transition-all duration-500">
                    {pkg.icon}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">{pkg.name}</h4>
                    <p className="text-white/40 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-2">{pkg.extra}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl md:text-4xl font-bold text-primary tracking-tight">{pkg.price}</div>
                    <div className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase">Duration: {pkg.duration}</div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleJoinNow(pkg.name)}
                  size="lg"
                  className={`mt-10 w-full h-12 md:h-14 rounded-[20px] md:rounded-[24px] font-bold text-base md:text-lg transition-all active:scale-95 ${
                    pkg.highlight 
                      ? 'bg-primary text-black hover:bg-primary/90' 
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  Enroll Now
                </Button>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-24 md:mt-40 max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] md:rounded-[60px] border border-white/10 p-10 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10" />
            <div className="flex items-center gap-6 mb-12">
              <div className="w-14 h-14 rounded-[18px] bg-primary/10 flex items-center justify-center shadow-inner">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl md:text-4xl lg:text-5xl font-headline font-bold text-white tracking-tight">Premium Benefits</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-12">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all border border-primary/20">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-white/60 text-base md:text-xl font-medium leading-relaxed group-hover:text-white transition-colors">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#0C1222]/95 backdrop-blur-3xl border-white/10 text-white max-w-xl p-0 overflow-hidden rounded-[30px] md:rounded-[40px] shadow-3xl">
          <div className="p-8 md:p-12 space-y-8">
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-2xl md:text-4xl font-headline font-bold tracking-tight">Join {selectedProgram}</DialogTitle>
              <DialogDescription className="text-white/40 text-base md:text-lg">Secure your spot in our trading academy.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
               <div className="space-y-2">
                 <Label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Full Name</Label>
                 <Input className="bg-white/5 border-white/10 h-12 md:h-14 rounded-2xl md:rounded-3xl text-base px-6" placeholder="John Doe" required />
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Email</Label>
                   <Input type="email" className="bg-white/5 border-white/10 h-12 md:h-14 rounded-2xl md:rounded-3xl text-base px-6" placeholder="john@example.com" required />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Phone</Label>
                   <Input className="bg-white/5 border-white/10 h-12 md:h-14 rounded-2xl md:rounded-3xl text-base px-6" placeholder="+91 00000 00000" required />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <Label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Program</Label>
                 <Select defaultValue={selectedProgram}>
                   <SelectTrigger className="bg-white/5 border-white/10 h-12 md:h-14 rounded-2xl md:rounded-3xl text-base px-6">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-[#0C1222] border-white/10 text-white rounded-2xl">
                     {programs.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>

               <div className="pt-4 space-y-4">
                 <Button type="submit" disabled={loading} className="w-full h-14 md:h-16 rounded-2xl md:rounded-3xl bg-primary text-black font-bold text-lg shadow-xl shadow-primary/20">
                   {loading ? <Loader2 className="animate-spin mr-2" /> : "Confirm Enrollment"}
                 </Button>
                 
                 <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleWhatsApp}
                    className="w-full h-14 md:h-16 rounded-2xl md:rounded-3xl border-green-500/20 text-green-500 hover:bg-green-500/10 font-bold flex items-center justify-center gap-3 text-base"
                  >
                   <MessageCircle className="w-6 h-6" />
                   Join Community
                 </Button>
               </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
