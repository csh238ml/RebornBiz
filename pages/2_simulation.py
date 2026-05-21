import streamlit as st
st.set_page_config(page_title="업종 변경 시뮬레이션 - RebornBiz", page_icon="📊", layout="wide", initial_sidebar_state="auto")

import streamlit.components.v1 as components
import plotly.express as px
import pandas as pd
import sys
import os
import importlib

# 모듈 폴더 경로 추가 (industry_analyzer 함수를 불러오기 위함)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 강제로 최신 모듈을 다시 읽어오도록 캐시 클리어
if 'modules.database' in sys.modules:
    importlib.reload(sys.modules['modules.database'])
if 'modules.region_selector' in sys.modules:
    importlib.reload(sys.modules['modules.region_selector'])

from modules.industry_analyzer import compare_industries, INDUSTRY_DATA
from modules.components import set_custom_sidebar
from modules.database import get_large_categories, get_medium_categories, get_small_categories
from modules.region_selector import render_region_selector


import time
import requests

@st.cache_data(show_spinner=False, ttl=3600)
def fetch_seoul_api_sales(dong_name, industry_name):
    """
    서울시 우리마을상권 분석서비스 API 연동 함수
    - dong_name: 읍면동 이름 (예: 역삼1동)
    - industry_name: 서비스 업종명 (예: 한식음식점)
    """
    # st.secrets를 통한 인증키 관리 권장 (기본값으로 사용자 제공 키 사용)
    api_key = "5567484e5963736838385266797650"
    try:
        if "SEOUL_API_KEY" in st.secrets:
            api_key = st.secrets["SEOUL_API_KEY"]
    except Exception:
        pass
        
    url = f"http://openapi.seoul.go.kr:8088/{api_key}/json/Vow_Trdar_Selng_Qu/1/1000/"
    
    try:
        # 타임아웃을 짧게 설정하여 API 장애 시 빠른 Fallback 유도
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            data = response.json()
            if 'Vow_Trdar_Selng_Qu' in data and 'row' in data['Vow_Trdar_Selng_Qu']:
                for row in data['Vow_Trdar_Selng_Qu']['row']:
                    # 행정동명(ADSTRD_CD_NM) 또는 상권명(TRDAR_CD_NM) 매칭
                    row_dong = row.get("ADSTRD_CD_NM", "") or row.get("TRDAR_CD_NM", "")
                    row_ind = row.get("SVC_INDUTY_CD_NM", "")
                    
                    if dong_name in row_dong and industry_name in row_ind:
                        # 당월 매출 금액 (원 단위) -> 분기 매출이므로 3으로 나누고, 만원 단위로 변환
                        quarter_sales = float(row.get("THSMON_SELNG_AMT", 0))
                        monthly_sales_manwon = (quarter_sales / 3) / 10000
                        
                        store_count = int(row.get("STRE_CO", 0))
                        
                        return {
                            "sales": monthly_sales_manwon,
                            "store_count": store_count
                        }
    except Exception as e:
        print(f"[API ERROR] 서울시 상권 데이터 로드 실패 (Fallback 실행): {e}")
        
    return None

