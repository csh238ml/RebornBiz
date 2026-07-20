'use client';
import { useState } from 'react';
import StickyHeader from '@/components/StickyHeader';
import AdSlot from '@/components/AdSlot';

export default function TaxCalculatorPage() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const [formData, setFormData] = useState({
    acq_year: currentYear - 1,
    acq_month: 1,
    close_year: currentYear,
    close_month: new Date().getMonth() + 1,
    asset_type: '기타 감가상각자산 (기계, 비품, 인테리어 등 상각률 25%)',
    asset_price: 10000000
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'asset_price') {
      value = Number(value.replace(/[^0-9]/g, ''));
    } else if (e.target.type === 'number' || e.target.name.includes('year') || e.target.name.includes('month')) {
      value = Number(value);
    }
    setFormData({ ...formData, [e.target.name]: value });
  }

  const handlePriceInput = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, asset_price: Number(rawVal) });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const { acq_year, acq_month, close_year, close_month, asset_type, asset_price } = formData;

    if (acq_year > close_year || (acq_year === close_year && acq_month > close_month)) {
      setError("취득 연월이 폐업 연월보다 늦을 수 없습니다.");
      setResult(null);
      return;
    }

    const p1 = acq_month <= 6 ? 1 : 2;
    const p2 = close_month <= 6 ? 1 : 2;

    let passed_periods = (close_year - acq_year) * 2 + (p2 - p1);
    passed_periods = Math.max(0, passed_periods);

    const rate_per_period = asset_type.includes("건물") ? 0.05 : 0.25;
    const total_depreciation_rate = Math.min(1.0, passed_periods * rate_per_period);
    const residual_value = asset_price * (1.0 - total_depreciation_rate);
    const vat_to_pay = residual_value * 0.10;

    setResult({
      passed_periods,
      total_depreciation_rate,
      residual_value,
      vat_to_pay,
      p1, p2
    });
  }

  return (
    <div className="custom-main">
      <StickyHeader>
        <div className="pc-only" style={{ alignItems: 'center', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '1rem' }}>
          <div style={{ flexShrink: 0, marginRight: '2rem' }}>
            <img src="/rebornBiz_logo.png" alt="RebornBiz Logo" style={{ width: '200px', height: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#31333F' }}>폐업 세금(부가세) 자동 계산기</h1>
            <p style={{ fontSize: '1rem', marginBottom: '0', lineHeight: '1.6', color: '#555' }}>
              폐업 시 가장 놓치기 쉬운 <b>'폐업 시 잔존재화 간주공급'</b> 부가가치세를 계산합니다.<br/>
              매입세액 공제를 받고 산 시설이나 인테리어 중 아직 상각되지 않은 부분에 대해 내야 할 세금을 미리 파악하세요.
            </p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#31333F' }}>폐업 세금(부가세) 자동 계산기</h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>
            폐업 시 가장 놓치기 쉬운 <b>'폐업 시 잔존재화 간주공급'</b> 부가가치세를 계산합니다.<br/>
            매입세액 공제를 받고 산 시설이나 인테리어 중 아직 상각되지 않은 부분에 대해 내야 할 세금을 미리 파악하세요.
          </p>
        </div>
      </StickyHeader>

      <div style={{ padding: '1rem', backgroundColor: '#E8F4FA', color: '#31333F', borderRadius: '0.25rem', marginBottom: '2rem', borderLeft: '4px solid #00A4A6' }}>
        💡 <b>알아두세요:</b> 매입 당시 부가세 환급(매입세액 공제)을 받은 자산에 대해서만 계산합니다. 환급을 받지 않았거나 면세사업자인 경우 납부 의무가 없습니다.
      </div>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />

      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>1. 자산 취득 및 폐업 연월 입력</h3>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>자산을 취득한 시점과 폐업일이 속한 시점에 따라 경과된 과세기간 수(6개월 단위)를 산정합니다.</div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>취득 연도</label>
          <select name="acq_year" value={formData.acq_year} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }}>
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>취득 월</label>
          <select name="acq_month" value={formData.acq_month} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }}>
            {months.map(m => <option key={m} value={m}>{m}월</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>폐업 연도</label>
          <select name="close_year" value={formData.close_year} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }}>
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>폐업 월</label>
          <select name="close_month" value={formData.close_month} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }}>
            {months.map(m => <option key={m} value={m}>{m}월</option>)}
          </select>
        </div>
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>2. 자산 정보 입력</h3>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>부가가치세를 환급받은 자산의 취득가액(공급가액)을 입력하세요. 건물은 1기당 5%, 인테리어나 기계장치는 1기당 25%씩 가치가 감소(상각)합니다.</div>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ flex: '1 1 400px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>자산 종류</label>
          <select name="asset_type" value={formData.asset_type} onChange={handleChange} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }}>
            <option value="기타 감가상각자산 (기계, 비품, 인테리어 등 상각률 25%)">기타 감가상각자산 (기계, 비품, 인테리어 등 상각률 25%)</option>
            <option value="건물 및 구축물 (상각률 5%)">건물 및 구축물 (상각률 5%)</option>
          </select>
        </div>
        <div style={{ flex: '1 1 400px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>취득가액 (공급가액 기준, 원)</label>
          <input type="text" value={formData.asset_price.toLocaleString()} onChange={handlePriceInput} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button onClick={handleSubmit} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#FF4B4B', color: '#FFFFFF', border: 'none', borderRadius: '0.25rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}>
          세금 계산하기
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#ffbd45', color: '#31333F', borderRadius: '0.25rem', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div>
          <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>📊 계산 결과</h3>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid rgba(49, 51, 63, 0.2)', borderRadius: '0.5rem' }}>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem', fontWeight: 'bold' }}>⏳ 경과된 과세기간 수</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{result.passed_periods}기</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>취득부터 폐업 전 과세기간까지 (1기=6개월)</div>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem', fontWeight: 'bold' }}>📉 총 상각률</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{(result.total_depreciation_rate * 100).toFixed(0)}%</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>자산 가치가 법적으로 하락한 비율</div>
            </div>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem', fontWeight: 'bold' }}>💰 잔존가액</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{result.residual_value.toLocaleString()}원</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>상각 후 세법상 남아있는 자산의 가치</div>
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#FFEDED', color: '#900000', borderRadius: '0.25rem', marginBottom: '0.5rem', fontSize: '1.1rem', borderLeft: '4px solid #FF4B4B' }}>
            🚨 예상 추가 납부 부가세: <b>{result.vat_to_pay.toLocaleString()}</b> 원
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '2rem' }}>
            취득가액 {formData.asset_price.toLocaleString()}원에서 총 상각률 {(result.total_depreciation_rate * 100).toFixed(0)}%({result.passed_periods}기 경과)를 제외한 잔존가액 {result.residual_value.toLocaleString()}원의 10%입니다.
          </div>

          <details style={{ border: '1px solid rgba(49, 51, 63, 0.2)', borderRadius: '0.25rem', padding: '1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600' }}>📝 상세 계산 내역 보기</summary>
            <ul style={{ marginTop: '1rem', lineHeight: '1.8', fontSize: '0.9rem' }}>
              <li><b>취득 과세기간</b>: {formData.acq_year}년 {result.p1}기</li>
              <li><b>폐업 과세기간</b>: {formData.close_year}년 {result.p2}기</li>
              <li><b>경과된 과세기간 수</b>: {result.passed_periods}기 (폐업일이 속한 기수는 산입하지 않음)</li>
              <li><b>적용 상각률</b>: {formData.asset_type.includes('건물') ? 5 : 25}% × {result.passed_periods}기 = {(result.total_depreciation_rate * 100).toFixed(0)}%</li>
              <li><b>잔존가치 계산</b>: {formData.asset_price.toLocaleString()}원 × (1 - {result.total_depreciation_rate}) = {result.residual_value.toLocaleString()}원</li>
              <li><b>부가세 계산</b>: 잔존가치 {result.residual_value.toLocaleString()}원 × 10% = {result.vat_to_pay.toLocaleString()}원</li>
            </ul>
          </details>
        </div>
      )}
      
      {/* SEO를 위한 정적 예시 및 체크리스트 (결과 유무 상관없이 노출) */}
      <section style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '0.5rem', marginTop: '3rem', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>💡 부가세 간주공급 계산 예시 및 활용 가이드</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#334155', marginBottom: '0.75rem' }}>입력 및 결과 예시</h4>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}><b>[입력 예시]</b></p>
              <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.2rem' }}>
                <li>취득 연월: 2024년 1월</li>
                <li>폐업 연월: 2025년 8월</li>
                <li>자산 종류: 인테리어/기타자산 (상각률 25%)</li>
                <li>취득가액: 3,000만 원 (환급받은 내역)</li>
              </ul>
              <p style={{ margin: '0 0 0.5rem 0' }}><b>[예상 결과 예시]</b></p>
              <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
                <li>경과 과세기간: 3기 (24년 1기, 24년 2기, 25년 1기)</li>
                <li>적용 상각률: 75% (25% × 3기)</li>
                <li>잔존가치: 750만 원 (3,000만원의 25%)</li>
                <li><b>최종 납부 부가세: 75만 원 (잔존가치의 10%)</b></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#334155', marginBottom: '0.75rem' }}>✅ 부가세 신고 전 점검 체크리스트</h4>
            <ul style={{ margin: '0', paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#475569', lineHeight: '1.8' }}>
              <li>매입 당시 세금계산서를 발급받고 부가세 매입세액 공제를 받은 자산만 계산했는가?</li>
              <li>차량, 컴퓨터, 포스기 등 환급받은 기계장치 및 비품이 누락되지 않았는가?</li>
              <li>건물이나 구축물의 경우 상각률을 5%로 올바르게 적용했는가? (기타 자산은 25%)</li>
              <li>간이과세자에서 일반과세자로 전환된 이력이 있는 경우, 세무사와 상담을 거쳤는가?</li>
              <li>폐업일이 속하는 달의 다음 달 25일까지 폐업 확정신고를 준비하고 있는가?</li>
            </ul>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <b>※ 참고 및 면책 조항:</b> 본 폐업 세금 계산기는 부가가치세법상 '폐업 시 잔존재화에 대한 간주공급' 규정에 따른 예상 부가세액을 산출합니다. 종합소득세 등 타 세금은 반영되지 않았으며, 실제 납부해야 할 세금액은 과세표준 명세서 작성 및 감가상각 누계액 처리 방식 등에 따라 차이가 발생할 수 있으므로 반드시 세무 대리인 또는 국세청(126)의 상담을 거친 후 최종 결정하시기 바랍니다.
        </div>
      </section>

      <AdSlot style={{ marginTop: '3rem' }} />
    </div>
  );
}
