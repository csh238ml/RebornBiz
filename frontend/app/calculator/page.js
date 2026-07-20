'use client';
import { useState, useEffect } from 'react';
import StickyHeader from '@/components/StickyHeader';
import AdSlot from '@/components/AdSlot';

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
    <div className="custom-main">
      <StickyHeader>
        <div className="pc-only" style={{ alignItems: 'center', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '1rem' }}>
          <div style={{ flexShrink: 0, marginRight: '2rem' }}>
            <img src="/rebornBiz_logo.png" alt="RebornBiz Logo" style={{ width: '200px', height: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#31333F' }}>폐업 비용 계산기</h1>
            <p style={{ fontSize: '1rem', marginBottom: '0', lineHeight: '1.6', color: '#555' }}>
              점포 철거, 임대차 계약 위약금, 인건비 정산 등 폐업 시 발생하는 모든 예상 비용을 빠짐없이 계산하여, 사장님이 정확한 자금 계획을 세울 수 있도록 돕는 도구입니다.
            </p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#31333F' }}>폐업 비용 계산기</h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>
            점포 철거, 임대차 계약 위약금, 인건비 정산 등 폐업 시 발생하는 모든 예상 비용을 빠짐없이 계산하여, 사장님이 정확한 자금 계획을 세울 수 있도록 돕는 도구입니다.
          </p>
        </div>
      </StickyHeader>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />

      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>매장 정보 입력</h3>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ flex: '1 1 calc(50% - 1rem)', minWidth: '130px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: '600' }}>매장 평수(평)</label>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>철거비 및 원상복구비 산정에 사용됩니다.</div>
          <input type="number" name="area_pyeong" value={formData.area_pyeong} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }} />
        </div>
        <div style={{ flex: '1 1 calc(50% - 1rem)', minWidth: '130px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: '600' }}>월 임대료(만원)</label>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>위약금 계산의 기준 금액입니다.</div>
          <input type="number" name="monthly_rent_manwon" value={formData.monthly_rent_manwon} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }} />
        </div>
        <div style={{ flex: '1 1 calc(50% - 1rem)', minWidth: '130px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: '600' }}>남은 계약 기간(개월)</label>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>잔여 임대료 위약금을 추산합니다.</div>
          <input type="number" name="remaining_months" value={formData.remaining_months} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }} />
        </div>
        <div style={{ flex: '1 1 calc(50% - 1rem)', minWidth: '130px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: '600' }}>직원 수(명)</label>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>해고예고수당 등 인건비 정산액을 계산합니다.</div>
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
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem', fontWeight: 'bold' }}>총 예상 비용 (지원금 적용 전)</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{(result['최종 예상 합계'] + result['정부 지원금 (차감)']).toLocaleString()} 원</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>철거비, 위약금, 인건비의 총합입니다.</div>
            </div>
            <div style={{ flex: '1 1 250px' }}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem', fontWeight: 'bold' }}>정부 지원금 (예상 차감액)</div>
              <div style={{ fontSize: '2.25rem', color: '#09AB3B' }}>- {result['정부 지원금 (차감)'].toLocaleString()} 원</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>희망리턴패키지 등 철거비 지원 예상액입니다.</div>
            </div>
            <div style={{ flex: '1 1 250px' }}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem', fontWeight: 'bold' }}>정부 지원금 적용 후 실부담액</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F', fontWeight: 'bold' }}>{result['최종 예상 합계'].toLocaleString()} 원</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>지원금 수령 시 실제로 부담해야 할 최종 비용입니다.</div>
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

      {/* SEO를 위한 정적 예시 및 체크리스트 (결과 유무 상관없이 노출) */}
      <section style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '0.5rem', marginTop: '3rem', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>💡 폐업 비용 계산 예시 및 활용 가이드</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#334155', marginBottom: '0.75rem' }}>입력 및 결과 예시</h4>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}><b>[입력 예시]</b></p>
              <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.2rem' }}>
                <li>매장 평수: 15평</li>
                <li>월 임대료: 150만원</li>
                <li>남은 계약 기간: 6개월</li>
                <li>직원 수: 1명</li>
              </ul>
              <p style={{ margin: '0 0 0.5rem 0' }}><b>[예상 결과 예시]</b></p>
              <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
                <li>임대료 위약금: 약 900만원</li>
                <li>철거 및 원상복구: 약 400만원</li>
                <li>정부 지원금 차감: 최대 -250만원</li>
                <li><b>실제 예상 부담액: 약 1,350만원</b></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#334155', marginBottom: '0.75rem' }}>✅ 폐업 결정 전 점검 체크리스트</h4>
            <ul style={{ margin: '0', paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#475569', lineHeight: '1.8' }}>
              <li>권리금 회수를 포기하고 폐업하는 것이 장기적으로 유리한가?</li>
              <li>중고 주방 집기나 가구를 처분할 업체를 여러 곳 비교해보았는가?</li>
              <li>보증금에서 미납 월세 및 철거비가 얼마나 차감되는지 확인했는가?</li>
              <li>직원들의 남은 연차수당 및 퇴직금 정산 내역을 정확히 계산했는가?</li>
              <li>폐업일 기준 다음 달 25일까지 부가세 신고를 잊지 않았는가?</li>
            </ul>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <b>※ 참고 및 면책 조항:</b> 본 폐업 비용 계산기는 통상적인 평당 철거비 및 계약 조건을 가정한 참고용 데이터입니다. 실제 폐업 비용은 매장의 상태, 임대인과의 협의 내용, 지역별 철거 단가, 세금 신고 내역 등에 따라 크게 달라질 수 있습니다. 정확한 철거 비용은 전문 업체의 견적을, 세무 정산은 세무 대리인과 상의하시기 바랍니다.
        </div>
      </section>
      
      <AdSlot style={{ marginTop: '3rem' }} />
    </div>
  );
}
