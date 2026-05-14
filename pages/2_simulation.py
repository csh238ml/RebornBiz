import streamlit as st
import streamlit.components.v1 as components
import plotly.express as px
import pandas as pd
import sys
import os

# 모듈 폴더 경로 추가 (industry_analyzer 함수를 불러오기 위함)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.industry_analyzer import compare_industries, INDUSTRY_DATA

from modules.components import set_custom_sidebar

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
st.write("새로운 업종으로 변경할 경우의 초기 투자 비용과 예상 수익률을 분석하여 안전한 재창업을 돕습니다.")
st.markdown("---")

# 1. 입력 섹션
st.subheader("업종 정보 및 가용 예산 입력")

@st.cache_data
def get_industry_df():
    from modules.database import SessionLocal
    db = SessionLocal()
    df = pd.read_sql("SELECT large_cat_name, medium_cat_name, small_cat_name FROM industry_master", db.bind)
    db.close()
    return df

try:
    df = get_industry_df()
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### 현재 업종")
        large_cats1 = sorted([c for c in df['large_cat_name'].unique() if c])
        large_cat1 = st.selectbox("대분류명 (현재)", options=large_cats1) if large_cats1 else None
        
        medium_cats1 = sorted([c for c in df[df['large_cat_name'] == large_cat1]['medium_cat_name'].unique() if c]) if large_cat1 else []
        medium_cat1 = st.selectbox("중분류명 (현재)", options=medium_cats1) if medium_cats1 else None
        
        small_cats1 = sorted([c for c in df[(df['large_cat_name'] == large_cat1) & (df['medium_cat_name'] == medium_cat1)]['small_cat_name'].unique() if c]) if medium_cat1 else []
        current_biz = st.selectbox("소분류명 (현재)", options=small_cats1) if small_cats1 else "알 수 없음"

    with col2:
        st.markdown("#### 전환 희망 업종")
        large_cats2 = sorted([c for c in df['large_cat_name'].unique() if c])
        default_large_idx = large_cats2.index(large_cat1) if large_cat1 in large_cats2 else 0
        large_cat2 = st.selectbox("대분류명 (희망)", options=large_cats2, index=default_large_idx) if large_cats2 else None
        
        medium_cats2 = sorted([c for c in df[df['large_cat_name'] == large_cat2]['medium_cat_name'].unique() if c]) if large_cat2 else []
        default_medium_idx = medium_cats2.index(medium_cat1) if medium_cat1 in medium_cats2 else 0
        medium_cat2 = st.selectbox("중분류명 (희망)", options=medium_cats2, index=default_medium_idx) if medium_cats2 else None
        
        small_cats2 = sorted([c for c in df[(df['large_cat_name'] == large_cat2) & (df['medium_cat_name'] == medium_cat2)]['small_cat_name'].unique() if c]) if medium_cat2 else []
        target_biz = st.selectbox("소분류명 (희망)", options=small_cats2) if small_cats2 else "알 수 없음"

except Exception as e:
    st.error(f"데이터베이스 연결 오류 또는 테이블이 없습니다. 에러: {e}")
    current_biz, target_biz = "카페", "치킨전문점"

st.markdown("---")
investment = st.number_input("가용 투자 예산 (만원)", min_value=0, value=5000, step=100)

# 분석 로직 연동
results = compare_industries(current_biz, target_biz, investment)

st.markdown("---")

# 2. 전문적 연출: 기대 수익 계산식
st.subheader("기대 수익률(ROI) 및 핵심 지표 분석")
st.latex(r"ROI = \frac{\text{Expected Annual Profit}}{\text{Total Investment}} \times 100")

mcol1, mcol2, mcol3 = st.columns(3)
with mcol1:
    st.metric(label="예상 초기 세팅 비용", value=f"{results['target_setup_cost']:,.0f} 만원")
with mcol2:
    st.metric(
        label="월별 예상 추가 수익 (기존 대비)", 
        value=f"{results['additional_profit']:,.1f} 만원", 
        delta=f"{results['additional_profit']:,.1f} 만원"
    )
with mcol3:
    import math
    bep_val = results['payback_months']
    bep_text = "측정 불가 (수익 없음)" if math.isinf(bep_val) else f"{bep_val:.1f} 개월"
    st.metric(label="예상 투자금 회수 기간(BEP)", value=bep_text)

# 페이지 중간 광고
ad_space()
st.markdown("---")

# 3. 시각화 섹션
st.subheader("상세 지표 비교 및 현금흐름 흐름도")

chart_col1, chart_col2 = st.columns(2)

with chart_col1:
    st.write("#### 📈 매출 및 순이익 비교 (현재 vs 전환)")
    # Grouped Bar Chart 데이터 구성
    bar_data = pd.DataFrame({
        "업종": [f"현재({current_biz})", f"현재({current_biz})", f"전환({target_biz})", f"전환({target_biz})"],
        "지표": ["월 평균 매출", "월 순이익", "월 평균 매출", "월 순이익"],
        "금액(만원)": [
            results["current_revenue"], results["current_profit"],
            results["target_revenue"], results["target_profit"]
        ]
    })
    
    fig_bar = px.bar(
        bar_data, 
        x="업종", 
        y="금액(만원)", 
        color="지표", 
        barmode="group",
        text_auto=".0f",
        color_discrete_sequence=["#1f77b4", "#ff7f0e"]
    )
    fig_bar.update_layout(yaxis_title="금액 (만원)", legend_title_text="항목")
    st.plotly_chart(fig_bar, use_container_width=True)

with chart_col2:
    st.write("#### 🚀 누적 현금흐름 및 BEP 시뮬레이션")
    # 투자금 회수 기간 이후 12개월까지 시뮬레이션
    import math
    if math.isinf(results["payback_months"]):
        max_months = 120
    else:
        max_months = int(results["payback_months"]) + 12
        if max_months > 120:  # 무한대나 너무 긴 기간 방지
            max_months = 120
            
    months = list(range(0, max_months + 1))
    
    # 0개월차에는 세팅 비용만큼 마이너스, 이후 매월 타겟 순이익 누적
    cash_flow = [-results["target_setup_cost"] + (m * results["target_profit"]) for m in months]
    
    line_data = pd.DataFrame({
        "경과 개월 수": months,
        "누적 현금흐름(만원)": cash_flow
    })
    
    fig_line = px.line(
        line_data, 
        x="경과 개월 수", 
        y="누적 현금흐름(만원)", 
        markers=True,
        color_discrete_sequence=["#2ca02c"]
    )
    
    # BEP 지점 수평/수직선 강조
    fig_line.add_hline(y=0, line_dash="dash", line_color="red", annotation_text="BEP (손익분기점)", annotation_position="bottom right")
    if results['payback_months'] < 120:
        fig_line.add_vline(x=results["payback_months"], line_dash="dash", line_color="gray", opacity=0.5)
        
    fig_line.update_layout(yaxis_title="누적 순수익 (만원)")
    st.plotly_chart(fig_line, use_container_width=True)

# 페이지 하단 광고
ad_space()
