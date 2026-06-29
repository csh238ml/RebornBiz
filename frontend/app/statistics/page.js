import { pool } from '@/lib/db';
import StickyHeader from '@/components/StickyHeader';
import AdSlot from '@/components/AdSlot';
import StatisticsFilter from '@/components/StatisticsFilter';

export const metadata = {
  title: '창업·폐업 트렌드 분석 | RebornBiz',
  description: '100대 생활밀접업종의 지역별, 월별, 연령별 신규 창업 및 폐업 최신 동향을 한눈에 비교하고 분석해보세요.',
  openGraph: {
    title: '창업·폐업 트렌드 분석 | RebornBiz',
    description: '100대 생활밀접업종의 지역별, 월별, 연령별 신규 창업 및 폐업 최신 동향을 한눈에 비교하고 분석해보세요.',
    type: 'website',
  }
};

async function getFilterOptions() {
  try {
    const [regions] = await pool.query("SELECT DISTINCT category_value FROM kosis_life_biz_stats WHERE category_type='REGION' AND category_value != '합계' ORDER BY category_value");
    const [months] = await pool.query("SELECT DISTINCT category_value FROM kosis_life_biz_stats WHERE category_type='MONTH' AND category_value != '합계' ORDER BY category_value");
    const [ages] = await pool.query("SELECT DISTINCT category_value FROM kosis_life_biz_stats WHERE category_type='AGE' AND category_value != '합계' ORDER BY category_value");
    const [industries] = await pool.query("SELECT DISTINCT industry_name FROM kosis_life_biz_stats WHERE industry_name != '합계' ORDER BY industry_name");

    return {
      regions: regions.map(r => r.category_value),
      months: months.map(r => r.category_value),
      ages: ages.map(r => r.category_value),
      industries: industries.map(r => r.industry_name)
    };
  } catch (err) {
    console.error('Failed to fetch filter options:', err);
    return { regions: [], months: [], ages: [], industries: [] };
  }
}

async function getStatisticsData(region, industry, month, age) {
  try {
    // 1. 기준 카테고리 결정
    let categoryType = 'REGION';
    let categoryValue = '합계';
    let conditionLabel = '전국 전체';

    if (region !== '전체') {
      categoryType = 'REGION';
      categoryValue = region;
      conditionLabel = region;
    } else if (month !== '전체') {
      categoryType = 'MONTH';
      categoryValue = month;
      conditionLabel = month;
    } else if (age !== '전체') {
      categoryType = 'AGE';
      categoryValue = age;
      conditionLabel = age;
    }

    // 2. 가장 최신 년도 조회 (업종 전체 조회 시 사용)
    const [yearRows] = await pool.query('SELECT MAX(target_year) as maxYear FROM kosis_life_biz_stats');
    const targetYear = yearRows[0]?.maxYear || new Date().getFullYear().toString();

    let query = '';
    let queryParams = [];
    let isTrend = false;
    let subtitle = '';

    if (industry !== '전체') {
      // 업종이 특정된 경우 -> 연도별 트렌드
      isTrend = true;
      query = `
        SELECT 
          target_year as label, 
          SUM(IF(stat_type='NEW', biz_count, 0)) as new_count, 
          SUM(IF(stat_type='CLOSE', biz_count, 0)) as close_count
        FROM kosis_life_biz_stats 
        WHERE industry_name = ? AND category_type = ? AND category_value = ?
        GROUP BY target_year 
        ORDER BY target_year ASC
      `;
      queryParams = [industry, categoryType, categoryValue];
      subtitle = `[${conditionLabel}] ${industry} 연도별 추이`;
    } else {
      // 업종이 전체인 경우 -> 최신 연도의 100대 업종 리스트 랭킹
      isTrend = false;
      query = `
        SELECT 
          industry_name as label, 
          SUM(IF(stat_type='NEW', biz_count, 0)) as new_count, 
          SUM(IF(stat_type='CLOSE', biz_count, 0)) as close_count
        FROM kosis_life_biz_stats 
        WHERE category_type = ? AND category_value = ? AND target_year = ? AND industry_name != '합계'
        GROUP BY industry_name 
        ORDER BY new_count DESC
      `;
      queryParams = [categoryType, categoryValue, targetYear];
      subtitle = `[${conditionLabel}] 100대 업종 현황 (${targetYear}년 기준)`;
    }

    const [rows] = await pool.query(query, queryParams);

    const formattedRows = rows.map(r => ({
      label: r.label,
      new_count: Number(r.new_count) || 0,
      close_count: Number(r.close_count) || 0
    }));

    return { rows: formattedRows, isTrend, subtitle };
  } catch (err) {
    console.error('Failed to fetch statistics data:', err);
    return { rows: [], isTrend: false, subtitle: '' };
  }
}

export default async function StatisticsDashboard({ searchParams }) {
  const resolvedParams = await searchParams;
  
  const region = resolvedParams?.region || '전체';
  const industry = resolvedParams?.industry || '전체';
  const month = resolvedParams?.month || '전체';
  const age = resolvedParams?.age || '전체';

  const filterOptions = await getFilterOptions();
  const { rows, isTrend, subtitle } = await getStatisticsData(region, industry, month, age);

  // 비율 계산용 최대값
  const maxCount = rows.length > 0 ? Math.max(...rows.map(r => Math.max(r.new_count, r.close_count))) : 1;

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
              원하는 조건(지역, 업종, 월, 연령)을 선택하여 맞춤형 데이터를 분석해보세요.<br />
              국세청 및 KOSIS 100대 생활밀접업종 확정 데이터를 바탕으로 실시간 집계됩니다.
            </p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#31333F' }}>📊 창업·폐업 트렌드</h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>
            조건에 맞는 트렌드를 한눈에 분석합니다.
          </p>
        </div>
      </StickyHeader>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />

      {/* 신규 필터 컴포넌트 */}
      <StatisticsFilter 
        industries={filterOptions.industries}
        regions={filterOptions.regions}
        months={filterOptions.months}
        ages={filterOptions.ages}
      />

      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1E293B' }}>
        {isTrend ? '📅 연도별 누적 창업/폐업 추이' : '🏢 업종별 창업/폐업 현황 비교'}
      </h2>
      <p style={{ color: '#475569', fontWeight: '600', marginBottom: '1rem' }}>
        ▶ {subtitle}
      </p>

      {/* 반응형 표 및 인포그래픽 영역 */}
      <div style={{ marginBottom: '3rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '20%' }}>{isTrend ? '기준 연도' : '업종명'}</th>
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
                        {isTrend ? `${row.label}년` : row.label}
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
      
      {isTrend && (
        <div style={{ padding: '2rem', backgroundColor: '#F8FAFC', borderRadius: '0.5rem', border: '1px solid #E2E8F0', marginTop: '3rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#1E293B', marginTop: 0 }}>💡 분석 팁</h3>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: 0 }}>
            창업 대비 폐업 비율이 현저히 높은 연도는 해당 업종의 상권이 포화 상태이거나 경제적 요인으로 침체되었음을 의미할 수 있습니다. 
            최근 데이터의 추세를 통해 현재 진입하기 좋은 업종인지 판단하는 데 참고하세요.
          </p>
        </div>
      )}
    </div>
  );
}
