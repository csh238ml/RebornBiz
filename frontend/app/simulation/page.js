'use client';
import { useState } from 'react';
import StickyHeader from '@/components/StickyHeader';

export default function SimulationPage() {
  const [formData, setFormData] = useState({
    current_biz: '카페',
    target_biz: '치킨전문점',
    investment: 5000
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if(data.success) {
        setResult(data.data);
      } else {
        setError(data.message);
      }
    } catch(err) {
      setError('서버 연동에 실패했습니다. 백엔드 서버(포트 8000)가 실행 중인지 확인하세요.');
    }
    setLoading(false);
  }

  const bizOptions = ["카페", "치킨전문점", "편의점", "배달전문점", "무인아이스크림", "알 수 없음"];

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 2rem 2rem', fontFamily: 'sans-serif', color: '#31333F'}}>
      <StickyHeader>
        <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem'}}>업종 변경 시뮬레이션</h1>
        <p style={{fontSize: '1rem', marginBottom: '0'}}>새로운 업종 전환 시의 예상 리스크와 수익성을 분석합니다.</p>
      </StickyHeader>

      <hr style={{borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0'}} />

      <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>시뮬레이션 조건 입력</h3>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{flex: '1 1 200px'}}>
          <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>현재 운영 중인 업종</label>
          <select name="current_biz" value={formData.current_biz} onChange={handleChange} style={{width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA'}}>
            {bizOptions.map(biz => <option key={biz} value={biz}>{biz}</option>)}
          </select>
        </div>
        <div style={{flex: '1 1 200px'}}>
          <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>희망 타겟 업종</label>
          <select name="target_biz" value={formData.target_biz} onChange={handleChange} style={{width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA'}}>
            {bizOptions.map(biz => <option key={biz} value={biz}>{biz}</option>)}
          </select>
        </div>
        <div style={{flex: '1 1 200px'}}>
          <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>예상 투자금 (만원)</label>
          <input type="number" name="investment" value={formData.investment} onChange={handleChange} style={{width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA'}} />
        </div>
      </div>

      <div style={{marginBottom: '2rem'}}>
        <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.5rem 1rem', backgroundColor: '#FFFFFF', color: '#FF4B4B', border: '1px solid #FF4B4B', borderRadius: '0.25rem', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '분석 중...' : '시뮬레이션 시작'}
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
          <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>시뮬레이션 분석 결과</h3>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div style={{flex: '1 1 250px'}}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>현재 월 순이익 예상</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{result.current_profit.toLocaleString()} 만원</div>
            </div>
            <div style={{flex: '1 1 250px'}}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>타겟 업종 월 순이익 예상</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{result.target_profit.toLocaleString()} 만원</div>
            </div>
            <div style={{flex: '1 1 250px'}}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>예상 추가 월 순이익</div>
              <div style={{ fontSize: '2.25rem', color: result.additional_profit > 0 ? '#09AB3B' : '#FF4B4B' }}>
                {result.additional_profit > 0 ? '+' : ''}{result.additional_profit.toLocaleString()} 만원
              </div>
            </div>
          </div>
          
          <h4 style={{fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem'}}>📈 투자 및 회수 지표</h4>
          <ul style={{ lineHeight: '1.8', fontSize: '1rem' }}>
            <li><b>타겟 업종 평균 세팅 비용:</b> {result.target_setup_cost.toLocaleString()} 만원</li>
            <li><b>입력하신 예상 투자금:</b> {result.investment.toLocaleString()} 만원</li>
            <li>
              <b>투자금 회수 기간 (Payback Period):</b>{' '}
              <span style={{color: '#FF4B4B', fontWeight: 'bold'}}>
              {result.payback_months === Infinity 
                ? '회수 불가 (순이익 0 이하)' 
                : `${result.payback_months.toFixed(1)} 개월 예상`}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