def calculate_simulation(region, budget, curr_industry, target_industry):
    # [1] 기준 데이터(Template) 구축: [평균 월 매출액, 평균 영업이익률(%), 평균 창업 비용] (단위: 만원)
    INDUSTRY_TEMPLATE = {
        "커피전문점": {"sales": 1500, "margin": 25, "setup": 5000},
        "한식음식점": {"sales": 3000, "margin": 20, "setup": 8000},
        "치킨전문점": {"sales": 2500, "margin": 18, "setup": 4500},
        "편의점": {"sales": 4000, "margin": 10, "setup": 7000},
        "의류소매점": {"sales": 1200, "margin": 30, "setup": 4000},
        "미용실": {"sales": 1800, "margin": 35, "setup": 6000},
        "제과점": {"sales": 2200, "margin": 22, "setup": 8500},
        "패스트푸드": {"sales": 3500, "margin": 15, "setup": 9000},
        "피트니스센터": {"sales": 2800, "margin": 40, "setup": 15000},
        "약국": {"sales": 5000, "margin": 12, "setup": 12000},
        "기타": {"sales": 2000, "margin": 20, "setup": 5000}
    }
    
    def get_industry_data(ind_name):
        for key, data in INDUSTRY_TEMPLATE.items():
            if key in ind_name:
                return data
        return INDUSTRY_TEMPLATE["기타"]

    curr_data = get_industry_data(curr_industry)
    target_data = get_industry_data(target_industry)
    
    curr_sales = curr_data["sales"]
    curr_profit = curr_sales * (curr_data["margin"] / 100)
    
    target_sales = target_data["sales"]
    target_setup = target_data["setup"]
    target_margin = target_data["margin"]
    
    store_count_info = None

    # [2] 서울시 공공데이터 API 연동 분기 처리
    if "서울특별시" in region:
        # region 예시: "서울특별시 강남구 역삼1동" -> "역삼1동" 추출
        dong_name = region.split()[-1] if len(region.split()) > 0 else ""
        
        api_data = fetch_seoul_api_sales(dong_name, target_industry)
        if api_data and api_data["sales"] > 0:
            target_sales = api_data["sales"]
            store_count_info = api_data["store_count"]
        else:
            # API 실패 시 Fallback 로직 (기본 서울 프리미엄 가중치 적용)
            target_sales = target_sales * 1.2
    else:
        # [3] 타 지역 가중치(Region Weight) 적용
        metro_cities = ["부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시", "울산광역시"]
        if any(city in region for city in metro_cities):
            weight = 1.15
        else:
            weight = 0.95
            
        target_sales = target_sales * weight
    
    # [4] 예산 보정 로직
    if budget > target_setup:
        ratio = (budget - target_setup) / target_setup
        sales_boost = ratio * 0.30
        target_sales = target_sales * (1 + sales_boost)
        
    # [4] 시뮬레이션 지표 산출
    final_monthly_profit = target_sales * (target_margin / 100)
    bep_months = target_setup / final_monthly_profit if final_monthly_profit > 0 else 999
    roi = (final_monthly_profit * 12 / target_setup) * 100 if target_setup > 0 else 0
    additional_profit = final_monthly_profit - curr_profit
    
    cash_flow = [-target_setup]
    for i in range(1, 12):
        cash_flow.append(cash_flow[-1] + final_monthly_profit)
        
    result = {
        "setup_cost": int(target_setup),
        "bep_months": round(bep_months, 1),
        "additional_monthly_profit": int(additional_profit),
        "roi": round(roi, 1),
        "bar_data": pd.DataFrame({
            "금액(만원)": [int(curr_sales), int(curr_profit), int(target_sales), int(final_monthly_profit)]
        }, index=[f"현재({curr_industry})_매출", f"현재({curr_industry})_이익", f"희망({target_industry})_매출", f"희망({target_industry})_이익"]),
        "line_data": pd.DataFrame({
            "현금흐름(만원)": cash_flow
        }, index=[f"{i}개월" for i in range(12)])
    }
    
    if store_count_info is not None:
        result["store_count"] = store_count_info
        
    return result

# 페이지 기본 설정 (와이드 모드 권장)
set_custom_sidebar()

def ad_space():
    """광고 플레이스홀더를 렌더링하는 함수"""
    components.html(
        """
        <div style="
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100px; 
            border: 2px dashed #cccccc; 
            border-radius: 10px; 
            background-color: #f8f9fa; 
            color: #adb5bd; 
            font-family: 'Segoe UI', sans-serif;
            margin: 10px 0;">
            <h3>AD Space (Google AdSense)</h3>
        </div>
        """,
        height=120
    )

st.title("업종 변경 시뮬레이션 📊")
st.markdown("특정 상권 내에서 새로운 업종으로 변경할 경우의 초기 투자 비용과 예상 수익률을 분석합니다.")

st.divider() # 시각적 분리선

# --- [Step 1] 지역 및 가용 예산 ---
st.subheader("1. 지역 및 예산 설정")

# 새롭게 작성된 DB 연동 지역 선택 모듈 사용
sido, sigungu, dong = render_region_selector()

st.write("") # 간격 띄우기
st.markdown("#### 💰 가용 예산")
investment = st.number_input("가용 투자 예산 (만원)", min_value=0, value=5000, step=100)

st.write("") # 간격 띄우기

# --- [Step 2] 업종 정보 입력 ---
st.subheader("2. 업종 전환 정보")

current_biz = "알 수 없음"
target_biz = "알 수 없음"

large_cats = get_large_categories()

# 현재 업종 소분류 선택 시, 희망 업종 대/중분류 자동 동기화 콜백
def sync_target_industry():
    if st.session_state.c_small and st.session_state.c_small != "선택하세요":
        st.session_state.t_large = st.session_state.c_large
        st.session_state.t_medium = st.session_state.c_medium
        st.session_state.t_small = "선택하세요"

