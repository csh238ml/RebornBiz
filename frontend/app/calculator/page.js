'use client';
import { useState, useEffect } from 'react';

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
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  }

  useEffect(() => {
    const fetchCalculation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setResult(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('서버 연동에 실패했습니다. 백엔드 서버(포트 8000)가 실행 중인지 확인하세요.');
      }
      setLoading(false);
    };
    
    // Add a small debounce or just call it directly since it's a fast API
    const timeoutId = setTimeout(fetchCalculation, 300);
    return () => clearTimeout(timeoutId);
  }, [formData]);


  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', color: '#31333F' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>폐업 비용 계산기</h1>
      <p style={{ fontSize: '1rem', marginBottom: '2rem' }}>사업장 철거, 임대차 계약 위약금, 인건비 정산 등 폐업 시 발생하는 예상 비용을 계산해 보세요.</p>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />

      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>매장 정보 입력</h3>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ flex: '1 1 calc(50% - 1rem)', minWidth: '130px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>매장 평수(평)</label>
          <input type="number" name="area_pyeong" value={formData.area_pyeong} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }} />
        </div>
        <div style={{ flex: '1 1 calc(50% - 1rem)', minWidth: '130px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>월 임대료(만원)</label>
          <input type="number" name="monthly_rent_manwon" value={formData.monthly_rent_manwon} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }} />
        </div>
        <div style={{ flex: '1 1 calc(50% - 1rem)', minWidth: '130px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>남은 계약 기간(개월)</label>
          <input type="number" name="remaining_months" value={formData.remaining_months} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }} />
        </div>
        <div style={{ flex: '1 1 calc(50% - 1rem)', minWidth: '130px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>직원 수(명)</label>
          <input type="number" name="num_employees" value={formData.num_employees} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }} />
        </div>
      </div>



      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#ffbd45', color: '#31333F', borderRadius: '0.25rem', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div>
          <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>예상 비용 분석 결과</h3>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div style={{ flex: '1 1 250px' }}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>총 예상 비용 (지원금 적용 전)</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{(result['최종 예상 합계'] + result['정부 지원금 (차감)']).toLocaleString()} 원</div>
            </div>
            <div style={{ flex: '1 1 250px' }}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>정부 지원금 (예상 차감액)</div>
              <div style={{ fontSize: '2.25rem', color: '#09AB3B' }}>- {result['정부 지원금 (차감)'].toLocaleString()} 원</div>
            </div>
            <div style={{ flex: '1 1 250px' }}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>정부 지원금 적용 후 실부담액</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{result['최종 예상 합계'].toLocaleString()} 원</div>
            </div>
          </div>

          <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>📝 항목별 상세 비용 명세서</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', border: '1px solid rgba(49, 51, 63, 0.2)', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}>
            <thead style={{ borderBottom: '1px solid rgba(49, 51, 63, 0.2)' }}>
              <tr>
                <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: '600' }}>항목</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '600' }}>예상 금액(원)</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: '600' }}>산출 근거</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(49, 51, 63, 0.1)' }}>
                <td style={{ padding: '0.5rem' }}>임대료 위약금</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{result['임대료 위약금'].toLocaleString()}</td>
                <td style={{ padding: '0.5rem' }}>월 임대료 × 남은 계약 기간</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(49, 51, 63, 0.1)' }}>
                <td style={{ padding: '0.5rem' }}>철거비</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{result['철거비'].toLocaleString()}</td>
                <td style={{ padding: '0.5rem' }}>평당 약 15~20만 원 기준</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(49, 51, 63, 0.1)' }}>
                <td style={{ padding: '0.5rem' }}>원상복구비</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{result['원상복구비'].toLocaleString()}</td>
                <td style={{ padding: '0.5rem' }}>평당 약 10~15만 원 기준</td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem' }}>인건비 정산</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{result['인건비 정산'].toLocaleString()}</td>
                <td style={{ padding: '0.5rem' }}>직원 수에 따른 해고수당 및 퇴직금 추정</td>
              </tr>
            </tbody>
          </table>

          <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>✅ 폐업 필수 체크리스트 (가이드라인)</h4>
          <div style={{ marginTop: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                      <b style={{ color: '#1e293b', fontSize: '1.05rem' }}>1. 임대차 계약 해지 통보</b><br/>
                      <span style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', display: 'inline-block', marginTop: '4px' }}>최소 1~3개월 전 임대인에게 내용증명 또는 서면으로 해지 의사를 명확히 통보해야 위약금을 최소화할 수 있습니다.</span>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                      <b style={{ color: '#1e293b', fontSize: '1.05rem' }}>2. 직원 해고 통보 및 4대 보험 정산</b><br/>
                      <span style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', display: 'inline-block', marginTop: '4px' }}>30일 전 해고 예고를 하지 않으면 해고예고수당이 발생합니다. 퇴직금 및 4대 보험 상실 신고를 신속히 처리하세요.</span>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                      <b style={{ color: '#1e293b', fontSize: '1.05rem' }}>3. 철거 및 원상복구 진행 (지원금 신청)</b><br/>
                      <span style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', display: 'inline-block', marginTop: '4px' }}>공사 시작 전에 반드시 '희망리턴패키지' 원상복구 지원금을 신청하여 최대 250만 원의 실비를 지원받으세요.</span>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                      <b style={{ color: '#1e293b', fontSize: '1.05rem' }}>4. 세무서 폐업 신고 및 부가세 납부</b><br/>
                      <span style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', display: 'inline-block', marginTop: '4px' }}>폐업일 기준 다음 달 25일까지 부가가치세(폐업 시 잔존재화 포함)를 신고하고 납부해야 가산세를 피할 수 있습니다.</span>
                  </div>
              </div>
          </div>

          <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', padding: '24px', marginTop: '32px', border: '1px solid #bfdbfe' }}>
              <h4 style={{ color: '#1E3A8A', marginTop: '0', marginBottom: '12px', fontWeight: 'bold', fontSize: '18px' }}>💡 정부 지원금 신청 안내 (희망리턴패키지)</h4>
              
              <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                  <strong style={{ color: '#1E3A8A' }}>
                      <a href="https://hope.sbiz.or.kr" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#1E3A8A' }}>소상공인시장진흥공단 '희망리턴패키지' 원스톱 폐업 지원</a>
                  </strong>
                  <ul style={{ marginTop: '8px', marginBottom: '20px', paddingLeft: '20px' }}>
                      <li><strong>지원 대상:</strong> 폐업을 앞두고 있거나 이미 폐업한 소상공인</li>
                      <li><strong>지원 내용:</strong> 점포 철거 및 원상복구 비용 (최대 250만 원 한도) 및 사업정리 컨설팅</li>
                      <li><strong>신청 자격:</strong> 사업자등록증상 영업 기간이 60일 이상인 소상공인 등 <br/>(세부 조건은 <a href="https://hope.sbiz.or.kr" target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'underline', fontWeight: 'bold' }}>소진공 홈페이지 참조</a>)</li>
                      <li style={{ color: '#ef4444', fontWeight: '700', marginTop: '4px' }}>⚠️ 주의 사항: 철거 공사 시작 전에 반드시 사전 신청 및 승인이 필요합니다. (공사 후 신청 시 지원금 수령 불가)</li>
                  </ul>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <a href="https://hope.sbiz.or.kr" target="_blank" rel="noreferrer" style={{ display: 'inline-block', backgroundColor: '#1E3A8A', color: '#ffffff', textDecoration: 'none', padding: '12px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', transition: 'all 0.2s' }}>
                      희망리턴패키지 상세 보기 ↗
                  </a>
                  <a href="https://www.sbiz24.kr" target="_blank" rel="noreferrer" style={{ display: 'inline-block', backgroundColor: '#ffffff', color: '#1E3A8A', textDecoration: 'none', padding: '12px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #1E3A8A', transition: 'all 0.2s' }}>
                      점포철거비 공식 신청 (소상공인24) ↗
                  </a>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
