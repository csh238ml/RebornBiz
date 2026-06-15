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
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', color: '#31333F'}}>
      <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem'}}>폐업 비용 계산기 🧮</h1>
      <p style={{fontSize: '1rem', marginBottom: '2rem'}}>사업장 철거, 임대차 계약 위약금, 인건비 정산 등 폐업 시 발생하는 예상 비용을 계산해 보세요.</p>
      
      <hr style={{borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0'}} />

      <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>매장 정보 입력</h3>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{flex: '1 1 200px'}}>
          <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>매장 평수(평)</label>
          <input type="number" name="area_pyeong" value={formData.area_pyeong} onChange={handleChange} style={{width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA'}} />
        </div>
        <div style={{flex: '1 1 200px'}}>
          <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>월 임대료(만원)</label>
          <input type="number" name="monthly_rent_manwon" value={formData.monthly_rent_manwon} onChange={handleChange} style={{width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA'}} />
        </div>
        <div style={{flex: '1 1 200px'}}>
          <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>남은 계약 기간(개월)</label>
          <input type="number" name="remaining_months" value={formData.remaining_months} onChange={handleChange} style={{width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA'}} />
        </div>
        <div style={{flex: '1 1 200px'}}>
          <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem'}}>직원 수(명)</label>
          <input type="number" name="num_employees" value={formData.num_employees} onChange={handleChange} style={{width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA'}} />
        </div>
      </div>

      <div style={{marginBottom: '2rem'}}>
        <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.5rem 1rem', backgroundColor: '#FFFFFF', color: '#FF4B4B', border: '1px solid #FF4B4B', borderRadius: '0.25rem', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '계산 중...' : '비용 계산하기'}
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
          <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>예상 비용 분석 결과</h3>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div style={{flex: '1 1 250px'}}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>총 예상 비용 (지원금 적용 전)</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{(result['최종 예상 합계'] + result['정부 지원금 (차감)']).toLocaleString()} 원</div>
            </div>
            <div style={{flex: '1 1 250px'}}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>정부 지원금 (예상 차감액)</div>
              <div style={{ fontSize: '2.25rem', color: '#09AB3B' }}>- {result['정부 지원금 (차감)'].toLocaleString()} 원</div>
            </div>
            <div style={{flex: '1 1 250px'}}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>정부 지원금 적용 후 실부담액</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{result['최종 예상 합계'].toLocaleString()} 원</div>
            </div>
          </div>
          
          <h4 style={{fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem'}}>📝 항목별 상세 비용 명세서</h4>
          <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', border: '1px solid rgba(49, 51, 63, 0.2)', backgroundColor: '#FFFFFF', fontSize: '0.875rem'}}>
            <thead style={{borderBottom: '1px solid rgba(49, 51, 63, 0.2)'}}>
              <tr>
                <th style={{padding: '0.5rem', textAlign: 'left', fontWeight: '600'}}>항목</th>
                <th style={{padding: '0.5rem', textAlign: 'right', fontWeight: '600'}}>예상 금액(원)</th>
                <th style={{padding: '0.5rem', textAlign: 'left', fontWeight: '600'}}>산출 근거</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderBottom: '1px solid rgba(49, 51, 63, 0.1)'}}>
                <td style={{padding: '0.5rem'}}>임대료 위약금</td>
                <td style={{padding: '0.5rem', textAlign: 'right'}}>{result['임대료 위약금'].toLocaleString()}</td>
                <td style={{padding: '0.5rem'}}>월 임대료 × 남은 계약 기간</td>
              </tr>
              <tr style={{borderBottom: '1px solid rgba(49, 51, 63, 0.1)'}}>
                <td style={{padding: '0.5rem'}}>철거비</td>
                <td style={{padding: '0.5rem', textAlign: 'right'}}>{result['철거비'].toLocaleString()}</td>
                <td style={{padding: '0.5rem'}}>평당 약 15~20만 원 기준</td>
              </tr>
              <tr style={{borderBottom: '1px solid rgba(49, 51, 63, 0.1)'}}>
                <td style={{padding: '0.5rem'}}>원상복구비</td>
                <td style={{padding: '0.5rem', textAlign: 'right'}}>{result['원상복구비'].toLocaleString()}</td>
                <td style={{padding: '0.5rem'}}>평당 약 10~15만 원 기준</td>
              </tr>
              <tr>
                <td style={{padding: '0.5rem'}}>인건비 정산</td>
                <td style={{padding: '0.5rem', textAlign: 'right'}}>{result['인건비 정산'].toLocaleString()}</td>
                <td style={{padding: '0.5rem'}}>직원 수에 따른 해고수당 및 퇴직금 추정</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