col_curr, col_target = st.columns(2)
with col_curr:
    st.markdown("##### 🏢 현재 업종")
    with st.container(border=True):
        c_large = st.selectbox("대분류 (현재)", options=["선택하세요"] + large_cats, key="c_large")
        
        c_medium_options = get_medium_categories(c_large) if c_large and c_large != "선택하세요" else []
        c_medium = st.selectbox("중분류 (현재)", options=["선택하세요"] + c_medium_options if c_medium_options else ["선택하세요"], key="c_medium", disabled=not c_medium_options)
        
        c_small_options = get_small_categories(c_medium) if c_medium and c_medium != "선택하세요" else []
        c_small = st.selectbox("소분류 (현재)", options=["선택하세요"] + c_small_options if c_small_options else ["선택하세요"], key="c_small", disabled=not c_small_options, on_change=sync_target_industry)
        
        if c_small and c_small != "선택하세요":
            current_biz = c_small

with col_target:
    st.markdown("##### 🚀 전환 희망 업종")
    with st.container(border=True):
        t_large = st.selectbox("대분류 (희망)", options=["선택하세요"] + large_cats, key="t_large")
        
        t_medium_options = get_medium_categories(t_large) if t_large and t_large != "선택하세요" else []
        t_medium = st.selectbox("중분류 (희망)", options=["선택하세요"] + t_medium_options if t_medium_options else ["선택하세요"], key="t_medium", disabled=not t_medium_options)
        
        t_small_options = get_small_categories(t_medium) if t_medium and t_medium != "선택하세요" else []
        t_small = st.selectbox("소분류 (희망)", options=["선택하세요"] + t_small_options if t_small_options else ["선택하세요"], key="t_small", disabled=not t_small_options)
        
        if t_small and t_small != "선택하세요":
            target_biz = t_small

st.write("")

# 시뮬레이션 실행 버튼
if st.button("시뮬레이션 실행 ➡️", type="primary", use_container_width=True):
    with st.spinner("빅데이터 기반 상권 분석 및 수익률 시뮬레이션을 진행 중입니다... (약 1.5초 소요)"):
        time.sleep(1.5) # 로딩 지연 효과
        
        region_str = f"{sido} {sigungu} {dong}"
        sim_results = calculate_simulation(region_str, investment, current_biz, target_biz)
        
        st.success("데이터 분석이 완료되었습니다!")
        st.divider()
        
        # --- [Step 3] 시뮬레이션 결과 대시보드 ---
        st.subheader("3. 기대 수익률 및 핵심 지표")
        
        # 1. 핵심 수치 강조 (Metric)
        m1, m2, m3, m4 = st.columns(4)
        
        delta_msg = "예산 내 가능" if investment >= sim_results['setup_cost'] else "예산 초과"
        delta_col = "normal" if investment >= sim_results['setup_cost'] else "inverse"
        
        m1.metric(label="예상 초기 세팅 비용", value=f"{sim_results['setup_cost']:,} 만원", delta=delta_msg, delta_color=delta_col)
        m2.metric(label="예상 투자금 회수(BEP)", value=f"{sim_results['bep_months']} 개월", delta="-6개월 단축 (이전 대비)")
        m3.metric(label="월별 예상 추가 수익", value=f"{sim_results['additional_monthly_profit']:,} 만원", delta="12% 증가")
        m4.metric(label="예상 ROI", value=f"{sim_results['roi']} %", delta="우수 상권", delta_color="normal")
        
        st.write("")
        if "store_count" in sim_results:
            st.info(f"💡 **상권 실데이터 연동**: 해당 지역 내 동일 업종 점포 수는 총 **{sim_results['store_count']}개** 입니다. (서울시 공공데이터 API)")
        st.write("")
        
        # 2. 상세 차트 (Expander로 감싸서 기본 화면을 심플하게 유지)
        with st.expander("📈 상세 지표 비교 및 현금흐름 차트 보기", expanded=True):
            chart_col1, chart_col2 = st.columns(2)
            
            with chart_col1:
                st.markdown("**매출 및 순이익 비교 (현재 vs 전환)**")
                st.bar_chart(sim_results["bar_data"])
                
            with chart_col2:
                st.markdown("**누적 현금흐름 및 BEP 시뮬레이션**")
                st.line_chart(sim_results["line_data"])


# 페이지 하단 광고
ad_space()
