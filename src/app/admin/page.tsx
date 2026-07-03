"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Lock, Loader2, Command } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('admin');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('igrow_admin_token') : null;
    if (token === 'authenticated') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('igrow_admin_token', 'authenticated');
        toast({ title: 'Authorized', description: 'Terminal session initiated.' });
        router.replace('/admin/dashboard');
      } else {
        toast({ variant: 'destructive', title: 'Access Denied', description: data.error || 'Security key verification failed.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'Unable to verify credentials.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080D1B] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,102,0,0.05),transparent_50%)]" />
      
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-3xl rounded-[40px] shadow-2xl relative z-10 p-4">
        <CardHeader className="text-center space-y-4 pb-10 pt-8">
          <div className="mx-auto w-16 h-16 rounded-[22px] bg-primary/20 flex items-center justify-center text-primary shadow-inner border border-primary/20 animate-pulse">
            <Command className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-headline font-bold text-white tracking-tight">Admin Terminal</CardTitle>
            <CardDescription className="text-white/40 font-medium">Verified personnel only. Session monitored.</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/30 ml-1">Admin ID</Label>
              <Input
                type="text"
                placeholder="admin"
                className="bg-black/40 border-white/10 h-16 rounded-[20px] text-white text-lg focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/30 ml-1">Security Key</Label>
              <div className="relative group">
                <Lock className="absolute left-5 top-5 w-5 h-5 text-white/20 transition-colors group-focus-within:text-primary" />
                <Input 
                  type="password" 
                  placeholder="Enter admin password" 
                  className="bg-black/40 border-white/10 pl-14 h-16 rounded-[20px] text-white text-lg focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-white/40">Default credentials: <span className="font-medium text-white">admin</span> / <span className="font-medium text-white">admin</span></p>
            </div>
          </CardContent>
          <CardFooter className="pt-6 pb-8">
            <Button type="submit" disabled={loading} className="w-full h-18 py-8 rounded-[24px] bg-primary text-black font-bold text-xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 active:scale-95">
              {loading ? <Loader2 className="animate-spin h-7 w-7" /> : <><ShieldCheck className="mr-2 w-6 h-6" /> Authenticate</>}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 text-white/20 text-[10px] font-bold uppercase tracking-[0.5em]">
        <Command className="w-4 h-4" /> Secure Backbone 2.0
      </div>
    </div>
  );
}
