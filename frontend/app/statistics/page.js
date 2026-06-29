import Link from 'next/link';
import { pool } from '@/lib/db';
import StickyHeader from '@/components/StickyHeader';
import AdSlot from '@/components/AdSlot';

export const metadata = {
  title: '창업·폐업 트렌드 분석 | RebornBiz',
  description: '100대 생활밀접업종의 지역별, 월별, 연령별 신규 창업 및 폐업 최신 동향을 한눈에 비교하고 분석해보세요.',
  openGraph: {
    title: '창업·폐업 트렌드 분석 | RebornBiz',
    description: '100대 생활밀접업종의 지역별, 월별, 연령별 신규 창업 및 폐업 최신 동향을 한눈에 비교하고 분석해보세요.',
    type: 'website',
  }
};

async function getStatisticsSummary(tab) {
  let categoryType = 'REGION';
  if (tab === 'MONTH') categoryType = 'MONTH';
  if (tab === 'AGE') categoryType = 'AGE';

  try {
    // 1. 가장 최신 년도 조회
    const [yearRows] = await pool.query('SELECT MAX(target_year) as maxYear FROM kosis_life_biz_stats');
    const targetYear = yearRows[0]?.maxYear || new Date().getFullYear().toString();

    // 2. 카테고리별 신규/폐업 수 합산 조회
    const query = `
      SELECT 
        category_value, 
        SUM(IF(stat_type='NEW', biz_count, 0)) as new_count, 
        SUM(IF(stat_type='CLOSE', biz_count, 0)) as close_count
      FROM kosis_life_biz_stats 
      WHERE category_type = ? AND target_year = ?
      GROUP BY category_value 
      ORDER BY new_count DESC
    `;
    const [rows] = await pool.query(query, [categoryType, targetYear]);

    return { rows, targetYear };
  } catch (err) {
    console.error('Failed to fetch statistics summary:', err);
    return { rows: [], targetYear: '' };
  }
}

async function getIndustryList() {
  try {
    const [rows] = await pool.query('SELECT DISTINCT industry_name FROM kosis_life_biz_stats ORDER BY industry_name');
    return rows.map(r => r.industry_name);
  } catch (err) {
    console.error('Failed to fetch industry list:', err);
    return [];
  }
}

export default async function StatisticsDashboard({ searchParams }) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams?.tab || 'REGION';
  
  const { rows, targetYear } = await getStatisticsSummary(currentTab);
  const industries = await getIndustryList();

  // 비율 계산용 최대값 구하기 (프로그레스 바 너비 조절용)
  const maxCount = rows.length > 0 ? Math.max(...rows.map(r => Math.max(r.new_count, r.close_count))) : 1;

  const tabs = [
    { id: 'REGION', label: '📍 지역별 현황' },
    { id: 'MONTH', label: '📅 월별 동향' },
    { id: 'AGE', label: '🧑‍🤝‍🧑 연령별 창업' }
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
              국세청 및 KOSIS 100대 생활밀접업종 확정 데이터를 바탕으로 분석합니다.<br />
              현재 선택된 기준 연도: <strong>{targetYear}년</strong>
            </p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#31333F' }}>📊 창업·폐업 트렌드</h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>
            KOSIS 데이터를 바탕으로 트렌드를 한눈에 분석합니다.<br/>(기준: {targetYear}년)
          </p>
        </div>
      </StickyHeader>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />

      {/* 탭 네비게이션 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <Link 
            key={tab.id}
            href={`/statistics?tab=${tab.id}`}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              textDecoration: 'none',
              backgroundColor: currentTab === tab.id ? '#1E3A8A' : '#F1F5F9',
              color: currentTab === tab.id ? '#FFFFFF' : '#475569',
              border: `1px solid ${currentTab === tab.id ? '#1E3A8A' : '#E2E8F0'}`,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* 반응형 표 및 인포그래픽 영역 */}
      <div style={{ marginBottom: '3rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '20%' }}>구분</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '15%', textAlign: 'right' }}>신규 창업 (건)</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '15%', textAlign: 'right' }}>폐업 (건)</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '50%' }}>비율 (신규 vs 폐업)</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>데이터가 없습니다.</td></tr>
              ) : (
                rows.map((row, idx) => {
                  const newPercent = maxCount > 0 ? (row.new_count / maxCount) * 100 : 0;
                  const closePercent = maxCount > 0 ? (row.close_count / maxCount) * 100 : 0;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#334155' }}>{row.category_value}</td>
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

      {/* 업종 리스트 섹션 */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '3rem 0 1.5rem 0', color: '#1E293B' }}>
        🔍 100대 업종별 상세 분석
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '4rem' }}>
        {industries.map(industry => (
          <Link
            key={industry}
            href={`/statistics/${encodeURIComponent(industry)}`}
            style={{
              padding: '1rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '0.5rem',
              color: '#334155',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '500',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'transform 0.1s, boxShadow 0.1s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#93C5FD'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
          >
            {industry}
          </Link>
        ))}
      </div>
    </div>
  );
}
