import Link from 'next/link';
import { pool } from '@/lib/db';
import StickyHeader from '@/components/StickyHeader';
import AdSlot from '@/components/AdSlot';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const industry = decodeURIComponent(resolvedParams.industry || '');

  const title = `[${industry}] 창업 및 폐업 현황 트렌드 분석 - RebornBiz`;
  const description = `국세청 공식 확정 데이터를 기반으로 분석한 ${industry} 업종의 지역별, 연령별, 월별 최신 창업 및 폐업자 수 통계 리포트를 확인하세요.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    }
  };
}

async function getIndustryTrend(industry) {
  try {
    const query = `
      SELECT 
        target_year, 
        SUM(IF(stat_type='NEW', biz_count, 0)) as new_count, 
        SUM(IF(stat_type='CLOSE', biz_count, 0)) as close_count
      FROM kosis_life_biz_stats 
      WHERE industry_name = ? AND category_type = 'REGION' -- REGION 데이터의 합이 전국 합과 일치함 (또는 전국 단일값)
      GROUP BY target_year 
      ORDER BY target_year ASC
    `;
    const [rows] = await pool.query(query, [industry]);

    // KOSIS 데이터 구조상 category_type 중 하나만 집계해야 중복되지 않음. REGION 탭의 '전국' 혹은 합산으로 사용.
    // 만약 category_value='전국' 이 별도로 있다면 WHERE category_value='전국'도 고려 가능하지만,
    // 현재는 지역별 합산으로 전체 트렌드를 유추함.
    
    return rows;
  } catch (err) {
    console.error(`Failed to fetch industry trend for ${industry}:`, err);
    return [];
  }
}

export default async function IndustryTrendPage({ params }) {
  const resolvedParams = await params;
  const industry = decodeURIComponent(resolvedParams.industry || '');
  
  const trendData = await getIndustryTrend(industry);
  const maxCount = trendData.length > 0 ? Math.max(...trendData.map(r => Math.max(r.new_count, r.close_count))) : 1;

  return (
    <div className="custom-main">
      <StickyHeader>
        <div className="pc-only" style={{ alignItems: 'center', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '1rem' }}>
          <div style={{ flexShrink: 0, marginRight: '2rem' }}>
            <img src="/rebornBiz_logo.png" alt="RebornBiz Logo" style={{ width: '200px', height: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#31333F' }}>
              📈 {industry} 트렌드 분석
            </h1>
            <p style={{ fontSize: '1rem', marginBottom: '0', lineHeight: '1.6', color: '#555' }}>
              선택하신 <strong>{industry}</strong> 업종의 연도별 창업 및 폐업 추이를 분석합니다.<br />
              과거 데이터부터 가장 최근까지의 증감 추세를 확인하고 현명한 비즈니스 결정을 내리세요.
            </p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#31333F' }}>
            📈 {industry} 트렌드
          </h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>
            {industry} 업종의 연도별 창업 및 폐업 추이
          </p>
        </div>
      </StickyHeader>

      <div style={{ marginBottom: '1rem' }}>
        <Link href="/statistics" style={{ display: 'inline-flex', alignItems: 'center', color: '#3B82F6', fontWeight: '600', textDecoration: 'none' }}>
          ← 목록으로 돌아가기
        </Link>
      </div>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0 2.5rem 0' }} />

      {/* 연도별 트렌드 테이블 및 인포그래픽 */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1E293B' }}>
        📅 연도별 누적 창업/폐업 추이
      </h2>
      <div style={{ marginBottom: '3rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '20%' }}>기준 연도</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '15%', textAlign: 'right' }}>신규 창업 (건)</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '15%', textAlign: 'right' }}>폐업 (건)</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', width: '50%' }}>비율 (신규 vs 폐업)</th>
              </tr>
            </thead>
            <tbody>
              {trendData.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>해당 업종의 데이터가 없습니다.</td></tr>
              ) : (
                trendData.map((row, idx) => {
                  const newPercent = maxCount > 0 ? (row.new_count / maxCount) * 100 : 0;
                  const closePercent = maxCount > 0 ? (row.close_count / maxCount) * 100 : 0;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#334155' }}>{row.target_year}년</td>
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
      
      <div style={{ padding: '2rem', backgroundColor: '#F8FAFC', borderRadius: '0.5rem', border: '1px solid #E2E8F0', marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#1E293B', marginTop: 0 }}>💡 분석 팁</h3>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: 0 }}>
          창업 대비 폐업 비율이 현저히 높은 연도는 해당 업종의 상권이 포화 상태이거나 경제적 요인으로 침체되었음을 의미할 수 있습니다. 
          최근 데이터의 추세를 통해 현재 진입하기 좋은 업종인지 판단하는 데 참고하세요.
        </p>
      </div>

    </div>
  );
}
