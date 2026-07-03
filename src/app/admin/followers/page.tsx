import Link from 'next/link';
import { getFollowers } from '@/lib/followers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminFollowersPage() {
  const followers = await getFollowers();

  return (
    <div className="min-h-screen bg-[#080D1B] text-white py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-white/40">Admin Dashboard</p>
            <h1 className="text-3xl font-bold">Follower Accounts</h1>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="bg-white/5 border border-white/10 rounded-[32px] shadow-xl shadow-black/20">
          <CardHeader className="p-8 border-b border-white/10">
            <CardTitle className="text-2xl">Followers Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trader</TableHead>
                  <TableHead>Followers</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followers.map((follower) => (
                  <TableRow key={follower.id}>
                    <TableCell>{follower.name}</TableCell>
                    <TableCell>{follower.followers}</TableCell>
                    <TableCell>{follower.performance}</TableCell>
                    <TableCell>
                      <Badge className="bg-white/5 text-white border-white/10">{follower.risk}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/followers/${follower.id}`} className="text-primary font-semibold hover:underline">
                        View dashboard
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
