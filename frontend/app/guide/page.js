'use client';
import { useState, useEffect } from 'react';

export default function GuidePage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('지원금'); // '지원금', '컨설팅', '기타'

  const fetchPolicies = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const FASTAPI_URL = 'http://localhost:8000';
      const url = search ? `${FASTAPI_URL}/api/policies?search=${encodeURIComponent(search)}` : `${FASTAPI_URL}/api/policies`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPolicies(data.data);
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없습니다. 백엔드 서버(포트 8000)가 실행 중인지 확인하세요.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPolicies(searchTerm);
  };

  // 탭 필터링
  const tab1Policies = policies.filter(p => p.pldir_sport_realm_lclas_code_nm.includes('금융') || p.pblanc_nm.includes('자금'));
  const tab2Policies = policies.filter(p => p.pldir_sport_realm_lclas_code_nm.includes('경영') || p.pldir_sport_realm_lclas_code_nm.includes('창업'));
  const tab3Policies = policies.filter(p => !tab1Policies.includes(p) && !tab2Policies.includes(p));

  const currentPolicies = searchTerm ? policies : (activeTab === '지원금' ? tab1Policies : (activeTab === '컨설팅' ? tab2Policies : tab3Policies));

  const renderBullets = (text) => {
    if (!text) return "• 상세 내용은 공식 공고문을 참조하세요.";
    return text.split('\n').filter(line => line.trim()).map((line, idx) => {
      let cleanLine = line.trim();
      if (cleanLine.startsWith('-') || cleanLine.startsWith('•') || cleanLine.startsWith('*')) {
        cleanLine = cleanLine.substring(1).trim();
      }
      return <div key={idx} style={{marginBottom: '4px'}}>• {cleanLine}</div>;
    });
  };

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', color: '#31333F'}}>
      <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem'}}>🏛️ [가이드] 정부 지원 정책</h1>
      <p style={{fontSize: '1rem', marginBottom: '2rem', lineHeight: '1.6'}}>폐업 예정자 및 재창업 소상공인을 위한 다양한 <b>정부 지원금, 컨설팅 프로그램, 세제 혜택</b> 등을 안내합니다.<br/>현재 상황에 맞는 지원 정책을 확인하고 혜택을 놓치지 마세요!</p>

      <hr style={{borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0'}} />

      <form onSubmit={handleSearch} style={{display: 'flex', gap: '0.5rem', marginBottom: '2rem'}}>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="🔍 지원 정책 통합 검색 (예: 철거비, 청년 창업, 대출 등)" 
          style={{flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA'}}
        />
        <button type="submit" style={{padding: '0 1.5rem', backgroundColor: '#FFFFFF', color: '#FF4B4B', border: '1px solid #FF4B4B', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer'}}>검색</button>
      </form>

      {error && <div style={{ padding: '1rem', backgroundColor: '#ffbd45', color: '#31333F', borderRadius: '0.25rem', marginBottom: '2rem' }}>{error}</div>}

      {!searchTerm && (
        <div style={{display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(49, 51, 63, 0.2)', marginBottom: '2rem'}}>
          {['지원금', '컨설팅', '기타'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', padding: '0.75rem 1rem', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                borderBottom: activeTab === tab ? '3px solid #FF4B4B' : '3px solid transparent',
                color: activeTab === tab ? '#FF4B4B' : '#31333F'
              }}
            >
              {tab === '지원금' ? '💰 정부 지원금 (금융/자금)' : (tab === '컨설팅' ? '👨‍💼 컨설팅 프로그램' : '🧾 기타 정책 (세제/일반)')}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{textAlign: 'center', padding: '3rem', color: '#666'}}>데이터를 불러오는 중입니다...</div>
      ) : (
        <div>
          {searchTerm && <h3 style={{color: '#1E3A8A', marginBottom: '1.5rem'}}>🔎 '{searchTerm}' 검색 결과</h3>}
          {currentPolicies.length === 0 ? (
            <div style={{padding: '2rem', backgroundColor: '#F8F9FA', textAlign: 'center', borderRadius: '0.5rem'}}>정책 정보가 없습니다.</div>
          ) : (
            currentPolicies.map((p, idx) => (
              <div key={idx} style={{backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(30, 58, 138, 0.02)', padding: '32px 24px', marginBottom: '24px'}}>
                <div style={{display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap'}}>
                  <span style={{backgroundColor: '#fff0ea', color: '#FF8C42', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold'}}>⚡ 접수중</span>
                  <span style={{backgroundColor: '#eff6ff', color: '#1E3A8A', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold'}}>{p.pldir_sport_realm_lclas_code_nm || '지원사업'}</span>
                  <span style={{backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold'}}>{p.jrsd_instt_nm}</span>
                </div>
                <h3 style={{color: '#1E3A8A', marginTop: 0, marginBottom: '24px', fontSize: '1.35rem', lineHeight: '1.5'}}>{p.pblanc_nm}</h3>

                <h4 style={{color: '#1E3A8A', marginTop: 0, marginBottom: '10px', fontSize: '1.05rem', fontWeight: '700'}}>🎯 1. 누가 받을 수 있나요?</h4>
                <div style={{color: '#475569', lineHeight: '1.7', marginBottom: '24px', fontSize: '0.95rem'}}>{renderBullets(p.trget_nm)}</div>

                <h4 style={{color: '#1E3A8A', marginTop: 0, marginBottom: '10px', fontSize: '1.05rem', fontWeight: '700'}}>💰 2. 어떤 혜택을 받나요?</h4>
                <div style={{color: '#475569', lineHeight: '1.7', marginBottom: '24px', fontSize: '0.95rem'}}>{renderBullets(p.bsns_sumry_cn)}</div>

                <h4 style={{color: '#1E3A8A', marginTop: 0, marginBottom: '10px', fontSize: '1.05rem', fontWeight: '700'}}>📋 3. 어떻게 신청하나요?</h4>
                <div style={{color: '#475569', lineHeight: '1.7', marginBottom: '28px', fontSize: '0.95rem'}}>{renderBullets(p.reqst_mth_papers_cn)}</div>

                <div style={{color: '#ef4444', fontWeight: 'bold', marginBottom: '16px', fontSize: '0.95rem'}}>📅 신청기간: {p.reqst_begin_end_de}</div>

                {p.pblanc_url && p.pblanc_url.startsWith('http') && (
                  <a href={p.pblanc_url} target="_blank" rel="noreferrer" style={{display: 'block', width: '100%', textAlign: 'center', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '14px 0', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '1.05rem', marginTop: '10px'}}>
                    👉 원본 공고문 바로가기
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
