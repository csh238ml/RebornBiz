import './reborn.css';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';
import FooterAd from '@/components/FooterAd';
import Sidebar from '@/components/Sidebar';
import PageLogger from '@/components/PageLogger';

export const metadata = {
  metadataBase: new URL('https://rebornbiz.co.kr'),
  title: 'RebornBiz | 소상공인 폐업 및 재창업 지원 플랫폼',
  description: '폐업 비용 진단, 상권 분석 시뮬레이션, 정부 지원 정책 안내 플랫폼',
  openGraph: {
    title: 'RebornBiz',
    description: '소상공인 창업 및 상권 분석 가이드',
    url: 'https://rebornbiz.co.kr',
    siteName: 'RebornBiz',
    images: [{ url: '/images/og-image.png' }],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="true" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4577150400116930" 
          crossOrigin="anonymous" 
          strategy="afterInteractive"
        />
      </head>
      <body>
        <PageLogger />
        <div className="layout-container">
          <Sidebar />

          {/* 2. 우측 메인 콘텐츠 영역 */}
          <div className="main-wrapper">
            <main className="main-content">
              <img 
                src="/images/rebornbiz_main.jpg" 
                alt="RebornBiz Banner" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: '200px',
                  objectFit: 'cover', 
                  borderRadius: '12px', 
                  marginBottom: '1rem' 
                }} 
              />
              {children}
            </main>


            {/* 하단 공통 광고 영역 (상권분석 메뉴 제외) */}
            <section style={{ padding: '0 2rem' }}>
              <FooterAd />
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
