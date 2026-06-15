'use client';
import { useState } from 'react';

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
    <div className="custom-main">
      <div className="custom-header">
        <h1>업종 변경 시뮬레이션</h1>
        <p>새로운 업종 전환 시의 예상 리스크와 수익성을 분석합니다.</p>
      </div>

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h3 style={{marginTop: 0, marginBottom: '1.5rem', color: '#1e293b'}}>시뮬레이션 조건 입력</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569'}}>현재 운영 중인 업종</label>
            <select name="current_biz" value={formData.current_biz} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#fff'}}>
              {bizOptions.map(biz => <option key={biz} value={biz}>{biz}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569'}}>희망 타겟 업종</label>
            <select name="target_biz" value={formData.target_biz} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#fff'}}>
              {bizOptions.map(biz => <option key={biz} value={biz}>{biz}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569'}}>예상 투자금 (만원)</label>
            <input type="number" name="investment" value={formData.investment} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1'}} />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '분석 중...' : '시뮬레이션 시작'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{marginTop: 0, marginBottom: '1.5rem', color: '#1e293b'}}>시뮬레이션 분석 결과</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', borderLeft: '4px solid #64748b' }}>
              <div style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>현재 월 순이익 예상</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{result.current_profit.toLocaleString()} 만원</div>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ color: '#1e3a8a', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>타겟 업종 월 순이익 예상</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8' }}>{result.target_profit.toLocaleString()} 만원</div>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', borderLeft: '4px solid #22c55e' }}>
              <div style={{ color: '#166534', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>예상 추가 월 순이익</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d' }}>
                {result.additional_profit > 0 ? '+' : ''}{result.additional_profit.toLocaleString()} 만원
              </div>
            </div>
          </div>
          
          <h4 style={{color: '#1e293b'}}>📈 투자 및 회수 지표</h4>
          <ul style={{ lineHeight: '2', color: '#475569', backgroundColor: '#f8fafc', padding: '1.5rem 2rem', borderRadius: '0.5rem' }}>
            <li><b>타겟 업종 평균 세팅 비용:</b> {result.target_setup_cost.toLocaleString()} 만원</li>
            <li><b>입력하신 예상 투자금:</b> {result.investment.toLocaleString()} 만원</li>
            <li>
              <b>투자금 회수 기간 (Payback Period):</b>{' '}
              <span style={{color: '#1d4ed8', fontWeight: 'bold'}}>
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
