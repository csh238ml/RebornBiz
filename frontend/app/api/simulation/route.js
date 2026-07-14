import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

const DEFAULT_METRICS = {
  "커피전문점": { sales: 1500, margin: 25, setup: 5000, variable_rate: 35, labor_rate: 20 },
  "한식음식점": { sales: 3000, margin: 20, setup: 8000, variable_rate: 40, labor_rate: 25 },
  "치킨전문점": { sales: 2500, margin: 18, setup: 4500, variable_rate: 45, labor_rate: 20 },
  "편의점": { sales: 4000, margin: 10, setup: 7000, variable_rate: 65, labor_rate: 15 },
  "의류소매점": { sales: 1200, margin: 30, setup: 4000, variable_rate: 40, labor_rate: 15 },
  "미용실": { sales: 1800, margin: 35, setup: 6000, variable_rate: 15, labor_rate: 35 },
  "제과점": { sales: 2200, margin: 22, setup: 8500, variable_rate: 40, labor_rate: 25 },
  "패스트푸드": { sales: 3500, margin: 15, setup: 9000, variable_rate: 45, labor_rate: 25 },
  "피트니스센터": { sales: 2800, margin: 40, setup: 15000, variable_rate: 10, labor_rate: 30 },
  "약국": { sales: 5000, margin: 12, setup: 12000, variable_rate: 70, labor_rate: 10 },
  "기타": { sales: 2000, margin: 20, setup: 5000, variable_rate: 40, labor_rate: 20 }
};

// ==========================================
// 1. 공공데이터 연동 (상권/점포수 조회)
// ==========================================
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
              const storeCount = parseInt(row.STRE_CO || 0, 10);
              
              if (storeCount > 0) {
                const monthlySalesManwon = (quarterSales / storeCount / 3) / 10000;
                return { sales: monthlySalesManwon, store_count: storeCount };
              }
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

// ==========================================
// 2. 업종 기본 지표 조회
// ==========================================
async function getIndustryMetrics() {
  try {
    const [rows] = await pool.query('SELECT industry_name, avg_sales, avg_margin_rate, setup_cost FROM industry_metrics');
    if (rows.length === 0) return DEFAULT_METRICS;
    
    const metricsDict = {};
    for (const row of rows) {
      const templateKey = extractCoreKeyword(row.industry_name).templateKey;
      const defaultData = DEFAULT_METRICS[templateKey] || DEFAULT_METRICS["기타"];
      
      metricsDict[row.industry_name] = {
        sales: row.avg_sales,
        margin: row.avg_margin_rate,
        setup: row.setup_cost,
        variable_rate: defaultData.variable_rate,
        labor_rate: defaultData.labor_rate
      };
    }
    
    if (!metricsDict["기타"]) {
      metricsDict["기타"] = DEFAULT_METRICS["기타"];
    }
    
    return metricsDict;
  } catch (error) {
    console.error(`[ERROR] 업종 지표 DB 조회 실패:`, error);
    return DEFAULT_METRICS;
  }
}

const getIndustryDataHelper = (indName, metrics) => {
  const { templateKey } = extractCoreKeyword(indName);
  if (templateKey !== "기타" && metrics[templateKey]) {
    return metrics[templateKey];
  }
  for (const [key, data] of Object.entries(metrics)) {
    if (key.includes(indName) || indName.includes(key)) {
      return data;
    }
  }
  return metrics["기타"] || DEFAULT_METRICS["기타"];
};

