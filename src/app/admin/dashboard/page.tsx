
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { safeJson } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import FollowersDashboard from '@/components/dashboard/FollowersDashboard';
import {
  LayoutDashboard,
  LogOut,
  Save,
  Image as ImageIcon,
  Type,
  Package,
  Users,
  Loader2,
  AlertCircle,
  Globe,
  Shield,
  TrendingUp,
  Terminal,
  Settings,
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  Menu,
  X,
  MapPin,
} from 'lucide-react';

type ContactBranch = {
  label?: string;
  address?: string;
  phone?: string;
  email?: string;
};

type SiteContent = {
  branding: {
    logoUrl: string;
    siteName: string;
  };
  hero: {
    title: string;
    description: string;
    imageUrl: string;
    popupTitle: string;
    popupDescription: string;
    popupImageUrl: string;
    popupHighlights: string;
    popupHowItWorks: string;
  };
  wealth: {
    title: string;
    description: string;
  };
  copyTrading: {
    title: string;
    description: string;
    videoUrl: string;
  };
  packages: {
    instituteName: string;
    subtitle: string;
    preBasicProgram: {
      name: string;
      price: string;
      duration: string;
      extra: string;
      discount: string;
    };
  };
  referral: {
    title: string;
    description: string;
    imageUrl: string;
  };
  contacts: {
    main: {
      address: string;
      phone: string;
      email: string;
    };
    branches: ContactBranch[];
  };
  trading: {
    activeTrades: Array<{
      id: string;
      pair: string;
      type: string;
      entry: string;
      current: string;
      pnl: string;
      status: string;
    }>;
    traders: Array<{
      name: string;
      yield: string;
      followers: string;
      risk: string;
    }>;
  };
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [uploadingPopupImage, setUploadingPopupImage] = useState(false);
  const [uploadingReferralImage, setUploadingReferralImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('trading');
  const router = useRouter();
  const { toast } = useToast();

  const [content, setContent] = useState<SiteContent>({
    branding: {
      logoUrl: "/igrow_logo footer - Copy.png",
      siteName: "iGrow Finance"
    },
    hero: {
      title: "Institutional Global Liquidity Network",
      description: "Connect to the world's most robust trading ecosystem. Precision execution across crypto and forex, powered by Orng's high-fidelity backbone.",
      imageUrl: "/Group 2.png",
      popupTitle: "iGrow Learning Institute Offers",
      popupDescription: "Discover special programs, mentorship access, and exclusive training offers tailored for ambitious traders and learners.",
      popupImageUrl: "/Your crypto journey starts here (1).png",
      popupHighlights: "• Free strategy coaching for early enrollees\n• Monthly market intelligence sessions\n• Direct signal access and trade reviews\n• Mobile-ready learning community",
      popupHowItWorks: "Join the institute, access the trading dashboard, and receive curated education with real-world signal guidance, all optimized for desktop and mobile users."
    },
    wealth: {
      title: "Built for wealth, made for everyone",
      description: "Trusted by institutional and retail investors around the world since 2016."
    },
    copyTrading: {
      title: "Precision Copy Trading",
      description: "Mirror the performance of the world's most successful traders. Precision execution for Forex and Crypto markets.",
      videoUrl: "/Untitled design.mp4"
    },
    packages: {
      instituteName: "IGROW LEARNING INSTITUTE",
      subtitle: "Course & Admission Programs",
      preBasicProgram: {
        name: "Pre Basic Program",
        price: "₹5,999",
        duration: "Awareness Program",
        extra: "Digital currency & digital assets awareness program",
        discount: "40% off ₹11,000"
      }
    },
    referral: {
      title: "iGrow Referral Benefits",
      description: "Scale your network and unlock exponential rewards. Our unique referral structure is designed to reward active ecosystem participants.",
      imageUrl: "/commiso.png"
    },
    contacts: {
      main: {
        address: "Flat 11, B.A. Road, Kolkata, West Bengal, India",
        phone: "+91 62900 50426",
        email: "igrow201@gmail.com"
      },
      branches: [
        {
          label: "Main Office",
          address: "Flat 11, B.A. Road, Kolkata, West Bengal, India",
          phone: "+91 62900 50426",
          email: "igrow201@gmail.com"
        }
      ]
    },
    trading: {
      activeTrades: [
        { id: '1', pair: 'BTC/USD', type: 'LONG', entry: '64,200', current: '65,800', pnl: '+2.49%', status: 'Active' },
        { id: '2', pair: 'EUR/USD', type: 'SHORT', entry: '1.0920', current: '1.0840', pnl: '+0.73%', status: 'Active' }
      ],
      traders: [
        { name: 'Elite Alpha', yield: '32.1%', followers: '1,240', risk: 'Low' },
        { name: 'Forex Master', yield: '18.5%', followers: '850', risk: 'Medium' }
      ]
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('igrow_admin_token');
    if (token !== 'authenticated') {
      router.push('/admin');
      return;
    }

    const loadContent = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        const data = await safeJson(response);
        if (response.ok && data?.success && data.content) {
          setContent(data.content);
        } else if (!response.ok) {
          console.warn('Admin content load failed', response.status, data);
          setDbError(true);
        }
      } catch (error) {
        console.error('Error loading content:', error);
        setDbError(true);
      } finally {
        setFetching(false);
      }
    };

    loadContent();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('igrow_admin_token');
    router.push('/admin');
  };

  const handlePopupImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingPopupImage(true);
    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await safeJson(response);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Image upload failed');
      }

      setContent({
        ...content,
        hero: {
          ...content.hero,
          popupImageUrl: data.url,
        },
      });

      toast({ title: 'Image uploaded', description: 'The popup image has been updated successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload failed', description: String(error) });
    } finally {
      setUploadingPopupImage(false);
      event.target.value = '';
    }
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingLogo(true);
    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await safeJson(response);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Logo upload failed');
      }

      setContent({
        ...content,
        branding: {
          ...content.branding,
          logoUrl: data.url,
        },
      });

      toast({ title: 'Logo uploaded', description: 'The site logo has been updated successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload failed', description: String(error) });
    } finally {
      setUploadingLogo(false);
      event.target.value = '';
    }
  };

  const handleReferralImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingReferralImage(true);
    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await safeJson(response);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Referral image upload failed');
      }

      setContent({
        ...content,
        referral: {
          ...content.referral,
          imageUrl: data.url,
        },
      });

      toast({ title: 'Referral image uploaded', description: 'Structure image URL updated successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload failed', description: String(error) });
    } finally {
      setUploadingReferralImage(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const data = await safeJson(response);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Content save failed');
      }

      toast({ title: 'Success', description: 'All configurations updated live across the ecosystem.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed', description: String(error) });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#080D1B] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D1B] flex flex-col">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20 flex-shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base sm:text-lg truncate">Command Center</h1>
              <p className="text-white/40 text-[10px] sm:text-xs font-medium truncate">Dashboard v2.0</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-2 lg:gap-4">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-sm" onClick={() => router.push('/terminal')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Terminal
            </Button>
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button className="bg-primary text-black font-bold text-sm" onClick={handleSave} disabled={loading || dbError}>
              {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Deploy
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden border-t border-white/5 bg-black/40 overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-64' : 'max-h-0'
          }`}
        >
          <div className="px-4 py-4 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-white/10"
              onClick={() => {
                router.push('/terminal');
                setMobileMenuOpen(false);
              }}
            >
              <ExternalLink className="w-4 h-4 mr-3" />
              Open Terminal
            </Button>
            <Button 
              className="w-full bg-primary text-black font-bold justify-start" 
              onClick={() => {
                handleSave();
                setMobileMenuOpen(false);
              }}
              disabled={loading || dbError}
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4 mr-3" /> : <Save className="w-4 h-4 mr-3" />}
              Deploy Updates
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-white/10 text-red-400 hover:text-red-300"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 sm:py-12 px-3 sm:px-6 flex-1 max-w-6xl w-full pb-28">
        {dbError && (
          <Alert variant="destructive" className="mb-8 bg-destructive/10 border-destructive/20 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Required</AlertTitle>
            <AlertDescription>
              Database connection inactive. Fill your <code className="bg-black/20 px-1 rounded">.env</code> keys and ensure the DB is reachable.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-auto md:h-14 w-full justify-start overflow-x-auto overflow-y-hidden no-scrollbar flex-wrap md:flex-nowrap">
            <TabsTrigger value="trading" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg h-10 md:h-full flex items-center gap-1 md:gap-2 px-3 md:px-6 text-xs md:text-sm flex-shrink-0">
              <Terminal className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Trading Terminal</span><span className="sm:hidden">Trading</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg h-10 md:h-full flex items-center gap-1 md:gap-2 px-3 md:px-6 text-xs md:text-sm flex-shrink-0">
              <Settings className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Branding</span><span className="sm:hidden">Brand</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg h-10 md:h-full flex items-center gap-1 md:gap-2 px-3 md:px-6 text-xs md:text-sm flex-shrink-0">
              <MapPin className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Contacts</span><span className="sm:hidden">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="hero" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg h-10 md:h-full flex items-center gap-1 md:gap-2 px-3 md:px-6 text-xs md:text-sm flex-shrink-0">
              <Type className="w-3 h-3 md:w-4 md:h-4" /> Sections
            </TabsTrigger>
            <TabsTrigger value="packages" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg h-10 md:h-full flex items-center gap-1 md:gap-2 px-3 md:px-6 text-xs md:text-sm flex-shrink-0">
              <Package className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Programs</span><span className="sm:hidden">Prog</span>
            </TabsTrigger>
            <TabsTrigger value="referral" className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg h-10 md:h-full flex items-center gap-1 md:gap-2 px-3 md:px-6 text-xs md:text-sm flex-shrink-0">
              <Users className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Affiliate</span><span className="sm:hidden">Aff</span>
            </TabsTrigger>
          </TabsList>

          {/* TRADING TERMINAL */}
          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <Card className="lg:col-span-2 bg-white/5 border border-white/10 text-white rounded-2xl md:rounded-[32px] shadow-xl shadow-black/20 overflow-hidden">
                <CardHeader className="p-4 md:p-8 border-b border-white/5 bg-black/10 backdrop-blur-xl">
                  <div className="flex flex-col gap-3 md:gap-4">
                    <CardTitle className="text-lg md:text-2xl font-headline">Open Terminal</CardTitle>
                    <Badge className="bg-orange-500/15 text-orange-300 border-none w-fit text-xs md:text-sm">Use the standalone terminal only</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-6 bg-black/10">
                  <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 text-center">
                    <p className="max-w-2xl text-sm text-white/70">
                      The embedded trading terminal has been removed. To access the full terminal interface, open the standalone terminal window.
                    </p>
                    <Button className="bg-primary text-black px-6 py-3 rounded-2xl text-sm font-semibold" onClick={() => router.push('/terminal')}>
                      Open Terminal
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border border-white/10 text-white rounded-2xl md:rounded-[32px] shadow-xl shadow-black/20">
                <CardHeader className="p-4 md:p-8 border-b border-white/5">
                  <CardTitle className="text-lg md:text-2xl font-headline">Master Traders</CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-8 pb-4 md:pb-8 space-y-3">
                  {content.trading.traders.map((trader, i) => (
                    <div key={i} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-white/10 flex items-center justify-between gap-3 transition-all hover:border-orange-400/30">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-300 flex-shrink-0">
                          <Users className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs md:text-sm truncate">{trader.name}</p>
                          <p className="text-[8px] md:text-[10px] text-white/40 uppercase tracking-widest truncate">{trader.followers} Followers</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-orange-300 font-bold text-sm md:text-base">{trader.yield}</p>
                        <p className="text-[8px] md:text-[10px] text-white/40">Yield</p>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full mt-3 md:mt-4 bg-orange-500/15 border border-orange-400/20 text-orange-100 hover:bg-orange-500/10 h-10 md:h-12 rounded-lg md:rounded-xl text-sm md:text-base">
                    <Plus className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Add Master Account
                  </Button>
                </CardContent>
              </Card>
            </div>

            <FollowersDashboard />
          </TabsContent>

          {/* BRANDING */}
          <TabsContent value="branding" className="space-y-6">
            <Card className="bg-white/5 border-white/10 text-white p-4 md:p-8 rounded-2xl md:rounded-[32px]">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg md:text-2xl font-headline">Institutional Identity</CardTitle>
              </CardHeader>
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Logo URL (Dynamic Sync)</Label>
                    <Input 
                      value={content.branding.logoUrl}
                      onChange={(e) => setContent({ ...content, branding: { ...content.branding, logoUrl: e.target.value }})}
                      className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                      placeholder="/logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Portal Name</Label>
                    <Input 
                      value={content.branding.siteName}
                      onChange={(e) => setContent({ ...content, branding: { ...content.branding, siteName: e.target.value }})}
                      className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <p className="text-white/40 text-xs">Recommended logo size: 400x120px, PNG with transparency.</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* CONTACTS */}
          <TabsContent value="contacts" className="space-y-6">
            <Card className="bg-white/5 border-white/10 text-white p-4 md:p-8 rounded-2xl md:rounded-[32px]">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg md:text-2xl font-headline">Contact Details</CardTitle>
              </CardHeader>
              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Office Address</Label>
                  <Textarea
                    value={content.contacts?.main?.address || ''}
                    onChange={(e) => setContent({
                      ...content,
                      contacts: {
                        ...content.contacts,
                        main: {
                          ...content.contacts?.main,
                          address: e.target.value,
                        },
                      },
                    })}
                    className="bg-black/40 border-white/10 min-h-[80px] text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Phone</Label>
                    <Input
                      value={content.contacts?.main?.phone || ''}
                      onChange={(e) => setContent({
                        ...content,
                        contacts: {
                          ...content.contacts,
                          main: {
                            ...content.contacts?.main,
                            phone: e.target.value,
                          },
                        },
                      })}
                      className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Email</Label>
                    <Input
                      type="email"
                      value={content.contacts?.main?.email || ''}
                      onChange={(e) => setContent({
                        ...content,
                        contacts: {
                          ...content.contacts,
                          main: {
                            ...content.contacts?.main,
                            email: e.target.value,
                          },
                        },
                      })}
                      className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 text-white p-4 md:p-8 rounded-2xl md:rounded-[32px]">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  <CardTitle className="text-lg md:text-2xl font-headline">Branch Addresses</CardTitle>
                </div>
              </CardHeader>
              <div className="space-y-6 mt-4">
                {(content.contacts?.branches || []).map((branch, index) => (
                  <div key={index} className="rounded-3xl border border-white/10 bg-black/10 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/40">Branch {index + 1}</p>
                        <p className="text-base font-semibold text-white">{branch.label || `Branch ${index + 1}`}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          const nextBranches = [...(content.contacts?.branches || [])];
                          nextBranches.splice(index, 1);
                          setContent({
                            ...content,
                            contacts: {
                              ...content.contacts,
                              branches: nextBranches,
                            },
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Branch Label</Label>
                        <Input
                          value={branch.label || ''}
                          onChange={(e) => {
                            const branches = [...(content.contacts?.branches || [])];
                            branches[index] = { ...branches[index], label: e.target.value };
                            setContent({ ...content, contacts: { ...content.contacts, branches } });
                          }}
                          className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Branch Phone</Label>
                        <Input
                          value={branch.phone || ''}
                          onChange={(e) => {
                            const branches = [...(content.contacts?.branches || [])];
                            branches[index] = { ...branches[index], phone: e.target.value };
                            setContent({ ...content, contacts: { ...content.contacts, branches } });
                          }}
                          className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Branch Email</Label>
                      <Input
                        type="email"
                        value={branch.email || ''}
                        onChange={(e) => {
                          const branches = [...(content.contacts?.branches || [])];
                          branches[index] = { ...branches[index], email: e.target.value };
                          setContent({ ...content, contacts: { ...content.contacts, branches } });
                        }}
                        className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Branch Address</Label>
                      <Textarea
                        value={branch.address || ''}
                        onChange={(e) => {
                          const branches = [...(content.contacts?.branches || [])];
                          branches[index] = { ...branches[index], address: e.target.value };
                          setContent({ ...content, contacts: { ...content.contacts, branches } });
                        }}
                        className="bg-black/40 border-white/10 min-h-[80px] text-sm"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  className="w-full bg-primary text-black font-bold py-4 rounded-2xl"
                  onClick={() => {
                    const branches = [...(content.contacts?.branches || [])];
                    branches.push({ label: '', address: '', phone: '', email: '' });
                    setContent({ ...content, contacts: { ...content.contacts, branches } });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Branch Address
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* SECTIONS EDITOR */}
          <TabsContent value="hero" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:gap-8">
              {/* Hero Section */}
              <Card className="bg-white/5 border-white/10 text-white p-4 md:p-8 rounded-2xl md:rounded-[32px]">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    <CardTitle className="text-lg md:text-2xl font-headline">Hero Content</CardTitle>
                  </div>
                </CardHeader>
                <div className="space-y-6 mt-4">
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Main Headline</Label>
                    <Textarea 
                      value={content.hero.title}
                      onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value }})}
                      className="bg-black/40 border-white/10 min-h-[80px] md:min-h-[100px] text-sm md:text-base font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Dashboard Image URL</Label>
                      <Input 
                        value={content.hero.imageUrl}
                        onChange={(e) => setContent({ ...content, hero: { ...content.hero, imageUrl: e.target.value }})}
                        className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Description</Label>
                      <Textarea 
                        value={content.hero.description}
                        onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value }})}
                        className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                      />
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-6 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Popup Title</Label>
                      <Input 
                        value={content.hero.popupTitle || ''}
                        onChange={(e) => setContent({ ...content, hero: { ...content.hero, popupTitle: e.target.value }})}
                        className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Popup Description</Label>
                      <Textarea 
                        value={content.hero.popupDescription || ''}
                        onChange={(e) => setContent({ ...content, hero: { ...content.hero, popupDescription: e.target.value }})}
                        className="bg-black/40 border-white/10 min-h-[80px] text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Popup Image Upload</Label>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input 
                          type="file"
                          accept="image/*"
                          onChange={handlePopupImageUpload}
                          className="bg-black/40 border-white/10 h-auto text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary/15 file:px-3 file:py-1 file:text-primary"
                        />
                        {uploadingPopupImage ? (
                          <span className="text-sm text-primary">Uploading...</span>
                        ) : (
                          <span className="text-sm text-white/50">PNG, JPG, or WEBP</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Popup Image URL</Label>
                      <Input 
                        value={content.hero.popupImageUrl || ''}
                        onChange={(e) => setContent({ ...content, hero: { ...content.hero, popupImageUrl: e.target.value }})}
                        className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                        placeholder="/uploads/image.png"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Popup Highlights</Label>
                      <Textarea 
                        value={content.hero.popupHighlights || ''}
                        onChange={(e) => setContent({ ...content, hero: { ...content.hero, popupHighlights: e.target.value }})}
                        className="bg-black/40 border-white/10 min-h-[100px] text-sm"
                        placeholder="One highlight per line"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Popup How It Works</Label>
                      <Textarea 
                        value={content.hero.popupHowItWorks || ''}
                        onChange={(e) => setContent({ ...content, hero: { ...content.hero, popupHowItWorks: e.target.value }})}
                        className="bg-black/40 border-white/10 min-h-[100px] text-sm"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 text-white p-4 md:p-8 rounded-2xl md:rounded-[32px]">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    <CardTitle className="text-lg md:text-2xl font-headline">Copy Trading Landing</CardTitle>
                  </div>
                </CardHeader>
                <div className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Section Title</Label>
                      <Input 
                        value={content.copyTrading.title}
                        onChange={(e) => setContent({ ...content, copyTrading: { ...content.copyTrading, title: e.target.value }})}
                        className="bg-black/40 border-white/10 h-10 md:h-12 font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Video URL</Label>
                      <Input 
                        value={content.copyTrading.videoUrl}
                        onChange={(e) => setContent({ ...content, copyTrading: { ...content.copyTrading, videoUrl: e.target.value }})}
                        className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Marketing Description</Label>
                    <Textarea 
                      value={content.copyTrading.description}
                      onChange={(e) => setContent({ ...content, copyTrading: { ...content.copyTrading, description: e.target.value }})}
                      className="bg-black/40 border-white/10 min-h-[80px] text-sm"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* PACKAGES */}
          <TabsContent value="packages" className="space-y-6">
             <Card className="bg-white/5 border-white/10 text-white p-4 md:p-8 rounded-2xl md:rounded-[32px]">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg md:text-2xl font-headline">Academy Header</CardTitle>
              </CardHeader>
              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Institute Name</Label>
                  <Input 
                    value={content.packages.instituteName}
                    onChange={(e) => setContent({ ...content, packages: { ...content.packages, instituteName: e.target.value }})}
                    className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Subtitle</Label>
                  <Input 
                    value={content.packages.subtitle}
                    onChange={(e) => setContent({ ...content, packages: { ...content.packages, subtitle: e.target.value }})}
                    className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 text-white p-4 md:p-8 rounded-2xl md:rounded-[32px]">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg md:text-2xl font-headline">Pre Basic Program</CardTitle>
                <p className="text-sm text-white/50 mt-1">Editable awareness program details for the Pre Basic Program card.</p>
              </CardHeader>
              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Program Name</Label>
                  <Input
                    value={content.packages.preBasicProgram?.name || 'Pre Basic Program'}
                    onChange={(e) => setContent({ ...content, packages: { ...content.packages, preBasicProgram: { ...content.packages.preBasicProgram, name: e.target.value } } })}
                    className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Price</Label>
                    <Input
                      value={content.packages.preBasicProgram?.price || '₹5,999'}
                      onChange={(e) => setContent({ ...content, packages: { ...content.packages, preBasicProgram: { ...content.packages.preBasicProgram, price: e.target.value } } })}
                      className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Duration</Label>
                    <Input
                      value={content.packages.preBasicProgram?.duration || 'Awareness Program'}
                      onChange={(e) => setContent({ ...content, packages: { ...content.packages, preBasicProgram: { ...content.packages.preBasicProgram, duration: e.target.value } } })}
                      className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Program Description</Label>
                  <Input
                    value={content.packages.preBasicProgram?.extra || 'Digital currency & digital assets awareness program'}
                    onChange={(e) => setContent({ ...content, packages: { ...content.packages, preBasicProgram: { ...content.packages.preBasicProgram, extra: e.target.value } } })}
                    className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Discount Label</Label>
                  <Input
                    value={content.packages.preBasicProgram?.discount || '40% off ₹11,000'}
                    onChange={(e) => setContent({ ...content, packages: { ...content.packages, preBasicProgram: { ...content.packages.preBasicProgram, discount: e.target.value } } })}
                    className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* REFERRAL */}
          <TabsContent value="referral" className="space-y-6">
            <Card className="bg-white/5 border-white/10 text-white p-4 md:p-8 rounded-2xl md:rounded-[32px]">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg md:text-2xl font-headline">Affiliate Marketing</CardTitle>
              </CardHeader>
              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Section Heading</Label>
                  <Input 
                    value={content.referral.title}
                    onChange={(e) => setContent({ ...content, referral: { ...content.referral, title: e.target.value }})}
                    className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Structure Image Upload</Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleReferralImageUpload}
                        className="bg-black/40 border-white/10 h-auto text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary/15 file:px-3 file:py-1 file:text-primary"
                      />
                      {uploadingReferralImage ? (
                        <span className="text-sm text-primary">Uploading...</span>
                      ) : (
                        <span className="text-sm text-white/50">PNG, JPG, or WEBP</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Structure Image URL</Label>
                      <Input 
                        value={content.referral.imageUrl}
                        onChange={(e) => setContent({ ...content, referral: { ...content.referral, imageUrl: e.target.value }})}
                        className="bg-black/40 border-white/10 h-10 md:h-12 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-xs uppercase tracking-widest font-bold">Description</Label>
                      <Textarea 
                        value={content.referral.description}
                        onChange={(e) => setContent({ ...content, referral: { ...content.referral, description: e.target.value }})}
                        className="bg-black/40 border-white/10 min-h-[80px] md:min-h-[100px] text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-[#020617]/95 border-t border-white/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('trading')}
            className={
              activeTab === 'trading'
                ? 'flex-1 rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white'
                : 'flex-1 rounded-2xl px-3 py-2 text-xs text-white/70 hover:bg-white/5'
            }
          >
            Trading
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={
              activeTab === 'branding'
                ? 'flex-1 rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white'
                : 'flex-1 rounded-2xl px-3 py-2 text-xs text-white/70 hover:bg-white/5'
            }
          >
            Branding
          </button>
          <button
            type="button"
            onClick={() => router.push('/terminal')}
            className="flex-1 rounded-2xl bg-primary px-3 py-2 text-xs font-semibold text-black"
          >
            Terminal
          </button>
        </div>
      </nav>
    </div>
  );
}

