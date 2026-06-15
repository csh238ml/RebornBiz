import './globals.css';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export const metadata = {
  title: 'RebornBiz | 소상공인 창업 및 상권 분석 가이드',
  description: '폐업 비용 진단, 상권 분석 시뮬레이션, 정부 지원 정책 안내 플랫폼',
  openGraph: {
    title: 'RebornBiz',
    description: '소상공인 창업 및 상권 분석 가이드',
    url: 'https://rebornbiz.co.kr',
    siteName: 'RebornBiz',
    images: [{ url: '/images/default-thumbnail.jpg' }],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {/* 공통 헤더 (메뉴 구조 유지) */}
        <header className="site-header">
          <nav>
            <Link href="/">홈</Link>
            <Link href="/calculator">계산기</Link>
            <Link href="/tax_cal">세금 계산기</Link>
            <Link href="/market_analysis">상권 분석</Link>
            <Link href="/guide">가이드</Link>
            <Link href="/magazine">매거진</Link>
            <Link href="/simulation">시뮬레이션</Link>
          </nav>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="main-content">
          {children}
        </main>

        {/* 하단 공통 광고 영역 */}
        <section className="ad-section">
          <AdSlot position="bottom" />
        </section>

        {/* 공통 푸터 */}
        <footer className="site-footer">
          <p>© {new Date().getFullYear()} RebornBiz. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
