import Link from 'next/link';

export default function CoreToolsSection() {
  return (
    <section id="core-tools" className="home-section bg-gray">
      <div className="section-header text-center">
        <h2>RebornBiz 핵심 도구</h2>
        <p>필요한 계산과 분석 도구를 선택해 바로 이용해 보세요.</p>
      </div>
      <div className="grid-3">
        
        <div className="card">
          <div className="card-title-row">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
            <h3>폐업 비용 계산기</h3>
          </div>
          <p>매장 평수, 임대료, 잔여 계약 기간을 바탕으로 철거비 등 예상 정리 비용을 확인합니다.</p>
          <div style={{ marginTop: 'auto' }}>
            <Link href="/calculator" className="cta-link" style={{ fontSize: '1rem' }}>
              계산하기 &rarr;
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-title-row">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>
            <h3>폐업 부가세 계산기</h3>
          </div>
          <p>잔존재화의 취득 시점과 금액을 기준으로 폐업 시 추가로 발생할 수 있는 부가세를 확인합니다.</p>
          <div style={{ marginTop: 'auto' }}>
            <Link href="/tax_cal" className="cta-link" style={{ fontSize: '1rem' }}>
              계산하기 &rarr;
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-title-row">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
            <h3>업종 변경 시뮬레이션</h3>
          </div>
          <p>현재 업종과 희망 업종, 예산을 비교하여 지역 상권에서의 업종 전환 가능성을 검토합니다.</p>
          <div style={{ marginTop: 'auto' }}>
            <Link href="/simulation" className="cta-link" style={{ fontSize: '1rem' }}>
              시뮬레이션 &rarr;
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-title-row">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <h3>내 주변 상권 분석</h3>
          </div>
          <p>현재 위치를 기준으로 점포 수와 업종 분포 등 주변 상권 정보를 파악합니다.</p>
          <div style={{ marginTop: 'auto' }}>
            <Link href="/market_analysis" className="cta-link" style={{ fontSize: '1rem' }}>
              분석하기 &rarr;
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-title-row">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16v5"/><path d="M16 14v7"/><path d="M20 10v11"/><path d="M4 18v3"/><path d="M8 14v7"/><path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"/></svg>
            <h3>창업·폐업 트렌드</h3>
          </div>
          <p>공공통계를 바탕으로 지역별, 연령별 창업 및 폐업 추이를 분석합니다.</p>
          <div style={{ marginTop: 'auto' }}>
            <Link href="/statistics" className="cta-link" style={{ fontSize: '1rem' }}>
              통계 보기 &rarr;
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
