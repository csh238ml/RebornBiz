import Link from 'next/link';
import './home.css';

export default function HomeHero() {
  return (
    <section className="home-section bg-gray" style={{ padding: 0, marginTop: '1rem', borderRadius: '1rem' }}>
      <div className="hero-section">
        <div className="hero-content">
          <span className="badge">소상공인 데이터 의사결정 도구</span>
          <h1>
            폐업부터 재창업까지,<br />
            숫자와 데이터로<br />
            먼저 확인하세요
          </h1>
          <p>
            폐업 비용과 세금, 주변 상권, 업종 전환 가능성을<br />
            공공데이터 기반 도구로 분석합니다.
          </p>
          <div className="hero-actions">
            <Link href="#core-tools" className="cta-button cta-primary">
              내게 맞는 도구 확인하기
            </Link>
          </div>
          <div className="trust-badges">
            <span className="trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              공공데이터 기반
            </span>
            <span className="trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              회원가입 없이 이용
            </span>
            <span className="trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              무료 계산 도구
            </span>
            <span className="trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              결과 산출 근거 제공
            </span>
          </div>
        </div>
        <div className="hero-preview">
          <div className="preview-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              폐업 준비 분석
            </h3>
            <div className="preview-item">
              <span>정리 비용</span>
              <span>계산 후 확인</span>
            </div>
            <div className="preview-item">
              <span>지원 가능 항목</span>
              <span>조건별 안내</span>
            </div>
            <div className="preview-item" style={{ borderBottom: 'none' }}>
              <span>예상 세금</span>
              <span>계산 후 확인</span>
            </div>
            <div className="preview-notice">
              입력한 조건에 따라 예상 결과와 산출 근거를 제공합니다.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
