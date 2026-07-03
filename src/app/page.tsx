import Navbar from '@/components/layout/Navbar';
import AssetTicker from '@/components/sections/AssetTicker';
import Hero from '@/components/sections/Hero';
import Wealth from '@/components/sections/Wealth';
import CopyTrading from '@/components/sections/CopyTrading';
import StrategyScout from '@/components/sections/StrategyScout';
import MarketCatalog from '@/components/sections/MarketCatalog';
import RewardVisualizer from '@/components/sections/RewardVisualizer';
import Ecosystem from '@/components/sections/Ecosystem';
import Packages from '@/components/sections/Packages';
import ReferralBenefits from '@/components/sections/ReferralBenefits';
import Waitlist from '@/components/sections/Waitlist';
import Footer from '@/components/layout/Footer';
import { BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Wealth />
        <AssetTicker />
        <CopyTrading />
        <MarketCatalog />
        
        {/* Journey Block - Institutional Radial Curved */}
        <div className="relative overflow-hidden">
          {/* background layers for seamless transition */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#EFEFEF] -z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#080D1C] -z-10" />
          
          <div 
            className="w-full rounded-t-[40px] md:rounded-t-[160px] rounded-b-[40px] md:rounded-b-[160px] overflow-hidden border-y border-white/5 pt-8 md:pt-12 pb-8 md:pb-12 shadow-2xl relative"
            style={{ 
              background: 'radial-gradient(circle at center, #2A3E5C 0%, #0B1426 100%)',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            <Ecosystem />
          </div>
        </div>

        {/* AI & Analytics Block */}
        <div className="bg-[#080D1C] overflow-hidden pt-6 md:pt-10">
          <StrategyScout />
          <BarChart3 className="w-1 h-1 opacity-0" /> {/* Hidden trigger for chart styles if needed */}
          <RewardVisualizer />
          <Packages />
          <ReferralBenefits />
        </div>

        <Waitlist />
      </main>
      <Footer />
    </div>
  );
}
