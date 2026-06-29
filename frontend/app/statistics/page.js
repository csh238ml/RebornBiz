import Link from 'next/link';
import { pool } from '@/lib/db';
import StickyHeader from '@/components/StickyHeader';
import AdSlot from '@/components/AdSlot';
import DashboardFilter from '@/components/DashboardFilter';

export const metadata = {
  title: '창업·폐업 트렌드 분석 | RebornBiz',
  description: '100대 생활밀접업종의 지역별, 연령별, 월별 최신 창업 및 폐업 동향을 한눈에 비교하고 분석해보세요.',
  openGraph: {
    title: '창업·폐업 트렌드 분석 | RebornBiz',
    description: '100대 생활밀접업종의 지역별, 연령별, 월별 최신 창업 및 폐업 동향을 한눈에 비교하고 분석해보세요.',
    type: 'website',
  }
};

async function getFilterOptions() {
  try {
    const [yearRows] = await pool.query('SELECT DISTINCT target_year FROM kosis_life_biz_stats ORDER BY target_year DESC');
    const [industryRows] = await pool.query("SELECT DISTINCT industry_name FROM kosis_life_biz_stats WHERE industry_name != '합계' ORDER BY industry_name");

    return {
      years: yearRows.map(r => r.target_year),
      industries: industryRows.map(r => r.industry_name)
    };
  } catch (err) {
    console.error('Failed to fetch filter options:', err);
    return { years: [], industries: [] };
  }
}

async function getDashboardData(year, industry, tab) {
  let categoryType = 'REGION';
  if (tab === 'AGE') categoryType = 'AGE';
  if (tab === 'MONTH') categoryType = 'MONTH';

  // "전체" 업종 선택 시 DB의 '합계' 항목을 조회
  const targetIndustry = (industry === '전체') ? '합계' : industry;

  try {
    const query = `
      SELECT 
        category_value, 
        SUM(CASE WHEN stat_type = 'NEW' THEN biz_count ELSE 0 END) as new_count, 
        SUM(CASE WHEN stat_type = 'CLOSE' THEN biz_count ELSE 0 END) as close_count
      FROM kosis_life_biz_stats 
      WHERE target_year = ? AND industry_name = ? AND category_type = ? AND category_value != '합계'
      GROUP BY category_value 
      ORDER BY new_count DESC
    `;
    const [rows] = await pool.query(query, [year, targetIndustry, categoryType]);

    // 월별 추이일 경우 1월, 2월 순서대로 정렬, 연령별일 경우 20대, 30대 순서대로 정렬
    if (tab === 'MONTH') {
      rows.sort((a, b) => {
        const numA = parseInt(a.category_value.replace(/[^0-9]/g, '')) || 0;
        const numB = parseInt(b.category_value.replace(/[^0-9]/g, '')) || 0;
        return numA - numB;
      });
    } else if (tab === 'AGE') {
      rows.sort((a, b) => a.category_value.localeCompare(b.category_value));
    }

    return rows.map(r => ({
      ...r,
      new_count: Number(r.new_count) || 0,
      close_count: Number(r.close_count) || 0
    }));
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err);
    return [];
  }
}

export default async function StatisticsDashboard({ searchParams }) {
  const resolvedParams = await searchParams;
  
  const filterOptions = await getFilterOptions();
  
  const defaultYear = filterOptions.years.length > 0 ? filterOptions.years[0] : new Date().getFullYear().toString();
  
  const currentYear = resolvedParams?.year || defaultYear;
  const currentIndustry = resolvedParams?.industry || '전체';
  const currentTab = resolvedParams?.tab || 'REGION';

  const rows = await getDashboardData(currentYear, currentIndustry, currentTab);

  // 비율 계산용 최대값
  const maxCount = rows.length > 0 ? Math.max(...rows.map(r => Math.max(r.new_count, r.close_count))) : 1;

  const tabs = [
    { id: 'REGION', label: '📍 지역별 분석' },
    { id: 'AGE', label: '👥 연령별 분석' },
    { id: 'MONTH', label: '📅 월별 추이' }
  ];

  return (
    <div className="custom-main">
      <StickyHeader>
        <div className="pc-only" style={{ alignItems: 'center', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '1rem' }}>
          <div style={{ flexShrink: 0, marginRight: '2rem' }}>
            <img src="/rebornBiz_logo.png" alt="RebornBiz Logo" style={{ width: '200px', height: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#31333F' }}>📊 창업·폐업 트렌드</h1>
            <p style={{ fontSize: '1rem', marginBottom: '0', lineHeight: '1.6', color: '#555' }}>
              연도와 업종을 선택하여 세부적인 현황을 입체적으로 분석해보세요.<br />
              국세청 및 KOSIS 확정 데이터를 바탕으로 실시간 집계됩니다.
            </p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#31333F' }}>📊 창업·폐업 트렌드</h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>
            다양한 기준의 트렌드를 한눈에 분석합니다.
          </p>
        </div>
      </StickyHeader>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />

      {/* 상단 필터 바 */}
      <DashboardFilter 
        years={filterOptions.years}
        industries={filterOptions.industries}
        currentYear={currentYear}
        currentIndustry={currentIndustry}
      />

      {/* 중단 메인 탭 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(tab => {
          // 기존 파라미터를 유지하며 탭만 변경
          const search = new URLSearchParams();
          if (currentYear) search.set('year', currentYear);
          if (currentIndustry !== '전체') search.set('industry', currentIndustry);
          search.set('tab', tab.id);

          return (
            <Link 
              key={tab.id}
              href={`/statistics?${search.toString()}`}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                backgroundColor: currentTab === tab.id ? '#1E3A8A' : '#F1F5F9',
                color: currentTab === tab.id ? '#FFFFFF' : '#475569',
                border: `1px solid ${currentTab === tab.id ? '#1E3A8A' : '#E2E8F0'}`,
                transition: 'all 0.2s',
                fontSize: '1.05rem'
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* 하단 반응형 테이블/차트 영역 */}
      <div style={{ marginBottom: '3rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '20%' }}>분석 기준</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '15%', textAlign: 'right' }}>신규 창업 (건)</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '15%', textAlign: 'right' }}>폐업 (건)</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '50%' }}>비율 (신규 vs 폐업)</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>해당 조건에 일치하는 데이터가 없습니다.</td></tr>
              ) : (
                rows.map((row, idx) => {
                  const newPercent = maxCount > 0 ? (row.new_count / maxCount) * 100 : 0;
                  const closePercent = maxCount > 0 ? (row.close_count / maxCount) * 100 : 0;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#334155' }}>
                        {row.category_value}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#2563EB', fontWeight: '500' }}>{row.new_count.toLocaleString()}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#DC2626', fontWeight: '500' }}>{row.close_count.toLocaleString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', width: '24px' }}>신규</span>
                            <div style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                              <div style={{ width: `${newPercent}%`, backgroundColor: '#3B82F6', height: '100%', borderRadius: '4px' }}></div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', width: '24px' }}>폐업</span>
                            <div style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                              <div style={{ width: `${closePercent}%`, backgroundColor: '#EF4444', height: '100%', borderRadius: '4px' }}></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdSlot position="middle" />
      
    </div>
  );
}
