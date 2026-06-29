'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function StatisticsFilter({ industries, regions, months, ages }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 초기값 읽기
  const initialRegion = searchParams.get('region') || '전체';
  const initialIndustry = searchParams.get('industry') || '전체';
  const initialMonth = searchParams.get('month') || '전체';
  const initialAge = searchParams.get('age') || '전체';

  const [region, setRegion] = useState(initialRegion);
  const [industry, setIndustry] = useState(initialIndustry);
  const [month, setMonth] = useState(initialMonth);
  const [age, setAge] = useState(initialAge);

  // 상호 배타적 필터 제어 함수
  const handleFilterChange = (type, value) => {
    if (type === 'region') {
      setRegion(value);
      if (value !== '전체') {
        setMonth('전체');
        setAge('전체');
      }
    } else if (type === 'month') {
      setMonth(value);
      if (value !== '전체') {
        setRegion('전체');
        setAge('전체');
      }
    } else if (type === 'age') {
      setAge(value);
      if (value !== '전체') {
        setRegion('전체');
        setMonth('전체');
      }
    } else if (type === 'industry') {
      setIndustry(value);
    }
  };

  // 상태가 변경되면 URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    if (region !== '전체') params.set('region', region);
    if (industry !== '전체') params.set('industry', industry);
    if (month !== '전체') params.set('month', month);
    if (age !== '전체') params.set('age', age);

    router.push(`/statistics?${params.toString()}`);
  }, [region, industry, month, age, router]);

  const selectStyle = {
    padding: '0.75rem',
    borderRadius: '0.25rem',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    fontSize: '0.95rem',
    color: '#334155',
    width: '100%',
    cursor: 'pointer',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569'
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', color: '#1E293B' }}>🔍 분석 기준 선택</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        
        <div>
          <label style={labelStyle}>100대 업종</label>
          <select style={selectStyle} value={industry} onChange={(e) => handleFilterChange('industry', e.target.value)}>
            <option value="전체">전체 업종</option>
            {industries.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>지역별 현황</label>
          <select style={selectStyle} value={region} onChange={(e) => handleFilterChange('region', e.target.value)} disabled={month !== '전체' || age !== '전체'}>
            <option value="전체">전국 전체</option>
            {regions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>월별 동향</label>
          <select style={selectStyle} value={month} onChange={(e) => handleFilterChange('month', e.target.value)} disabled={region !== '전체' || age !== '전체'}>
            <option value="전체">전체 월</option>
            {months.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>연령별 창업</label>
          <select style={selectStyle} value={age} onChange={(e) => handleFilterChange('age', e.target.value)} disabled={region !== '전체' || month !== '전체'}>
            <option value="전체">전체 연령</option>
            {ages.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

      </div>
      
      <p style={{ margin: '1rem 0 0 0', fontSize: '0.8rem', color: '#94A3B8' }}>
        * KOSIS 원천 데이터 구조상 [지역], [월], [연령] 조건은 동시 교차 검색이 불가능하여 하나만 선택할 수 있습니다. (업종은 무관)
      </p>
    </div>
  );
}
