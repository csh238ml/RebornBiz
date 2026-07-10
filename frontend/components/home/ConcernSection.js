import Link from 'next/link';

export default function ConcernSection() {
  return (
    <section className="home-section bg-white">
      <div className="section-header text-center">
        <h2>지금 무엇을 고민하고 계신가요?</h2>
        <p>현재 상황에 맞는 도구부터 선택해 보세요.</p>
      </div>
      <div className="grid-3">
        <div className="card">
          <div className="card-title-row">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
            <h3>폐업을 준비 중이에요</h3>
          </div>
          <div style={{ marginTop: 'auto', fontSize: '13px', color: '#94a3b8' }}>
            아래 핵심 도구에서 비용·세금 계산기를 선택하세요.
          </div>
        </div>
        
        <div className="card">
          <div className="card-title-row">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
            <h3>새로운 업종을 고민 중이에요</h3>
          </div>
          <div style={{ marginTop: 'auto', fontSize: '13px', color: '#94a3b8' }}>
            아래 핵심 도구에서 업종 변경 시뮬레이션을 선택하세요.
          </div>
        </div>

        <div className="card">
          <div className="card-title-row">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <h3>창업 지역을 알아보고 있어요</h3>
          </div>
          <div style={{ marginTop: 'auto', fontSize: '13px', color: '#94a3b8' }}>
            아래 핵심 도구에서 주변 상권 분석을 선택하세요.
          </div>
        </div>
      </div>
    </section>
  );
}