// ==========================================
// 3. 업종 변경 시뮬레이션 고도화 (CHANGE 탭)
// ==========================================
async function calculateIndustryComparison(body) {
  const region = body.region || "";
  const currentBiz = body.current_biz || "";
  const targetBiz = body.target_biz || "";
  
  // 현재 매장 정보
  const cAreaPy = body.c_area || 15;
  const cRent = body.c_rent || 150;
  const cEmployees = body.c_employees || 1;
  const cSalesInput = body.c_sales; 
  const cLaborCostInput = body.c_labor_cost;
  
  // 희망 업종 정보
  const tRemodeling = body.t_remodeling; // 예측 리모델링 비
  const tReuseEquipment = body.t_reuse_equipment === true; // 기존 집기 활용
  const tExtraInvestment = body.investment || 0; // 투자 가능 금액
  
  const INDUSTRY_TEMPLATE = await getIndustryMetrics();
  
  // ----------------------------------------------------
  // 데이터 및 시나리오 헬퍼
  // ----------------------------------------------------
  let storeCountInfo = null;
  let apiSource = null;
  let competitionLevel = "보통";
  let appliedDefaults = [];
  
  const regionParts = region.split(' ');
  const dongName = regionParts.length > 0 ? regionParts[regionParts.length - 1] : "";

  // 타겟 업종 상권 조회
  let tBaseSales = 0;
  const targetData = getIndustryDataHelper(targetBiz, INDUSTRY_TEMPLATE);
  tBaseSales = targetData.sales;
  
  if (region.includes("서울특별시")) {
    const apiData = await fetchSeoulApiSales(dongName, targetBiz);
    if (apiData && apiData.sales > 0) {
      tBaseSales = apiData.sales;
      storeCountInfo = apiData.store_count;
      apiSource = "서울시 공공데이터 API";
      if (storeCountInfo <= 5) competitionLevel = "낮음";
      else if (storeCountInfo <= 15) competitionLevel = "보통";
      else competitionLevel = "높음";
    } else {
      appliedDefaults.push("타겟 예상 매출");
    }
  } else {
    const nationwideCount = await fetchNationwideStoreCount(dongName, targetBiz);
    if (nationwideCount !== null && nationwideCount >= 0) {
      storeCountInfo = nationwideCount;
      apiSource = "소상공인시장진흥공단 API";
      if (nationwideCount <= 5) competitionLevel = "낮음";
      else if (nationwideCount <= 15) competitionLevel = "보통";
      else competitionLevel = "높음";
    } else {
      appliedDefaults.push("경쟁 강도");
    }
    appliedDefaults.push("타겟 예상 매출");
  }

  // 배달 비중 추정 (타겟 업종 기준)
  let deliveryRate = 0;
  const { coreKeyword } = extractCoreKeyword(targetBiz);
  if (["치킨전문점", "패스트푸드"].includes(coreKeyword)) deliveryRate = 40;
  else if (["한식음식점"].includes(coreKeyword)) deliveryRate = 20;
  else if (["커피전문점"].includes(coreKeyword)) deliveryRate = 10;

  let deliveryLevel = "보통";
  if (deliveryRate >= 30) deliveryLevel = "높음";
  else if (deliveryRate <= 10) deliveryLevel = "낮음";

  // ----------------------------------------------------
  // 1) 현재 업종 (Before) P&L
  // ----------------------------------------------------
  const cData = getIndustryDataHelper(currentBiz, INDUSTRY_TEMPLATE);
  let cBaseSales = cSalesInput !== undefined && cSalesInput !== null ? cSalesInput : cData.sales;
  if (!cSalesInput) appliedDefaults.push("현재 예상 매출");

  let cLaborCost = cLaborCostInput !== undefined && cLaborCostInput !== null ? cLaborCostInput : cEmployees * 200;
  if (cLaborCostInput === undefined || cLaborCostInput === null) appliedDefaults.push("현재 인건비");

  const cUtilitiesCost = cAreaPy * 1.5;
  const cAdminFee = 10; // 기본 10만
  
  const generatePnl = (sales, dataParams, rent, labor, util, admin) => {
    const cogsRate = dataParams.variable_rate || 35;
    const paymentFeeRate = 1.5; 
    let dRate = 0;
    if (dataParams === targetData) {
        dRate = deliveryRate > 0 ? (deliveryRate * 0.1) : 0; 
    } else {
        const cCore = extractCoreKeyword(currentBiz).coreKeyword;
        let cDRate = 0;
        if (["치킨전문점", "패스트푸드"].includes(cCore)) cDRate = 40;
        else if (["한식음식점"].includes(cCore)) cDRate = 20;
        else if (["커피전문점"].includes(cCore)) cDRate = 10;
        dRate = cDRate > 0 ? (cDRate * 0.1) : 0;
    }
    
    const totalVariableRate = (cogsRate + paymentFeeRate + dRate) / 100;
    const variableCost = sales * totalVariableRate;
    const fixedCost = rent + labor + util + admin;
    const profit = sales - variableCost - fixedCost;
    const margin = sales > 0 ? (profit / sales) * 100 : 0;
    const bepSales = totalVariableRate < 1 ? fixedCost / (1 - totalVariableRate) : Infinity;

    return {
      sales: Math.round(sales),
      variableCost: Math.round(variableCost),
      fixedCost: Math.round(fixedCost),
      profit: Math.round(profit),
      margin: Number(margin.toFixed(1)),
      bepSales: bepSales !== Infinity ? Math.round(bepSales) : Infinity
    };
  };

  const currentScenarios = {
    min: generatePnl(cBaseSales * 0.8, cData, cRent, cLaborCost, cUtilitiesCost, cAdminFee),
    base: generatePnl(cBaseSales, cData, cRent, cLaborCost, cUtilitiesCost, cAdminFee),
    max: generatePnl(cBaseSales * 1.2, cData, cRent, cLaborCost, cUtilitiesCost, cAdminFee)
  };

  // ----------------------------------------------------
  // 2) 희망 업종 (After) P&L
  // ----------------------------------------------------
  let tLaborCost = cEmployees * 200; // 직원은 그대로 유지한다고 기본 가정
  const targetScenarios = {
    min: generatePnl(tBaseSales * 0.8, targetData, cRent, tLaborCost, cUtilitiesCost, cAdminFee),
    base: generatePnl(tBaseSales, targetData, cRent, tLaborCost, cUtilitiesCost, cAdminFee),
    max: generatePnl(tBaseSales * 1.2, targetData, cRent, tLaborCost, cUtilitiesCost, cAdminFee)
  };

  // ----------------------------------------------------
  // 3) 전환 비용 상세 산출 (Upgrade Cost)
  // ----------------------------------------------------
  const baseSetup = targetData.setup; // DB 기준 평균 세팅비
  
  let costDemolition = cAreaPy * 15; // 평당 15만원 철거비
  let costRemodel = tRemodeling !== undefined && tRemodeling !== null ? tRemodeling : cAreaPy * 150; // 평당 150만
  if (tRemodeling === undefined || tRemodeling === null) appliedDefaults.push("예상 리모델링 비");
  
  let costSign = 300;
  let costEquipment = baseSetup * 0.4; // 세팅비 중 40% 장비
  let costLicense = 150;
  let costMisc = baseSetup * 0.1; 

  const totalRawCost = costDemolition + costRemodel + costSign + costEquipment + costLicense + costMisc;
  
  let equipmentReuseSave = 0;
  if (tReuseEquipment) {
    equipmentReuseSave = costEquipment * 0.6; // 장비비용의 60% 세이브
  }
  
  const finalUpgradeCost = totalRawCost - equipmentReuseSave;
  
  // ----------------------------------------------------
  // 4) 차이값 및 투자금 회수기간
  // ----------------------------------------------------
  const cProfit = currentScenarios.base.profit;
  const tProfit = targetScenarios.base.profit;
  
  const diffSales = targetScenarios.base.sales - currentScenarios.base.sales;
  const diffProfit = tProfit - cProfit;
  const diffFixed = targetScenarios.base.fixedCost - currentScenarios.base.fixedCost;
  
  // 회수 기간 (증가된 이익 기준)
  // 변경 후 이익이 이전보다 작거나 같으면 회수 불가.
  const paybackMonths = diffProfit > 0 ? finalUpgradeCost / diffProfit : Infinity;

  // ----------------------------------------------------
  // 5) 종합 평가 스코어링 및 위험도 산출
  // ----------------------------------------------------
  let rentBurdenLevel = "보통";
  if (tBaseSales > 0) {
    const rentRatio = (cRent / tBaseSales) * 100;
    if (rentRatio > 15) rentBurdenLevel = "높음";
    else if (rentRatio < 8) rentBurdenLevel = "낮음";
  }

  let paybackLevel = "보통";
  if (paybackMonths > 36 || paybackMonths === Infinity) paybackLevel = "높음";
  else if (paybackMonths <= 12) paybackLevel = "낮음";

  let opDiffLevel = "보통";
  if (coreKeyword === "한식음식점" || coreKeyword === "치킨전문점" || coreKeyword === "제과점") opDiffLevel = "높음";
  else if (coreKeyword === "편의점" || coreKeyword === "의류소매점") opDiffLevel = "낮음";

  let scoreProfit = diffProfit > 200 ? 95 : diffProfit > 100 ? 80 : diffProfit > 0 ? 60 : 20;
  let scoreComp = competitionLevel === "낮음" ? 90 : competitionLevel === "보통" ? 70 : 40;
  let scorePayback = paybackMonths <= 12 ? 95 : paybackMonths <= 24 ? 75 : paybackMonths <= 36 ? 50 : 20;
  let scoreBurden = tExtraInvestment >= finalUpgradeCost ? 90 : 50;

  const totalScore = Math.round((scoreProfit * 0.4) + (scoreComp * 0.2) + (scorePayback * 0.2) + (scoreBurden * 0.2));

  let overallRec = 3;
  if (totalScore >= 80) overallRec = 5;
  else if (totalScore >= 65) overallRec = 4;
  else if (totalScore >= 50) overallRec = 3;
  else if (totalScore >= 35) overallRec = 2;
  else overallRec = 1;

  // ----------------------------------------------------
  // 6) AI 추천 텍스트 자동 생성
  // ----------------------------------------------------
  let recommendationText = `현재 업종 유지 대비 예상 월 영업이익은 약 ${Math.abs(diffProfit).toLocaleString()}만원 ${diffProfit >= 0 ? '증가' : '감소'}합니다.\n`;
  recommendationText += `전환에 필요한 최종 투자금은 약 ${Math.round(finalUpgradeCost).toLocaleString()}만원이며, `;
  if (diffProfit > 0) {
    recommendationText += `투자금 회수까지는 약 ${Math.round(paybackMonths)}개월이 소요될 것으로 예상됩니다.\n`;
  } else {
    recommendationText += `영업이익이 감소하여 사실상 전환 투자금 회수가 어렵습니다.\n`;
  }
  recommendationText += `현재 상권의 경쟁도는 ${competitionLevel} 수준입니다. `;
  
  if (overallRec >= 4) {
    recommendationText += `종합적으로 수익성 개선 효과가 명확하여 업종 변경을 긍정적으로 검토할 만합니다.`;
  } else if (overallRec === 3) {
    recommendationText += `종합적으로 보통 수준이나, 초기 투자비용 대비 수익 개선폭을 한 번 더 점검하시기 바랍니다.`;
  } else {
    recommendationText += `현재 조건에서는 업종 변경 시 투자 위험도가 높아 신중한 접근이 필요합니다.`;
  }

  const confidenceLevel = appliedDefaults.length > 2 ? "낮음" : appliedDefaults.length > 0 ? "보통" : "높음";

  return {
    isNewStartup: false,
    currentBiz,
    targetBiz,
    scenarios: {
      current: currentScenarios,
      target: targetScenarios
    },
    diff: {
      sales: Math.round(diffSales),
      profit: Math.round(diffProfit),
      fixed: Math.round(diffFixed),
      paybackMonths: paybackMonths !== Infinity ? Number(paybackMonths.toFixed(1)) : Infinity
    },
    upgradeCost: {
      demolition: Math.round(costDemolition),
      remodeling: Math.round(costRemodel),
      sign: Math.round(costSign),
      equipment: Math.round(costEquipment),
      license: Math.round(costLicense),
      misc: Math.round(costMisc),
      total: Math.round(totalRawCost),
      equipmentReuseSave: Math.round(equipmentReuseSave),
      finalInvest: Math.round(finalUpgradeCost)
    },
    risk: {
      competition: competitionLevel,
      rentBurden: rentBurdenLevel,
      payback: paybackLevel,
      operation: opDiffLevel,
      delivery: deliveryLevel
    },
    score: {
      total: totalScore,
      profitability: scoreProfit,
      competition: scoreComp,
      payback: scorePayback,
      burden: scoreBurden,
      stars: overallRec
    },
    meta: {
      store_count: storeCountInfo,
      api_source: apiSource,
      applied_defaults: appliedDefaults,
      confidence_level: confidenceLevel,
      interpretation: recommendationText,
      tExtraInvestment
    }
  };
}

