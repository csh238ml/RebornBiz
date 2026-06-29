'use server'

import { pool } from '@/lib/db';

/**
 * KOSIS 통계 데이터(getData)를 호출하여 nts_closure_stats 테이블에 적재하는 Server Action
 */
export async function fetchKosisData() {
  const KOSIS_API_KEY = "M2I3MzFjOGVmY2M3MWUxM2I3M2RkMWRlYmZkMWZkYWE=";
  const ORG_ID = "133";
  const TBL_ID = "DT_13301_N200";
  const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=${KOSIS_API_KEY}&orgId=${ORG_ID}&tblId=${TBL_ID}&prdSe=Y&format=json`;

  try {
    // 1. KOSIS API 호출 (안정성을 위해 AbortController를 이용한 10초 타임아웃 설정)
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

    if (!response.ok) {
      throw new Error(`KOSIS API Fetch Failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      if (data.err) {
         throw new Error(`KOSIS API Error: ${data.errMsg || JSON.stringify(data)}`);
      }
      throw new Error("KOSIS API Response is not an array");
    }

    // 2. 응답 데이터 매핑
    // PRD_DE: 기준연도, C1_NM: 업종명, DTVAL_CO1: 가동사업자수, DTVAL_CO2: 폐업자수
    const statsData = data.map(item => ({
      targetYear: item.PRD_DE,
      industryName: item.C1_NM,
      activeCount: parseInt(item.DTVAL_CO1, 10) || 0,
      closedCount: parseInt(item.DTVAL_CO2, 10) || 0,
    })).filter(item => item.targetYear && item.industryName); // 유효한 연도와 업종명이 있는 데이터만 필터링

    if (statsData.length === 0) {
      return { success: true, message: "No valid statistics data found from KOSIS API.", inserted: 0 };
    }

    // 3. MySQL RDS 데이터베이스(nts_closure_stats)에 데이터 적재
    // 다중 INSERT 처리를 위한 values 배열 구성 (bulk insert 방식)
    const values = statsData.map(stat => [
      stat.targetYear, 
      stat.industryName, 
      stat.activeCount, 
      stat.closedCount
    ]);
    
    // 4. INSERT ... ON DUPLICATE KEY UPDATE 쿼리 작성 (고유 연도+업종 중복 방지)
    const query = `
      INSERT INTO nts_closure_stats (target_year, industry_name, active_count, closed_count) 
      VALUES ?
      ON DUPLICATE KEY UPDATE 
        active_count = VALUES(active_count),
        closed_count = VALUES(closed_count)
    `;

    // mysql2의 'VALUES ?' 문법에 맞게 values 이중 배열 형태([values])로 전달
    const [result] = await pool.query(query, [values]);

    return {
      success: true,
      message: `Successfully fetched and upserted ${statsData.length} statistics records.`,
      affectedRows: result.affectedRows
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
