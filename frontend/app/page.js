import HomeHero from '@/components/home/HomeHero';
import ConcernSection from '@/components/home/ConcernSection';
import CoreToolsSection from '@/components/home/CoreToolsSection';
import LatestMagazine from '@/components/home/LatestMagazine';
import DataSources from '@/components/home/DataSources';
import HomeFaq from '@/components/home/HomeFaq';
import HomeFinalCta from '@/components/home/HomeFinalCta';
import '@/components/home/home.css';

export const metadata = {
  title: "RebornBiz | 폐업 비용·부가세 계산과 상권 분석",
  description: "폐업 비용과 잔존재화 부가세를 계산하고, 창업·폐업 통계와 주변 상권 데이터를 분석해 소상공인의 다음 결정을 돕습니다.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RebornBiz | 폐업 비용·부가세 계산과 상권 분석",
    description: "폐업 비용과 잔존재화 부가세를 계산하고, 창업·폐업 통계와 주변 상권 데이터를 분석해 소상공인의 다음 결정을 돕습니다.",
    url: "https://www.rebornbiz.co.kr",
    siteName: "RebornBiz",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RebornBiz | 폐업 비용·부가세 계산과 상권 분석",
    description: "폐업 비용과 잔존재화 부가세를 계산하고, 창업·폐업 통계와 주변 상권 데이터를 분석해 소상공인의 다음 결정을 돕습니다.",
  }
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "RebornBiz",
      "url": "https://www.rebornbiz.co.kr"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "폐업 비용 계산 결과는 실제 비용과 동일한가요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "아닙니다. 입력한 매장 조건을 기준으로 계산한 예상 금액입니다. 실제 철거비, 위약금, 원상복구 비용은 계약 조건과 업체 견적에 따라 달라질 수 있습니다."
          }
        },
        {
          "@type": "Question",
          "name": "폐업 시 모든 사업자가 부가세를 추가로 납부하나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "모든 사업자에게 추가 부가세가 발생하는 것은 아닙니다. 매입세액 공제를 받은 자산의 보유 여부와 취득 시점 등 조건에 따라 달라질 수 있습니다."
          }
        },
        {
          "@type": "Question",
          "name": "주변 상권 데이터는 어디에서 가져오나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "RebornBiz는 프로젝트에서 연동된 공공데이터와 위치 기반 API를 활용해 주변 점포와 업종 정보를 분석합니다. 데이터 제공 시점에 따라 실제 현황과 차이가 있을 수 있습니다."
          }
        },
        {
          "@type": "Question",
          "name": "회원가입 없이 이용할 수 있나요?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "네. 현재 RebornBiz의 주요 계산 및 분석 도구는 회원가입 없이 이용할 수 있습니다."
          }
        }
      ]
    }
  ]
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <div className="home-container">
        <HomeHero />
        <ConcernSection />
        <CoreToolsSection />
        <LatestMagazine />
        <DataSources />
        <HomeFaq />
        <HomeFinalCta />
      </div>
    </>
  );
}
