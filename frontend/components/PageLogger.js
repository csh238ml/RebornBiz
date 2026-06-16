'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const menuMapping = {
  '/': '홈',
  '/market_analysis': '내 주변 상권 분석',
  '/simulation': '업종별 시뮬레이션',
  '/calculator': '폐업 비용 계산기',
  '/tax_cal': '폐업 세금(부가세) 자동 계산기',
  '/guide': '정부지원 가이드라인',
  '/magazine': 'RebornBiz 매거진'
};

export default function PageLogger() {
  const pathname = usePathname();
  
  useEffect(() => {
    let menuName = '기타 페이지';
    if (menuMapping[pathname]) {
      menuName = menuMapping[pathname];
    } else if (pathname.startsWith('/magazine/')) {
      menuName = '매거진 상세 조회';
    }
    
    // Log access
    fetch('/api/log_access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menu_name: menuName })
    }).catch(e => console.error('Logging failed:', e));
  }, [pathname]);

  return null;
}
