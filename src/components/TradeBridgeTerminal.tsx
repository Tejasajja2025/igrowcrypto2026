"use client";

import { TradeCommandCenter } from '@/components/trade/TradeCommandCenter';

export function TradeBridgeTerminal({ showFollowerTerminal = true }: { showFollowerTerminal?: boolean }) {
  return <TradeCommandCenter showFollowerTerminal={showFollowerTerminal} />;
}
