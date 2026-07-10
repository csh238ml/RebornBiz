export default function DataSources() {
  return (
    <section className="home-section bg-white">
      <div className="section-header">
        <h2 style={{ textAlign: 'left' }}>공개 데이터를 기반으로 제공합니다</h2>
        <p style={{ textAlign: 'left' }}>RebornBiz는 신뢰할 수 있는 기관의 데이터를 활용합니다.</p>
      </div>
      <div className="data-sources">
        <div className="data-source-card">국세청</div>
        <div className="data-source-card">KOSIS 국가통계포털</div>
        <div className="data-source-card">카카오 로컬 API</div>
      </div>
      <div className="preview-notice" style={{ textAlign: 'left', margin: 0, marginTop: '1rem' }}>
        RebornBiz는 공개된 통계와 공공데이터를 이해하기 쉬운 계산 및 분석 도구로 제공합니다. 제공되는 결과는 참고용이며 실제 계약, 세무 신고, 창업 결정 전에는 관련 전문가와 공식 기관의 최신 기준을 확인해 주세요.
      </div>
    </section>
  );
}
