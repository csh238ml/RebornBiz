'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardFilter({ years, industries, currentYear, currentIndustry }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [year, setYear] = useState(currentYear);
  const [industry, setIndustry] = useState(currentIndustry);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (year !== currentYear) {
      params.set('year', year);
      changed = true;
    }
    if (industry !== currentIndustry) {
      if (industry === '전체') {
        params.delete('industry');
      } else {
        params.set('industry', industry);
      }
      changed = true;
    }

    if (changed) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [year, industry, currentYear, currentIndustry, router, pathname, searchParams]);

  const selectStyle = {
    padding: '0.75rem 2.5rem 0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '150px',
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1em'
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
      <select style={selectStyle} value={year} onChange={(e) => setYear(e.target.value)}>
        {years.map(y => (
          <option key={y} value={y}>{y}년</option>
        ))}
      </select>

      <select style={selectStyle} value={industry} onChange={(e) => setIndustry(e.target.value)}>
        <option value="전체">전체 업종</option>
        {industries.map(item => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}