// ==========================================
// 5. 신규 창업 시뮬레이션 고도화 (NEW 탭)
// ==========================================
async function calculateNewStartup(body) {
  const region = body.region || "";
  const targetIndustry = body.target_biz || "";
  const budget = body.investment || 0;
  const deposit = body.deposit || 0;
  const areaPy = body.area || 10;
  const rent = body.rent || 100;
  const adminFee = body.admin_fee || 10;
  const employees = body.employees || 0;
  const isOwnerWorking = body.is_owner_working !== false; // 기본 직접 근무
  
  // 상세 조건 (입력 없으면 null -> 평균값 대체용)
  const detailLabor = body.detail_labor; 
  const detailLoan = body.detail_loan || 0;
  const detailDeliveryRate = body.detail_delivery_rate; 
  const detailDemolition = body.detail_demolition || 0;
  const detailEquipmentSale = body.detail_equipment_sale || 0;
  const detailOpFund = body.detail_op_fund || 0;
  const detailMarketing = body.detail_marketing; 

  const INDUSTRY_TEMPLATE = await getIndustryMetrics();
  const targetData = getIndustryDataHelper(targetIndustry, INDUSTRY_TEMPLATE);
  
  let baseSales = targetData.sales;
  const targetSetup = targetData.setup; // 기본 세팅비
  
  let storeCountInfo = null;
  let apiSource = null;
  let competitionLevel = "보통";
  let appliedDefaults = [];

  const regionParts = region.split(' ');
  const dongName = regionParts.length > 0 ? regionParts[regionParts.length - 1] : "";

  // 1. 공공데이터를 통한 상권 매출 및 경쟁 강도 계산
  if (region.includes("서울특별시")) {
    const apiData = await fetchSeoulApiSales(dongName, targetIndustry);
    if (apiData && apiData.sales > 0) {
      baseSales = apiData.sales;
      storeCountInfo = apiData.store_count;
      apiSource = "서울시 공공데이터 API";
      if (storeCountInfo <= 5) competitionLevel = "낮음";
      else if (storeCountInfo <= 15) competitionLevel = "보통";
      else competitionLevel = "높음";
    } else {
      appliedDefaults.push("기준 예상 매출");
      // 데이터가 없으면 DB 매출 사용
    }
  } else {
    const nationwideCount = await fetchNationwideStoreCount(dongName, targetIndustry);
    if (nationwideCount !== null && nationwideCount >= 0) {
      storeCountInfo = nationwideCount;
      apiSource = "소상공인시장진흥공단 API";
      if (nationwideCount <= 5) competitionLevel = "낮음";
      else if (nationwideCount <= 15) competitionLevel = "보통";
      else competitionLevel = "높음";
    } else {
      appliedDefaults.push("경쟁 강도");
    }
    appliedDefaults.push("기준 예상 매출");
    // 서울 외 지역은 매출 데이터가 없으므로 DB 평균값 사용
  }

  // 2. 비용 계산 (변동비 및 고정비)
  // 2.1 인건비 처리
  let monthlyLaborCost = 0;
  if (detailLabor !== undefined && detailLabor !== null) {
    monthlyLaborCost = detailLabor;
  } else {
    // 평균 인건비율 혹은 최저시급 기반 추정
    // 직원 1명당 약 200만원 가정 (단순화)
    monthlyLaborCost = employees * 200;
    appliedDefaults.push("예상 월 인건비");
  }

  // 2.2 배달 비중
  let deliveryRate = 0;
  if (detailDeliveryRate !== undefined && detailDeliveryRate !== null) {
    deliveryRate = detailDeliveryRate;
  } else {
    const coreKeyword = extractCoreKeyword(targetIndustry).coreKeyword;
    if (["치킨전문점", "패스트푸드"].includes(coreKeyword)) deliveryRate = 40;
    else if (["한식음식점"].includes(coreKeyword)) deliveryRate = 20;
    else if (["커피전문점"].includes(coreKeyword)) deliveryRate = 10;
    else deliveryRate = 0;
    if(deliveryRate > 0) appliedDefaults.push("배달 매출 비중");
  }

  // 2.3 마케팅비
  let marketingCost = 0;
  if (detailMarketing !== undefined && detailMarketing !== null) {
    marketingCost = detailMarketing;
  } else {
    marketingCost = baseSales * 0.03; // 기본 매출의 3% 가정
    appliedDefaults.push("월 마케팅비");
  }

  // 2.4 공과금/기타 관리비
  const utilitiesCost = areaPy * 1.5; // 평당 1.5만원 가정
  
  // 3. 실제 필요 창업 자금 계산
  const initialMarketing = marketingCost > 0 ? marketingCost * 3 : 200; // 초기 마케팅 3개월치 또는 200만
  const initialInventory = baseSales * 0.3; // 첫 달 매출의 30%를 재고로 가정
  
  const actualStartupCapital = targetSetup + deposit + detailDemolition + initialInventory + initialMarketing + detailOpFund - detailEquipmentSale;
  
  const remainingFunds = budget - actualStartupCapital;

  // 4. 시나리오별 P&L 모델링
  const generateScenario = (sales) => {
    // 변동비 (재료비율 + 배달수수료율 + 결제수수료율)
    // 원가율(재료비율) = DB variable_rate 혹은 대략 35%
    const cogsRate = targetData.variable_rate || 35;
    const paymentFeeRate = 1.5; // 카드수수료
    const deliveryFeeRate = deliveryRate > 0 ? (deliveryRate * 0.1) : 0; // 배달매출 비중에 따른 추가 수수료 (배달매출의 10% 가정)
    
    const totalVariableRate = (cogsRate + paymentFeeRate + deliveryFeeRate) / 100;
    const variableCost = sales * totalVariableRate;

    const fixedCost = rent + adminFee + monthlyLaborCost + marketingCost + utilitiesCost + detailLoan;
    const profit = sales - variableCost - fixedCost;
    const margin = sales > 0 ? (profit / sales) * 100 : 0;

    // 회수 기간 (영업이익 기준)
    const paybackMonths = profit > 0 ? actualStartupCapital / profit : Infinity;

    return {
      sales: Math.round(sales),
      variableCost: Math.round(variableCost),
      fixedCost: Math.round(fixedCost),
      profit: Math.round(profit),
      margin: Number(margin.toFixed(1)),
      paybackMonths: paybackMonths !== Infinity ? Number(paybackMonths.toFixed(1)) : Infinity
    };
  };

  const minScenario = generateScenario(baseSales * 0.8);
  const baseScenario = generateScenario(baseSales);
  const maxScenario = generateScenario(baseSales * 1.2);

  // 5. 월 손익분기 매출 (BEP Sales)
  // BEP Sales = Fixed Costs / (1 - Variable Rate)
  const baseVariableRate = baseScenario.sales > 0 ? baseScenario.variableCost / baseScenario.sales : 0;
  const bepSales = baseVariableRate < 1 ? baseScenario.fixedCost / (1 - baseVariableRate) : Infinity;

  // 6. 운영자금 생존기간 (Runway)
  // 최소 시나리오에서 적자일 경우, 남은 자금으로 버틸 수 있는 기간
  let runwayMonths = Infinity;
  if (minScenario.profit < 0 && remainingFunds > 0) {
    runwayMonths = remainingFunds / Math.abs(minScenario.profit);
  } else if (remainingFunds <= 0) {
    runwayMonths = 0;
  }

  // 7. 종합 위험도 평가 및 문구 작성
  let riskScore = 0;
  const riskReasons = [];
  
  if (remainingFunds < 0) {
    riskScore += 3;
    riskReasons.push(`가용 예산 대비 필요 자금이 약 ${Math.abs(Math.round(remainingFunds)).toLocaleString()}만원 부족합니다.`);
  }
  if (minScenario.profit < 0) {
    riskScore += 2;
    riskReasons.push(`보수적(최소) 시나리오에서 월 ${Math.abs(Math.round(minScenario.profit)).toLocaleString()}만원의 영업 적자가 예상됩니다.`);
    if (runwayMonths > 0 && runwayMonths < 6) {
      riskScore += 1;
      riskReasons.push(`현재 운영자금 여유분으로는 적자 시 약 ${runwayMonths.toFixed(1)}개월 버틸 수 있습니다.`);
    } else if (runwayMonths === 0) {
      riskScore += 2;
      riskReasons.push(`적자를 방어할 예비 운영자금이 없습니다.`);
    }
  }
  if (competitionLevel === "높음") {
    riskScore += 1;
    riskReasons.push(`반경 내 동일 업종 점포 수가 많아 경쟁이 치열합니다.`);
  }

  let riskLevel = "낮음";
  if (riskScore >= 4) riskLevel = "높음";
  else if (riskScore >= 2) riskLevel = "보통";

  // 신뢰도 평가
  let confidenceLevel = "높음";
  if (appliedDefaults.length > 3) confidenceLevel = "낮음";
  else if (appliedDefaults.length > 0) confidenceLevel = "보통";

  // 자동 해석 문구
  let interpretation = `기준 예상 매출은 월 ${baseScenario.sales.toLocaleString()}만원으로 계산되었습니다.\n`;
  if (baseScenario.sales >= bepSales) {
    interpretation += `이는 손익분기 매출(${Math.round(bepSales).toLocaleString()}만원)을 상회하여 흑자 구조가 예상됩니다.\n`;
  } else {
    interpretation += `이는 손익분기 매출(${Math.round(bepSales).toLocaleString()}만원)에 미치지 못해 적자 위험이 있습니다.\n`;
  }
  if (remainingFunds > 0) {
    interpretation += `가용 예산 내 창업이 가능하며 약 ${Math.round(remainingFunds).toLocaleString()}만원의 여유 운영자금을 확보할 수 있습니다. `;
  } else {
    interpretation += `현재 예산으로는 창업 자금이 약 ${Math.abs(Math.round(remainingFunds)).toLocaleString()}만원 부족하므로 자금 계획 조정이 필요합니다. `;
  }

  const result = {
    isNewStartup: true,
    scenarios: {
      min: minScenario,
      base: baseScenario,
      max: maxScenario
    },
    bep_sales: bepSales !== Infinity ? Math.round(bepSales) : Infinity,
    actual_startup_capital: Math.round(actualStartupCapital),
    remaining_funds: Math.round(remainingFunds),
    runway_months: runwayMonths !== Infinity ? Number(runwayMonths.toFixed(1)) : Infinity,
    risk: {
      level: riskLevel,
      reasons: riskReasons
    },
    meta: {
      store_count: storeCountInfo,
      api_source: apiSource,
      competition_level: competitionLevel,
      applied_defaults: appliedDefaults,
      confidence_level: confidenceLevel,
      interpretation: interpretation.trim(),
      is_owner_working: isOwnerWorking
    }
  };

  return result;
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (body.tab === 'NEW') {
      const results = await calculateNewStartup(body);
      return NextResponse.json({
        success: true,
        data: results
      });
    } else {
      const results = await calculateIndustryComparison(body);
      return NextResponse.json({
        success: true,
        data: results
      });
    }

  } catch (error) {
    console.error('Simulation API Error:', error);
    return NextResponse.json(
      { success: false, message: '시뮬레이션 처리 중 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
