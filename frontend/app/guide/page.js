import Link from 'next/link';
import StickyHeader from '@/components/StickyHeader';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

async function fetchPolicies(search = '') {
  try {
    const url = search
      ? `${FASTAPI_URL}/api/policies?search=${encodeURIComponent(search)}`
      : `${FASTAPI_URL}/api/policies`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error('Failed to fetch policies:', err);
    return [];
  }
}

export async function generateMetadata({ searchParams }) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';

  const title = search
    ? `'${search}' 검색 결과 | RebornBiz 정부 지원 정책`
    : '정부 지원 정책 가이드 | RebornBiz';

  return {
    title,
    description: '폐업 예정자 및 재창업 소상공인을 위한 맞춤형 정부 지원금, 컨설팅 프로그램, 세제 혜택 등을 안내합니다.',
    openGraph: {
      title,
      description: '소상공인을 위한 맞춤형 정부 지원금 및 혜택 정보를 확인하세요.',
      type: 'website',
    }
  };
}

const renderBullets = (rawText) => {
  if (!rawText) return "• 상세 내용은 공식 공고문을 참조하세요.";

  // 1. Remove complete <!--[data-hwpjson] ... --> blocks
  let text = rawText.replace(/<!--\[data-hwpjson\][\s\S]*?-->/g, '');

  // 2. Remove if truncated (no closing tag)
  const idx = text.indexOf('<!--[data-hwpjson]');
  if (idx !== -1) text = text.substring(0, idx);

  return text.split('\n').filter(line => line.trim()).map((line, i) => {
    let cleanLine = line.trim();
    if (cleanLine.startsWith('-') || cleanLine.startsWith('•') || cleanLine.startsWith('*')) {
      cleanLine = cleanLine.substring(1).trim();
    }
    // 3. Skip stray JSON lines if any escaped
    if (cleanLine === '{' || cleanLine === '}' || cleanLine.startsWith('"')) return null;

    return <div key={i} style={{ marginBottom: '4px' }}>• {cleanLine}</div>;
  });
};

export default async function GuidePage({ searchParams }) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';
  const policies = await fetchPolicies(search);
  const currentPolicies = policies;

  return (
    <div className="custom-main">
      <StickyHeader>
        <div className="pc-only" style={{ alignItems: 'center', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '1rem' }}>
          <div style={{ flexShrink: 0, marginRight: '2rem' }}>
            <img src="/rebornBiz_logo.png" alt="RebornBiz Logo" style={{ width: '200px', height: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#31333F' }}>정부 지원 정책</h1>
            <p style={{ fontSize: '1rem', marginBottom: '0', lineHeight: '1.6', color: '#555' }}>
              폐업 예정자 및 재창업 소상공인을 위한 다양한 <b>정부 지원금, 컨설팅 프로그램, 세제 혜택</b> 등을 안내합니다.<br />
              현재 상황에 맞는 지원 정책을 확인하고 혜택을 놓치지 마세요!
            </p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#31333F' }}>정부 지원 정책</h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>
            폐업 예정자 및 재창업 소상공인을 위한 다양한 <b>정부 지원금, 컨설팅 프로그램, 세제 혜택</b> 등을 안내합니다.<br />
            현재 상황에 맞는 지원 정책을 확인하고 혜택을 놓치지 마세요!
          </p>
        </div>
      </StickyHeader>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />

      <form action="/guide" method="GET" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="🔍 지원 정책 통합 검색 (예: 철거비, 청년 창업, 대출 등)"
          style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }}
        />
        <button type="submit" style={{ padding: '0 1.5rem', backgroundColor: '#FFFFFF', color: '#31333F', border: '1px solid rgba(49, 51, 63, 0.2)', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
          🔍 검색
        </button>
      </form>

      <div>
        {search && <h3 style={{ color: '#1E3A8A', marginBottom: '1.5rem' }}>🔎 '{search}' 검색 결과</h3>}
        {currentPolicies.length === 0 ? (
          <div style={{ padding: '2rem', backgroundColor: '#F8F9FA', textAlign: 'center', borderRadius: '0.5rem' }}>정책 정보가 없습니다.</div>
        ) : (
          currentPolicies.map((p, idx) => (
            <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(30, 58, 138, 0.02)', padding: '32px 24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: '#fff0ea', color: '#FF8C42', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>⚡ 접수중</span>
                <span style={{ backgroundColor: '#eff6ff', color: '#1E3A8A', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>{p.pldir_sport_realm_lclas_code_nm || '지원사업'}</span>
                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>{p.jrsd_instt_nm}</span>
              </div>
              <h3 style={{ color: '#1E3A8A', marginTop: 0, marginBottom: '24px', fontSize: '1.35rem', lineHeight: '1.5' }}>{p.pblanc_nm}</h3>

              <h4 style={{ color: '#1E3A8A', marginTop: 0, marginBottom: '10px', fontSize: '1.05rem', fontWeight: '700' }}>🎯 1. 누가 받을 수 있나요?</h4>
              <div style={{ color: '#475569', lineHeight: '1.7', marginBottom: '24px', fontSize: '0.95rem' }}>{renderBullets(p.trget_nm)}</div>

              <h4 style={{ color: '#1E3A8A', marginTop: 0, marginBottom: '10px', fontSize: '1.05rem', fontWeight: '700' }}>💰 2. 어떤 혜택을 받나요?</h4>
              <div style={{ color: '#475569', lineHeight: '1.7', marginBottom: '24px', fontSize: '0.95rem' }}>{renderBullets(p.bsns_sumry_cn)}</div>

              <h4 style={{ color: '#1E3A8A', marginTop: 0, marginBottom: '10px', fontSize: '1.05rem', fontWeight: '700' }}>📋 3. 어떻게 신청하나요?</h4>
              <div style={{ color: '#475569', lineHeight: '1.7', marginBottom: '28px', fontSize: '0.95rem' }}>{renderBullets(p.reqst_mth_papers_cn)}</div>

              <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '16px', fontSize: '0.95rem' }}>📅 신청기간: {p.reqst_begin_end_de}</div>

              {p.pblanc_url && p.pblanc_url.startsWith('http') && (
                <a href={p.pblanc_url} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', textAlign: 'center', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '14px 0', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '1.05rem', marginTop: '10px' }}>
                  👉 원본 공고문 바로가기
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
