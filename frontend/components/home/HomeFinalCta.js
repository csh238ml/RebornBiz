import Link from 'next/link';

export default function HomeFinalCta() {
  return (
    <section className="home-section">
      <div className="final-cta">
        <h2>막연한 고민을 필요한 도구로 정리해 보세요</h2>
        <p>비용 계산, 세금 확인, 상권 분석과 업종 전환 검토를 한곳에서 시작할 수 있습니다.</p>
        <div className="hero-actions" style={{ justifyContent: 'center', marginBottom: 0 }}>
          <Link href="#core-tools" className="cta-button cta-secondary" style={{ backgroundColor: '#FFFFFF', color: '#1E3A8A' }}>
            핵심 도구 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
