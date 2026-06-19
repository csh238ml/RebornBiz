'use client';
import { useState, useEffect } from 'react';
import StickyHeader from '@/components/StickyHeader';

export default function SimulationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Region State
  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [dongList, setDongList] = useState([]);
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [dong, setDong] = useState('');

  // Industry State
  const [largeList, setLargeList] = useState([]);
  const [cMediumList, setCMediumList] = useState([]);
  const [cSmallList, setCSmallList] = useState([]);
  const [tMediumList, setTMediumList] = useState([]);
  const [tSmallList, setTSmallList] = useState([]);

  const [cLarge, setCLarge] = useState('');
  const [cMedium, setCMedium] = useState('');
  const [cSmall, setCSmall] = useState('');

  const [tLarge, setTLarge] = useState('');
  const [tMedium, setTMedium] = useState('');
  const [tSmall, setTSmall] = useState('');

  const [investment, setInvestment] = useState(5000);

  // Fetch initial lists
  useEffect(() => {
    fetch('/api/regions/sido').then(res => res.json()).then(data => data.success && setSidoList(data.data));
    fetch('/api/categories/large').then(res => res.json()).then(data => data.success && setLargeList(data.data));
  }, []);

  // Region cascades
  useEffect(() => {
    if (sido) {
      fetch(`/api/regions/sigungu?sido=${encodeURIComponent(sido)}`).then(res => res.json()).then(data => {
        setSigunguList(data.success ? data.data : []);
        setSigungu(''); setDong(''); setDongList([]);
      });
    }
  }, [sido]);

  useEffect(() => {
    if (sido && sigungu) {
      fetch(`/api/regions/dong?sido=${encodeURIComponent(sido)}&sigungu=${encodeURIComponent(sigungu)}`).then(res => res.json()).then(data => {
        setDongList(data.success ? data.data : []);
        setDong('');
      });
    }
  }, [sido, sigungu]);

  // Current Industry cascades
  useEffect(() => {
    if (cLarge) {
      fetch(`/api/categories/medium?large=${encodeURIComponent(cLarge)}`).then(res => res.json()).then(data => {
        setCMediumList(data.success ? data.data : []);
        setCMedium(''); setCSmall(''); setCSmallList([]);
      });
    }
  }, [cLarge]);

  useEffect(() => {
    if (cMedium) {
      fetch(`/api/categories/small?medium=${encodeURIComponent(cMedium)}`).then(res => res.json()).then(data => {
        setCSmallList(data.success ? data.data : []);
        setCSmall('');
      });
    }
  }, [cMedium]);

  // Target Industry cascades
  useEffect(() => {
    if (tLarge) {
      fetch(`/api/categories/medium?large=${encodeURIComponent(tLarge)}`).then(res => res.json()).then(data => {
        setTMediumList(data.success ? data.data : []);
        setTMedium(''); setTSmall(''); setTSmallList([]);
      });
    }
  }, [tLarge]);

  useEffect(() => {
    if (tMedium) {
      fetch(`/api/categories/small?medium=${encodeURIComponent(tMedium)}`).then(res => res.json()).then(data => {
        setTSmallList(data.success ? data.data : []);
        setTSmall('');
      });
    }
  }, [tMedium]);

  // Auto-sync Target Large/Medium when Current Small is selected
  const handleCSmallChange = (val) => {
    setCSmall(val);
    if (val && val !== '') {
      setTLarge(cLarge);
      setTMedium(cMedium);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sido || !cSmall || !tSmall) {
      setError('지역 및 업종 소분류를 모두 선택해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const region_str = `${sido} ${sigungu} ${dong}`.trim();
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: region_str,
          current_biz: cSmall,
          target_biz: tSmall,
          investment: Number(investment)
        })
      });
      const data = await res.json();
      if(data.success) {
        setResult(data.data);
      } else {
        setError(data.message || '오류가 발생했습니다.');
      }
    } catch(err) {
      setError('서버 연동에 실패했습니다. 백엔드 서버가 실행 중인지 확인하세요.');
    }
    setLoading(false);
  }

  const selectStyle = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA', marginBottom: '0.5rem' };
  const labelStyle = { display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 'bold' };

  return (
    <div className="custom-main">
      <StickyHeader>
        <div className="pc-only" style={{ alignItems: 'center', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '1rem' }}>
          <div style={{ flexShrink: 0, marginRight: '2rem' }}>
            <img src="/rebornBiz_logo.png" alt="RebornBiz Logo" style={{ width: '200px', height: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#31333F' }}>업종 변경 시뮬레이션</h1>
            <p style={{ fontSize: '1rem', marginBottom: '0', lineHeight: '1.6', color: '#555' }}>새로운 업종 전환 시의 예상 리스크와 수익성을 분석합니다.</p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#31333F' }}>업종 변경 시뮬레이션</h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>새로운 업종 전환 시의 예상 리스크와 수익성을 분석합니다.</p>
        </div>
      </StickyHeader>

      <hr style={{borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0'}} />

      <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>1. 지역 및 예산 설정</h3>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{flex: '1 1 200px'}}>
          <label style={labelStyle}>시/도</label>
          <select value={sido} onChange={e => setSido(e.target.value)} style={selectStyle}>
            <option value="">선택하세요</option>
            {sidoList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{flex: '1 1 200px'}}>
          <label style={labelStyle}>시/군/구</label>
          <select value={sigungu} onChange={e => setSigungu(e.target.value)} style={selectStyle} disabled={!sido}>
            <option value="">선택하세요</option>
            {sigunguList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{flex: '1 1 200px'}}>
          <label style={labelStyle}>읍/면/동</label>
          <select value={dong} onChange={e => setDong(e.target.value)} style={selectStyle} disabled={!sigungu}>
            <option value="">전체</option>
            {dongList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      
      <div style={{ marginBottom: '2rem', maxWidth: '300px' }}>
        <label style={labelStyle}>💰 가용 투자 예산 (만원)</label>
        <input type="number" value={investment} onChange={e => setInvestment(e.target.value)} style={selectStyle} />
      </div>

      <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>2. 업종 전환 정보</h3>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{flex: '1 1 300px', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff'}}>
          <h4 style={{marginBottom: '1rem', color: '#1E3A8A', fontWeight: 'bold'}}>🏢 현재 업종</h4>
          <label style={labelStyle}>대분류 (현재)</label>
          <select value={cLarge} onChange={e => setCLarge(e.target.value)} style={selectStyle}>
            <option value="">선택하세요</option>
            {largeList.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <label style={labelStyle}>중분류 (현재)</label>
          <select value={cMedium} onChange={e => setCMedium(e.target.value)} style={selectStyle} disabled={!cLarge}>
            <option value="">선택하세요</option>
            {cMediumList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <label style={labelStyle}>소분류 (현재)</label>
          <select value={cSmall} onChange={e => handleCSmallChange(e.target.value)} style={selectStyle} disabled={!cMedium}>
            <option value="">선택하세요</option>
            {cSmallList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{flex: '1 1 300px', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff'}}>
          <h4 style={{marginBottom: '1rem', color: '#1E3A8A', fontWeight: 'bold'}}>🚀 전환 희망 업종</h4>
          <label style={labelStyle}>대분류 (희망)</label>
          <select value={tLarge} onChange={e => setTLarge(e.target.value)} style={selectStyle}>
            <option value="">선택하세요</option>
            {largeList.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <label style={labelStyle}>중분류 (희망)</label>
          <select value={tMedium} onChange={e => setTMedium(e.target.value)} style={selectStyle} disabled={!tLarge}>
            <option value="">선택하세요</option>
            {tMediumList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <label style={labelStyle}>소분류 (희망)</label>
          <select value={tSmall} onChange={e => setTSmall(e.target.value)} style={selectStyle} disabled={!tMedium}>
            <option value="">선택하세요</option>
            {tSmallList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{marginBottom: '2rem'}}>
        <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.75rem 2rem', backgroundColor: '#FF4B4B', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', width: '100%', maxWidth: '400px' }}>
          {loading ? '분석 중...' : '시뮬레이션 실행 ➡️'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#ffbd45', color: '#31333F', borderRadius: '0.25rem', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div>
          <hr style={{borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0'}} />
          <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>3. 기대 수익률 및 핵심 지표</h3>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div style={{flex: '1 1 200px', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.5rem' }}>예상 초기 세팅 비용</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#31333F' }}>{result.target_setup_cost.toLocaleString()} 만원</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: result.investment >= result.target_setup_cost ? '#09AB3B' : '#FF4B4B' }}>
                {result.investment >= result.target_setup_cost ? '✅ 예산 내 가능' : '❌ 예산 초과'}
              </div>
            </div>
            <div style={{flex: '1 1 200px', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.5rem' }}>예상 투자금 회수(BEP)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#31333F' }}>
                {result.bep_months === Infinity ? '불가' : `${result.bep_months} 개월`}
              </div>
            </div>
            <div style={{flex: '1 1 200px', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.5rem' }}>월별 예상 추가 수익</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: result.additional_profit > 0 ? '#09AB3B' : '#FF4B4B' }}>
                {result.additional_profit > 0 ? '+' : ''}{result.additional_profit.toLocaleString()} 만원
              </div>
            </div>
            <div style={{flex: '1 1 200px', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.5rem' }}>예상 ROI (연간)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#31333F' }}>{result.roi} %</div>
            </div>
          </div>

          {result.store_count !== undefined && (
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#eff6ff', color: '#1e3a8a', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid #bfdbfe' }}>
              💡 <b>상권 실데이터 연동:</b> 해당 지역 내 동일 업종 점포 수는 총 <b>{result.store_count}개</b> 입니다. ({result.api_source || '공공데이터 API'})
            </div>
          )}
          
          <h4 style={{fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem'}}>📈 상세 분석 내용</h4>
          <ul style={{ lineHeight: '1.8', fontSize: '1rem', color: '#444' }}>
            <li><b>현재 업종 ({cSmall}) 예상 월 순이익:</b> {result.current_profit.toLocaleString()} 만원</li>
            <li><b>타겟 업종 ({tSmall}) 예상 월 순이익:</b> {result.target_profit.toLocaleString()} 만원</li>
            <li><b>분석 기준 가용 예산:</b> {result.investment.toLocaleString()} 만원</li>
          </ul>
        </div>
      )}
    </div>
  );
}
