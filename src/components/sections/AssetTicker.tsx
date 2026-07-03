const assets = [
  { symbol: 'BTC/USD', price: '64,231.50', change: '+2.45%' },
  { symbol: 'ETH/USD', price: '3,456.12', change: '+1.12%' },
  { symbol: 'EUR/USD', price: '1.0842', change: '-0.05%' },
  { symbol: 'SOL/USD', price: '142.67', change: '+5.82%' },
  { symbol: 'GBP/JPY', price: '191.24', change: '+0.15%' },
  { symbol: 'XAU/USD', price: '2,314.50', change: '-0.32%' },
  { symbol: 'LINK/USD', price: '18.42', change: '+4.20%' },
  { symbol: 'USD/JPY', price: '151.62', change: '+0.12%' },
];

export default function AssetTicker() {
  return (
    <div className="w-full bg-secondary overflow-hidden border-y border-white/5 py-3">
      <div className="flex animate-scroll whitespace-nowrap">
        {[...assets, ...assets].map((asset, i) => (
          <div key={i} className="flex items-center gap-6 px-8 border-r border-white/5 last:border-0">
            <span className="font-headline font-medium text-sm text-foreground">{asset.symbol}</span>
            <span className="font-code text-sm font-medium">{asset.price}</span>
            <span className={`text-xs font-bold ${asset.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {asset.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}