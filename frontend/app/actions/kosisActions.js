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
 * 100대 생활밀접업종 6개 통계표 통합 수집 (트랜잭션 기반 일괄 갱신)
 */
export async function fetchKosisData() {
  let allStats = []; // 6개 통계표 데이터를 모두 담아둘 메모리 배열

  try {
    // 1. 메모리에 모든 데이터 먼저 선 수집 (API 호출)
    for (const api of API_LIST) {
      // 필수 요청 변수 추가: itmId=ALL, objL1=ALL, objL2=ALL, newEstPrdCnt=1
      const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=${KOSIS_API_KEY}&orgId=${ORG_ID}&tblId=${api.tblId}&prdSe=Y&format=json&itmId=ALL&objL1=ALL&objL2=ALL&newEstPrdCnt=1`;

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

      // HTTP 상태 코드 에러 시 즉시 중단 (방어 로직)
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[KOSIS API Error] tblId: ${api.tblId}, Status: ${response.status}, Body: ${errorText}`);
        throw new Error(`KOSIS API Fetch Failed for ${api.tblId}: ${response.status}`);
      }

      const text = await response.text();

      // JSON 파싱 (에러 발생 시 비표준 텍스트 반환 등 방어 로직)
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
        return [
          item.PRD_DE,           // targetYear
          api.statType,          // statType
          api.categoryType,      // categoryType
          categoryValue,         // categoryValue
          industryName,          // industryName
          parseInt(item.DT, 10) || 0 // bizCount (statisticsParameterData.do 에서는 DT 필드 사용)
        ];
      }).filter(item => item[0] && item[3] && item[4]); // targetYear, categoryValue, industryName이 존재하는지 유효성 검사

      if (statsData.length > 0) {
        allStats.push(...statsData); // 배열 병합
      } else {
        console.log(`No valid statistics data found from KOSIS API for ${api.tblId}.`);
      }
    }

    if (allStats.length === 0) {
      return { success: true, message: "No valid statistics data found across all 6 APIs.", affectedRows: 0 };
    }

    // 2. Transaction 기반 DB 적재 로직 시작
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction(); // 트랜잭션 시작

      // 2-1. 기존 데이터 전체 삭제 (좀비 데이터 방지)
      await connection.query('DELETE FROM kosis_life_biz_stats');

      // 2-2. Bulk Insert 실행 (메모리에 모아둔 데이터를 한 번에 밀어넣기)
      const insertQuery = `
        INSERT INTO kosis_life_biz_stats (target_year, stat_type, category_type, category_value, industry_name, biz_count) 
        VALUES ?
      `;
      const [result] = await connection.query(insertQuery, [allStats]);

      await connection.commit(); // 정상 완료 시 커밋

      return {
        success: true,
        message: "6개 통계표 일괄 갱신 및 트랜잭션 커밋 완료",
        affectedRows: result.affectedRows
      };

    } catch (dbError) {
      await connection.rollback(); // DB 작업 중 에러 시 롤백하여 기존 데이터 보존
      console.error("[KOSIS API] Database transaction failed and rolled back:", dbError);
      throw new Error(`Database Error: ${dbError.message}`);
    } finally {
      connection.release(); // 풀에 커넥션 반환
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("[KOSIS API] Request timed out.");
      return { success: false, error: "KOSIS API request timed out (10s limit)." };
    }
    console.error("[KOSIS API] Execution failed:", error);
    return { success: false, error: error.message };
  }
}
