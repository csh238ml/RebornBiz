export const metadata = {
  title: '내 주변 상권 분석 | RebornBiz',
  description: '현재 위치를 기반으로 상권 밀집도와 업종 분포를 파악하여 최적의 입지 전략을 제시합니다.',
  alternates: {
    canonical: '/market_analysis',
  },
};

export default function MarketAnalysisLayout({ children }) {
  return <>{children}</>;
}
