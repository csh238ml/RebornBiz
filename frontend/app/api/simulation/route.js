import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

async function fetchSeoulApiSales(dongName, industryName) {
  const apiKey = "5567484e5963736838385266797650";
  const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/Vow_Trdar_Selng_Qu/1/1000/`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json();
      if (data.Vow_Trdar_Selng_Qu && data.Vow_Trdar_Selng_Qu.row) {
        for (const row of data.Vow_Trdar_Selng_Qu.row) {
          const rowDong = row.ADSTRD_CD_NM || row.TRDAR_CD_NM || "";
          const rowInd = row.SVC_INDUTY_CD_NM || "";
          
          if (rowDong.includes(dongName)) {
            const cleanTarget = industryName.replace(/\//g, " ").replace(/-/g, " ");
            const cleanRow = rowInd.replace(/\//g, " ").replace(/-/g, " ");
            
            const isMatched = cleanRow.includes(cleanTarget) || cleanTarget.includes(cleanRow) || 
                              cleanTarget.split(' ').some(word => word.length > 1 && cleanRow.includes(word));
                              
            if (isMatched) {
              const quarterSales = parseFloat(row.THSMON_SELNG_AMT || 0);
              const monthlySalesManwon = (quarterSales / 3) / 10000;
              const storeCount = parseInt(row.STRE_CO || 0, 10);
              return { sales: monthlySalesManwon, store_count: storeCount };
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`[API ERROR] 서울시 상권 데이터 로드 실패:`, error);
  }
  return null;
}

function extractCoreKeyword(indName) {
  const keywordsMap = {
    "커피": "커피전문점", "카페": "커피전문점", "음료": "커피전문점",
    "한식": "한식음식점", "국수": "한식음식점", "백반": "한식음식점", "고기": "한식음식점", "찌개": "한식음식점",
    "치킨": "치킨전문점", "통닭": "치킨전문점", "호프": "치킨전문점",
    "편의점": "편의점", "마트": "편의점", "슈퍼": "편의점",
    "의류": "의류소매점", "옷": "의류소매점", "패션": "의류소매점", "복장": "의류소매점",
    "미용": "미용실", "헤어": "미용실", "이발": "미용실", "뷰티": "미용실",
    "제과": "제과점", "빵": "제과점", "베이커리": "제과점", "디저트": "제과점",
    "패스트푸드": "패스트푸드", "버거": "패스트푸드", "피자": "패스트푸드", "샌드위치": "패스트푸드",
    "피트니스": "피트니스센터", "헬스": "피트니스센터", "운동": "피트니스센터", "요가": "피트니스센터", "필라테스": "피트니스센터",
    "약": "약국", "의약": "약국"
  };
  
  for (const [keyword, templateKey] of Object.entries(keywordsMap)) {
    if (indName.includes(keyword)) {
      return { coreKeyword: keyword, templateKey };
    }
  }
  
  const firstWord = indName ? indName.split(' ')[0] : "기타";
  return { coreKeyword: firstWord, templateKey: "기타" };
}

async function fetchNationwideStoreCount(dongName, targetIndustry) {
  const API_KEY = "FmRJggnPbuErC7S3g3D1K51bawXyTDd7hh/JZP+dkyl5OdU79rlNJ+NZWXUfncUYfKzWtgUj8Ks6oxWvRQdPSg==";
  const { coreKeyword } = extractCoreKeyword(targetIndustry);
  
  const params = new URLSearchParams({
    ServiceKey: API_KEY,
    pageNo: 1,
    numOfRows: 1,
    divId: "adongNm",
    key: dongName,
    bizesNm: coreKeyword,
    type: "json"
  });
  
  const url = `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong?${params.toString()}`;
  
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json();
      if (data.body && data.body.totalCount !== undefined) {
        return parseInt(data.body.totalCount, 10);
      }
    }
  } catch (error) {
    console.error(`[API ERROR] 전국 상권 데이터 로드 실패:`, error);
  }
  return null;
}

async function getIndustryMetrics() {
  const defaultMetrics = {
    "커피전문점": { sales: 1500, margin: 25, setup: 5000 },
    "한식음식점": { sales: 3000, margin: 20, setup: 8000 },
    "치킨전문점": { sales: 2500, margin: 18, setup: 4500 },
    "편의점": { sales: 4000, margin: 10, setup: 7000 },
    "의류소매점": { sales: 1200, margin: 30, setup: 4000 },
    "미용실": { sales: 1800, margin: 35, setup: 6000 },
    "제과점": { sales: 2200, margin: 22, setup: 8500 },
    "패스트푸드": { sales: 3500, margin: 15, setup: 9000 },
    "피트니스센터": { sales: 2800, margin: 40, setup: 15000 },
    "약국": { sales: 5000, margin: 12, setup: 12000 },
    "기타": { sales: 2000, margin: 20, setup: 5000 }
  };
  
  try {
    const [rows] = await pool.query('SELECT industry_name, avg_sales, avg_margin_rate, setup_cost FROM industry_metrics');
    if (rows.length === 0) return defaultMetrics;
    
    const metricsDict = {};
    for (const row of rows) {
      metricsDict[row.industry_name] = {
        sales: row.avg_sales,
        margin: row.avg_margin_rate,
        setup: row.setup_cost
      };
    }
    
    if (!metricsDict["기타"]) {
      metricsDict["기타"] = defaultMetrics["기타"];
    }
    
    return metricsDict;
  } catch (error) {
    console.error(`[ERROR] 업종 지표 DB 조회 실패:`, error);
    return defaultMetrics;
  }
}

async function calculateSimulation(region, budget, currIndustry, targetIndustry) {
  const INDUSTRY_TEMPLATE = await getIndustryMetrics();
  
  const getIndustryData = (indName) => {
    const { templateKey } = extractCoreKeyword(indName);
    if (templateKey !== "기타" && INDUSTRY_TEMPLATE[templateKey]) {
      return INDUSTRY_TEMPLATE[templateKey];
    }
    for (const [key, data] of Object.entries(INDUSTRY_TEMPLATE)) {
      if (key.includes(indName) || indName.includes(key)) {
        return data;
      }
    }
    return INDUSTRY_TEMPLATE["기타"];
  };

  let currProfit = 0;
  if (currIndustry && currIndustry !== "없음") {
    const currData = getIndustryData(currIndustry);
    const currSales = currData.sales;
    currProfit = currSales * (currData.margin / 100);
  }

  const targetData = getIndustryData(targetIndustry);
  
  let targetSales = targetData.sales;
  const targetSetup = targetData.setup;
  const targetMargin = targetData.margin;
  
  let storeCountInfo = null;
  let apiSource = null;

  const regionParts = region.split(' ');
  const dongName = regionParts.length > 0 ? regionParts[regionParts.length - 1] : "";

  if (region.includes("서울특별시")) {
    const apiData = await fetchSeoulApiSales(dongName, targetIndustry);
    if (apiData && apiData.sales > 0) {
      targetSales = apiData.sales;
      storeCountInfo = apiData.store_count;
      apiSource = "서울시 공공데이터 API";
    } else {
      targetSales = targetSales * 1.2;
    }
  } else {
    const nationwideCount = await fetchNationwideStoreCount(dongName, targetIndustry);
    let weight = 0.95;
    
    if (nationwideCount !== null && nationwideCount > 0) {
      storeCountInfo = nationwideCount;
      apiSource = "소상공인시장진흥공단 API";
      if (nationwideCount <= 5) weight = 1.15;
      else if (nationwideCount <= 15) weight = 1.0;
      else weight = 0.85;
    } else {
      const metroCities = ["부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시", "울산광역시"];
      if (metroCities.some(city => region.includes(city))) weight = 1.15;
    }
    targetSales = targetSales * weight;
  }
  
  if (budget > targetSetup) {
    const ratio = (budget - targetSetup) / targetSetup;
    const salesBoost = ratio * 0.30;
    targetSales = targetSales * (1 + salesBoost);
  }
  
  const finalMonthlyProfit = targetSales * (targetMargin / 100);
  const bepMonths = finalMonthlyProfit > 0 ? (targetSetup / finalMonthlyProfit) : Infinity;
  const roi = targetSetup > 0 ? ((finalMonthlyProfit * 12) / targetSetup) * 100 : 0;
  const additionalProfit = finalMonthlyProfit - currProfit;
  
  const result = {
    current_profit: Math.round(currProfit),
    target_profit: Math.round(finalMonthlyProfit),
    target_setup_cost: Math.round(targetSetup),
    bep_months: bepMonths !== Infinity ? Number(bepMonths.toFixed(1)) : Infinity,
    additional_profit: Math.round(additionalProfit),
    roi: Number(roi.toFixed(1)),
    investment: budget
  };
  
  if (storeCountInfo !== null) {
    result.store_count = storeCountInfo;
    if (apiSource) {
      result.api_source = apiSource;
    }
  }
  
  return result;
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const results = await calculateSimulation(
      body.region || "",
      body.investment || 0,
      body.current_biz || "",
      body.target_biz || ""
    );

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Simulation API Error:', error);
    return NextResponse.json(
      { success: false, message: '시뮬레이션 처리 중 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
