import './globals.css';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

export const metadata = {
  metadataBase: new URL('https://rebornbiz.co.kr'),
  title: 'RebornBiz | 소상공인 폐업 및 재창업 지원 플랫폼',
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
        <div className="layout-container">
          {/* 1. 좌측 사이드바 (고정) */}
          <aside className="sidebar">
            <Link href="/" className="sidebar-title">RebornBiz</Link>
            <nav>
              <Link href="/">🏠 홈</Link>
              <Link href="/calculator">🧮 폐업 비용 계산기</Link>
              <Link href="/tax_cal">🧾 폐업 세금 계산기</Link>
              <Link href="/simulation">📈 업종 변경 시뮬레이션</Link>
              <Link href="/market_analysis">📍 내 주변 상권 분석</Link>
              <Link href="/guide">🏛️ 정부 지원 정책</Link>
              <Link href="/magazine">📰 Reborn 매거진</Link>
            </nav>
          </aside>

          {/* 2. 우측 메인 콘텐츠 영역 */}
          <div className="main-wrapper">
            <main className="main-content">
              {children}
            </main>

            {/* 하단 공통 광고 영역 */}
            <section style={{ padding: '0 2rem' }}>
              <AdSlot position="bottom" />
            </section>

            {/* 공통 푸터 */}
            <footer className="site-footer">
              <p>© {new Date().getFullYear()} RebornBiz. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
