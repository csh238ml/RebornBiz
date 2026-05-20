import streamlit as st
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

def calculate_simulation(region, budget, curr_industry, target_industry):
    """상단에서 설정한 변수를 바탕으로 가상의 시뮬레이션 결과를 계산하는 함수"""
    return {
        "setup_cost": 3500,
        "bep_months": 24,
        "additional_monthly_profit": 150,
        "roi": 18.5,
        "bar_data": pd.DataFrame({
            "금액(만원)": [2000, 500, 3000, 800]
        }, index=[f"현재({curr_industry})_매출", f"현재({curr_industry})_이익", f"희망({target_industry})_매출", f"희망({target_industry})_이익"]),
        "line_data": pd.DataFrame({
            "현금흐름(만원)": [-3500, -2700, -1900, -1100, -300, 500, 1300, 2100, 2900, 3700, 4500, 5300]
        }, index=[f"{i}개월" for i in range(12)])
    }

# 페이지 기본 설정 (와이드 모드 권장)
st.set_page_config(page_title="업종 변경 시뮬레이션 - RebornBiz", page_icon="📊", layout="wide")
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

col_curr, col_target = st.columns(2)
with col_curr:
    st.markdown("##### 🏢 현재 업종")
    with st.container(border=True):
        c_large = st.selectbox("대분류 (현재)", options=["선택하세요"] + large_cats, key="c_large")
        
        c_medium_options = get_medium_categories(c_large) if c_large and c_large != "선택하세요" else []
        c_medium = st.selectbox("중분류 (현재)", options=["선택하세요"] + c_medium_options if c_medium_options else ["선택하세요"], key="c_medium", disabled=not c_medium_options)
        
        c_small_options = get_small_categories(c_medium) if c_medium and c_medium != "선택하세요" else []
        c_small = st.selectbox("소분류 (현재)", options=["선택하세요"] + c_small_options if c_small_options else ["선택하세요"], key="c_small", disabled=not c_small_options)
        
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
