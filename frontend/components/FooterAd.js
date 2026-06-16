'use client';
import { usePathname } from 'next/navigation';
import AdSlot from './AdSlot';

export default function FooterAd() {
  const pathname = usePathname();
  if (pathname === '/market_analysis') return null;
  return <AdSlot position="bottom" />;
}
