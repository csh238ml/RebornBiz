'use server'

import { pool } from '@/lib/db';

const KOSIS_API_KEY = "M2I3MzFjOGVmY2M3MWUxM2I3M2RkMWRlYmZkMWZkYWE=";
const ORG_ID = "133";

const API_LIST = [
  { tblId: 'DT_133001N_9825', statType: 'NEW', categoryType: 'REGION' },
  { tblId: 'DT_133001N_9826', statType: 'NEW', categoryType: 'MONTH' },
  { tblId: 'DT_133001N_9827', statType: 'NEW', categoryType: 'AGE' },
  { tblId: 'DT_133001_9832', statType: 'CLOSE', categoryType: 'REGION' },
  { tblId: 'DT_133001_9833', statType: 'CLOSE', categoryType: 'MONTH' },
  { tblId: 'DT_133001_9834', statType: 'CLOSE', categoryType: 'AGE' }
];

// C1_NM과 C2_NM 중에서 어느 것이 업종명이고 카테고리(지역/월/연령)인지 유동적으로 분별
const parseCategoryAndIndustry = (c1, c2, categoryType) => {
  let categoryValue = c1;
  let industryName = c2;
  
  const isCategory = (str) => {
    if (!str) return false;
    if (categoryType === 'REGION') return /전국|서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주/.test(str);
    if (categoryType === 'MONTH') return /월$|합계$/.test(str);
    if (categoryType === 'AGE') return /대$|미만$|이상$|합계$|연령/.test(str);
    return false;
  };

  // 만약 C2가 카테고리 패턴에 맞고, C1이 안 맞으면 순서를 교체
  if (isCategory(c2) && !isCategory(c1)) {
    categoryValue = c2;
    industryName = c1;
  }

  return { categoryValue, industryName };
};

/**
 * 100대 생활밀접업종 6개 통계표(신규/폐업 x 지역/월/연령) 통합 수집 및 kosis_life_biz_stats에 적재하는 Server Action
 */
export async function fetchKosisData() {
  let totalAffectedRows = 0;

  try {
    for (const api of API_LIST) {
      const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=${KOSIS_API_KEY}&orgId=${ORG_ID}&tblId=${api.tblId}&prdSe=Y&format=json`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      // HTTP 상태 코드 에러 시 텍스트 로깅
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[KOSIS API Error] tblId: ${api.tblId}, Status: ${response.status}, Body: ${errorText}`);
        throw new Error(`KOSIS API Fetch Failed for ${api.tblId}: ${response.status}`);
      }

      const text = await response.text();

      // JSON 파싱 (에러 발생 시 비표준 텍스트 로깅)
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error(`[KOSIS API JSON Parse Error] tblId: ${api.tblId}, Raw text:`, text);
        throw new Error(`JSON 파싱 에러 발생 (${api.tblId}). 파싱 실패한 텍스트: ${text.substring(0, 100)}...`);
      }

      if (!Array.isArray(data)) {
        if (data.err) {
           throw new Error(`KOSIS API Error (${api.tblId}): ${data.errMsg || JSON.stringify(data)}`);
        }
        throw new Error(`KOSIS API Response is not an array for ${api.tblId}`);
      }

      // 응답 데이터 매핑
      const statsData = data.map(item => {
        const { categoryValue, industryName } = parseCategoryAndIndustry(item.C1_NM, item.C2_NM, api.categoryType);
        return {
          targetYear: item.PRD_DE,
          statType: api.statType,
          categoryType: api.categoryType,
          categoryValue: categoryValue,
          industryName: industryName,
          bizCount: parseInt(item.DTVAL_CO1, 10) || 0,
        };
      }).filter(item => item.targetYear && item.categoryValue && item.industryName);

      if (statsData.length === 0) {
        console.log(`No valid statistics data found from KOSIS API for ${api.tblId}.`);
        continue; // 데이터가 비었어도 다음 API 진행
      }

      // DB 적재 (bulk insert 방식)
      const values = statsData.map(stat => [
        stat.targetYear, 
        stat.statType, 
        stat.categoryType, 
        stat.categoryValue,
        stat.industryName,
        stat.bizCount
      ]);
      
      const query = `
        INSERT INTO kosis_life_biz_stats (target_year, stat_type, category_type, category_value, industry_name, biz_count) 
        VALUES ?
        ON DUPLICATE KEY UPDATE 
          biz_count = VALUES(biz_count)
      `;

      const [result] = await pool.query(query, [values]);
      totalAffectedRows += result.affectedRows;
    }

    return {
      success: true,
      message: "6개 통계표 통합 수집 완료",
      affectedRows: totalAffectedRows
    };

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("[KOSIS API] Request timed out.");
      return { success: false, error: "KOSIS API request timed out (10s limit)." };
    }
    console.error("[KOSIS API] Error during fetch or database insert:", error);
    return { success: false, error: error.message };
  }
}
