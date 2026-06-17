import Link from 'next/link';
import StickyHeader from '@/components/StickyHeader';

export default function HomePage() {
  return (
    <div className="custom-main">
      <StickyHeader>
        <h1>소상공인 지원 플랫폼</h1>
        <p>여러분의 새로운 시작과 도약을 체계적이고 안전하게 돕기 위해 마련된 종합 플랫폼입니다.</p>
      </StickyHeader>

      <div className="custom-grid">
        {/* 폐업 비용 계산기 */}
        <div className="custom-card diag">
          <div className="card-icon-box">🧮</div>
          <div className="card-content">
            <span className="card-badge">진단</span>
            <h3>폐업 비용 계산기</h3>
            <p>철거비, 위약금 등 사업 정리 시 발생하는 각종 예상 비용을 데이터로 정확히 산출합니다.</p>
            <Link href="/calculator" className="custom-btn">비용 계산하기</Link>
          </div>
        </div>
        
        {/* 세금 자동 계산기 */}
        <div className="custom-card tax">
          <div className="card-icon-box">🧾</div>
          <div className="card-content">
            <span className="card-badge">세무</span>
            <h3>세금 자동 계산기</h3>
            <p>폐업 시 매입세액 공제 자산에 대한 부가가치세(잔존재화 간주공급)를 세법 기준으로 산출합니다.</p>
            <Link href="/tax_cal" className="custom-btn">세금 계산하기</Link>
          </div>
        </div>

        {/* 업종 변경 시뮬레이션 */}
        <div className="custom-card simul">
          <div className="card-icon-box">📈</div>
          <div className="card-content">
            <span className="card-badge">분석</span>
            <h3>업종 변경 시뮬레이션</h3>
            <p>새로운 업종 전환 시의 예상 리스크와 수익성을 분석하여 안전한 도전을 지원합니다.</p>
            <Link href="/simulation" className="custom-btn">시뮬레이션 시작</Link>
          </div>
        </div>

        {/* 내 주변 상권 분석 */}
        <div className="custom-card area">
          <div className="card-icon-box">📍</div>
          <div className="card-content">
            <span className="card-badge">상권</span>
            <h3>내 주변 상권 분석</h3>
            <p>현재 위치 기반 상권 밀집도와 업종 분포 파악하여 최적의 입지 전략을 제시합니다.</p>
            <Link href="/market_analysis" className="custom-btn">상권 분석하기</Link>
          </div>
        </div>

        {/* 정부 지원 정책 */}
        <div className="custom-card gov">
          <div className="card-icon-box">🏛️</div>
          <div className="card-content">
            <span className="card-badge">가이드</span>
            <h3>정부 지원 정책</h3>
            <p>재취업, 재창업 등 소상공인에게 꼭 필요한 정부 지원금을 한눈에 확인하고 신청하세요.</p>
            <Link href="/guide" className="custom-btn">지원 정책 확인</Link>
          </div>
        </div>

        {/* Reborn 매거진 */}
        <div className="custom-card mag">
          <div className="card-icon-box">📰</div>
          <div className="card-content">
            <span className="card-badge">인사이트</span>
            <h3>Reborn 매거진</h3>
            <p>빠르게 변화하는 소상공인 트렌드, 성공적인 비즈니스를 위한 인사이트와 가이드를 만나보세요.</p>
            <Link href="/magazine" className="custom-btn">매거진 읽기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
