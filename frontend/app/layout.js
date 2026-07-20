import './reborn.css';
import Link from 'next/link';
import Script from 'next/script';
import AdSlot from '@/components/AdSlot';
import Sidebar from '@/components/Sidebar';
import PageLogger from '@/components/PageLogger';
import { ADSENSE_ENABLED } from '@/lib/adsense';

export const metadata = {
  metadataBase: new URL('https://www.rebornbiz.co.kr'),
  title: 'RebornBiz | 소상공인 폐업 및 재창업 지원 플랫폼',
  description: '폐업 비용 진단, 상권 분석 시뮬레이션, 정부 지원 정책 안내 플랫폼',
  openGraph: {
    title: 'RebornBiz',
    description: '소상공인 창업 및 상권 분석 가이드',
    url: 'https://www.rebornbiz.co.kr',
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
        {ADSENSE_ENABLED && (
          <Script 
            async 
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4577150400116930" 
            crossOrigin="anonymous" 
            strategy="afterInteractive"
          />
        )}
        <Script 
          src="//wcs.pstatic.net/wcslog.js"
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
              {children}
            </main>


            {/* 공통 푸터 */}
            <footer className="site-footer" style={{ textAlign: 'left', padding: '2rem 3rem', backgroundColor: '#ffffff', color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
              <strong style={{ color: '#64748b', fontSize: '14px', display: 'block', marginBottom: '8px' }}>면책 고지</strong>
              <p style={{ margin: '0 0 20px 0' }}>
                RebornBiz는 국세청 및 공공 기관의 공개된 통계 자료와 상권 데이터를 기반으로 제공되는 참고용 정보 서비스입니다. 분석 결과 및 데이터는 실제 시장 상황과 다를 수 있으며, 최종적인 사업적 판단과 책임은 사용자 본인에게 있습니다. 통계 데이터의 수치는 출처 기관의 사정에 따라 사전 고지 없이 업데이트되거나 변경될 수 있습니다.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', fontWeight: '600', color: '#64748b', marginBottom: '12px', flexWrap: 'wrap' }}>
                <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>사이트 소개</Link>
                <span>·</span>
                <Link href="/policy" style={{ color: 'inherit', textDecoration: 'none' }}>개인정보처리방침</Link>
                <span>·</span>
                <a href="mailto:help.rebornbiz@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>제휴 및 문의</a>
              </div>
              
              <div style={{ fontSize: '12px' }}>
                © {new Date().getFullYear()} RebornBiz. All rights reserved.
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
