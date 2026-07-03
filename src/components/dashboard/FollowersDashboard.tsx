"use client";

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { safeJson } from '@/lib/utils';

type FollowerSummary = {
  id: string;
  name: string;
  followers: number;
  performance: string;
};

export default function FollowersDashboard() {
  const [followers, setFollowers] = useState<FollowerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        const response = await fetch('/api/followers', { cache: 'no-store' });
        const data = await safeJson(response);
        if (response.ok && data?.success) {
          setFollowers(
            (data.followers || []).map((item: any) => ({
              id: item.id,
              name: item.name,
              followers: item.followers ?? 0,
              performance: item.performance || '+0.00%',
            }))
          );
        } else if (!response.ok) {
          console.warn('Followers dashboard fetch failed', response.status, data);
        }
      } catch (error) {
        console.warn('Followers dashboard fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFollowers();
  }, []);

  return (
    <Card className="bg-white/5 border border-white/10 text-white rounded-[32px] shadow-xl shadow-black/15">
      <CardHeader className="p-8 border-b border-white/5">
        <CardTitle className="text-2xl font-headline">Followers Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trader</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-white/50">
                    Loading follower data...
                  </TableCell>
                </TableRow>
              ) : followers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-white/50">
                    No follower data available.
                  </TableCell>
                </TableRow>
              ) : (
                followers.map((follower) => (
                  <TableRow key={follower.id}>
                    <TableCell>{follower.name}</TableCell>
                    <TableCell>{follower.followers}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                        {follower.performance}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
