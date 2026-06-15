'use client';
import { useState } from 'react';

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    area_pyeong: 15,
    monthly_rent_manwon: 150,
    remaining_months: 6,
    num_employees: 1
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: Number(e.target.value)});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/calculator', {
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

  return (
    <div className="custom-main">
      <div className="custom-header">
        <h1>폐업 비용 계산기</h1>
        <p>사업장 철거, 임대차 계약 위약금, 인건비 정산 등 폐업 시 발생하는 예상 비용을 계산해 보세요.</p>
      </div>

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h3 style={{marginTop: 0, marginBottom: '1.5rem', color: '#1e293b'}}>매장 정보 입력</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569'}}>매장 평수(평)</label>
            <input type="number" name="area_pyeong" value={formData.area_pyeong} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1'}} />
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569'}}>월 임대료(만원)</label>
            <input type="number" name="monthly_rent_manwon" value={formData.monthly_rent_manwon} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1'}} />
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569'}}>남은 계약 기간(개월)</label>
            <input type="number" name="remaining_months" value={formData.remaining_months} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1'}} />
          </div>
          <div>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569'}}>직원 수(명)</label>
            <input type="number" name="num_employees" value={formData.num_employees} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1'}} />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '계산 중...' : '비용 계산하기'}
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
          <h3 style={{marginTop: 0, marginBottom: '1.5rem', color: '#1e293b'}}>예상 비용 분석 결과</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', borderLeft: '4px solid #64748b' }}>
              <div style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>총 예상 비용 (지원금 적용 전)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(result['최종 예상 합계'] + result['정부 지원금 (차감)']).toLocaleString()} 원</div>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', borderLeft: '4px solid #22c55e' }}>
              <div style={{ color: '#166534', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>정부 지원금 (예상 차감액)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>- {result['정부 지원금 (차감)'].toLocaleString()} 원</div>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ color: '#1e3a8a', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>최종 실부담액</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1d4ed8' }}>{result['최종 예상 합계'].toLocaleString()} 원</div>
            </div>
          </div>
          
          <h4 style={{color: '#1e293b'}}>📝 항목별 상세 비용 내역</h4>
          <ul style={{ lineHeight: '2', color: '#475569', backgroundColor: '#f8fafc', padding: '1.5rem 2rem', borderRadius: '0.5rem' }}>
            <li><b>철거비:</b> {result['철거비'].toLocaleString()} 원</li>
            <li><b>원상복구비:</b> {result['원상복구비'].toLocaleString()} 원</li>
            <li><b>임대료 위약금:</b> {result['임대료 위약금'].toLocaleString()} 원</li>
            <li><b>인건비 정산:</b> {result['인건비 정산'].toLocaleString()} 원</li>
          </ul>
        </div>
      )}
    </div>
  );
}
