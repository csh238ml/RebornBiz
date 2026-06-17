'use client';
import { useState } from 'react';
import StickyHeader from '@/components/StickyHeader';

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 2rem 2rem', fontFamily: 'sans-serif', color: '#31333F' }}>
      <StickyHeader>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>폐업 세금(부가세) 자동 계산기</h1>
        <p style={{ fontSize: '1rem', marginBottom: '0' }}>폐업 시 매입세액 공제를 받은 남아있는 자산(건물, 인테리어, 비품 등)에 대해 납부해야 할 <b>'폐업 시 잔존재화 간주공급'</b> 부가가치세를 손쉽게 계산해 보세요.</p>
      </StickyHeader>

      <div style={{ padding: '1rem', backgroundColor: '#E8F4FA', color: '#31333F', borderRadius: '0.25rem', marginBottom: '2rem', borderLeft: '4px solid #00A4A6' }}>
        💡 <b>알아두세요:</b> 매입 당시 부가세 환급(매입세액 공제)을 받은 자산에 대해서만 계산합니다. 환급을 받지 않았거나 면세사업자인 경우 납부 의무가 없습니다.
      </div>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />

      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>1. 자산 취득 및 폐업 연월 입력</h3>

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
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>⏳ 경과된 과세기간 수</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{result.passed_periods}기</div>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>📉 총 상각률</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{(result.total_depreciation_rate * 100).toFixed(0)}%</div>
            </div>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ fontSize: '0.875rem', color: '#31333F', marginBottom: '0.25rem' }}>💰 잔존가액</div>
              <div style={{ fontSize: '2.25rem', color: '#31333F' }}>{result.residual_value.toLocaleString()}원</div>
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
    </div>
  );
}
