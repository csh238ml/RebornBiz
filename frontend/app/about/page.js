import StickyHeader from '@/components/StickyHeader';

export const metadata = {
  title: 'RebornBiz 소개 | RebornBiz'
};

export default function AboutPage() {
  return (
    <div className="custom-main">
      <StickyHeader>
        <div className="pc-only" style={{ alignItems: 'center', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '2rem' }}>
          <div style={{ flexShrink: 0, marginRight: '2rem' }}>
            <img src="/rebornBiz_logo.png" alt="RebornBiz Logo" style={{ width: '200px', height: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0', color: '#1E3A8A' }}>📢 RebornBiz 소개</h1>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem', color: '#1E3A8A' }}>📢 RebornBiz 소개</h1>
        </div>
      </StickyHeader>

      <div style={{ lineHeight: '1.8', fontSize: '1.05rem', color: '#31333F' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>RebornBiz가 뭐예요?</h2>
          <p>
            RebornBiz(rebornbiz.co.kr)는 전국의 자영업·소상공인 및 예비 창업자 사장님들을 위해 상권 분석부터 폐업, 재창업까지의 의사결정을 데이터 기반으로 돕는 종합 프롭테크(Proptech) 플랫폼입니다. <br/>
            복잡한 내 주변 상권 분석과 상가 실거래가 조회부터, 막막한 폐업 비용 계산, 업종 변경 시뮬레이션, 그리고 꼭 필요한 정부 지원사업(정책자금, 희망리턴패키지 등) 가이드까지 사장님이 필요로 하는 핵심 도구와 정보를 한곳에 모아 쉬운 말로 제공하는 든든한 파트너입니다.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>데이터 출처</h2>
          <p>RebornBiz는 국가에서 제공하는 공식 데이터를 기반으로 작동합니다.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li><b>공공데이터포털</b>: 상업업무용 부동산 실거래 자료 및 소상공인 상권 정보</li>
            <li><b>소상공인시장진흥공단 (소상공인24)</b>: 희망리턴패키지, 철거비 지원 등 소상공인 특화 공고</li>
            <li><b>기업마당 / K-Startup</b>: 중앙·공공 지원사업 통합 공고 및 창업 관련 공고</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>업데이트 주기</h2>
          <p>
            지원사업 공고 및 상권 데이터는 자동화된 수집 시스템을 통해 매일(주기적으로) 최신화되어 반영됩니다. 다만, 데이터 수집 시점과 실제 공고 변경 시점 간의 차이가 발생할 수 있으므로, 신청 및 계약 전에는 반드시 원문 공고나 공식 행정기관의 안내를 함께 확인해 주세요.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>면책 고지</h2>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>RebornBiz는 공공데이터를 가공하여 사장님들이 이해하기 쉬운 참고용 정보를 제공할 뿐, 정부나 행정기관을 대변하는 공식 기관이 아닙니다.</li>
            <li style={{ marginBottom: '0.5rem' }}>상권 분석 결과, 폐업 비용 계산기 및 시뮬레이션은 사장님의 합리적 판단을 돕기 위한 보조 도구이며, 실제 소요되는 비용, 매출, 심사 결과를 보장하지 않습니다.</li>
            <li style={{ marginBottom: '0.5rem' }}>공고의 조건·금액·기한 및 상가 실거래가 정보는 사전 고지 없이 변경될 수 있으며, 원문과 본 사이트의 내용이 다를 경우 공식 기관의 원문이 우선합니다.</li>
            <li style={{ marginBottom: '0.5rem' }}>RebornBiz는 부동산 중개, 세무, 노무, 법률 상담을 대체하지 않습니다. 개별 사안의 구체적인 실행은 반드시 해당 분야 전문가에게 문의하시기 바랍니다.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>피드백 및 문의</h2>
          <p>
            잘못된 정보, 깨진 링크 신고 또는 서비스 기능 개선 제안은 운영팀(<a href="mailto:csh238ml@gmail.com" style={{ color: '#2563EB' }}>csh238ml@gmail.com</a>)으로 알려주시면 빠르게 검토하여 반영하겠습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
