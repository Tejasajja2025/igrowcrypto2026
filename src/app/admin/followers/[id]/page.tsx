import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getFollowerById } from '@/lib/followers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, TrendingUp, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default async function FollowerPage({ params }: Props) {
  const follower = await getFollowerById(params.id);
  if (!follower) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#080D1B] text-white py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-white/40">Follower Dashboard</p>
            <h1 className="text-3xl font-bold">{follower.name}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/followers">
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Followers
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="bg-white/5 border border-white/10 rounded-[32px] shadow-xl shadow-black/20">
            <CardHeader className="p-8 border-b border-white/10">
              <CardTitle className="text-xl">Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-4">
                <div className="rounded-3xl bg-black/20 p-4">
                  <p className="text-sm text-white/50">Account ID</p>
                  <p className="font-semibold text-lg">{follower.accountId}</p>
                </div>
                <div className="rounded-3xl bg-black/20 p-4">
                  <p className="text-sm text-white/50">Followers</p>
                  <p className="font-semibold text-lg">{follower.followers}</p>
                </div>
                <div className="rounded-3xl bg-black/20 p-4">
                  <p className="text-sm text-white/50">Risk Profile</p>
                  <Badge className="bg-white/5 text-white border-white/10">{follower.risk}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[32px] shadow-xl shadow-black/20">
            <CardHeader className="p-8 border-b border-white/10">
              <CardTitle className="text-xl">Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-black/20 p-6">
                  <p className="text-sm text-white/50">Total Equity</p>
                  <p className="text-2xl font-bold text-white">{follower.equity}</p>
                </div>
                <div className="rounded-3xl bg-black/20 p-6">
                  <p className="text-sm text-white/50">Balance</p>
                  <p className="text-2xl font-bold text-white">{follower.balance}</p>
                </div>
                <div className="rounded-3xl bg-black/20 p-6">
                  <p className="text-sm text-white/50">Last Signal</p>
                  <p className="text-2xl font-bold text-white">{follower.lastSignal}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-black/20 p-6 flex items-center gap-3">
                  <Activity className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-white/50">Open Trades</p>
                    <p className="font-semibold text-lg">{follower.openTrades}</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-black/20 p-6 flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-white/50">Performance</p>
                    <p className="font-semibold text-lg">{follower.performance}</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-black/20 p-6 flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-white/50">Followers</p>
                    <p className="font-semibold text-lg">{follower.followers}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
