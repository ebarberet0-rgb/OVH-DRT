import HeroSection from '../components/home/HeroSection';
import WhatAwaitsYou from '../components/home/WhatAwaitsYou';
import GoodToKnow from '../components/home/GoodToKnow';
import CallToAction from '../components/home/CallToAction';

export default function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <WhatAwaitsYou />
      <GoodToKnow />
      <CallToAction />
    </div>
  );
}
