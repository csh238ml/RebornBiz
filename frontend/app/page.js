import Link from 'next/link';

export default function HomePage() {
  return (
    <section>
      <header>
        <h1>소상공인을 위한 스마트 비즈니스 파트너, RebornBiz</h1>
        <h2>폐업 비용 진단부터 새로운 창업 시뮬레이션까지</h2>
      </header>
      
      <nav aria-label="주요 서비스">
        <ul className="service-list">
          <li>
            <Link href="/calculator">
              <h3>폐업 비용 계산기</h3>
              <p>정확한 폐업 비용을 미리 산정해보세요.</p>
            </Link>
          </li>
          <li>
            <Link href="/market_analysis">
              <h3>상권 분석 시뮬레이션</h3>
              <p>빅데이터 기반 성공적인 상권을 분석합니다.</p>
            </Link>
          </li>
          <li>
            <Link href="/magazine">
              <h3>Reborn 매거진</h3>
              <p>최신 정책과 창업 가이드를 확인하세요.</p>
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
