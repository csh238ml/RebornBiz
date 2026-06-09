import streamlit as st
import datetime
import sys
import os
import locale

# 시스템 로케일을 한국어로 강제 설정 (달력 한글화 등)
try:
    locale.setlocale(locale.LC_TIME, 'ko_KR.UTF-8') # 리눅스/맥 환경
except locale.Error:
    try:
        locale.setlocale(locale.LC_TIME, 'Korean_Korea.949') # 윈도우 로컬 환경
    except locale.Error:
        pass

st.set_page_config(page_title="폐업 세금 자동 계산기 | RebornBiz", page_icon="🧾", layout="wide", initial_sidebar_state="auto")

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.components import set_custom_sidebar, inject_seo_tags
from modules.database import log_page_access

set_custom_sidebar()
inject_seo_tags()
log_page_access("폐업 세금 자동 계산기")

# 커스텀 CSS (8px 기반 시스템 및 스타일링)
st.markdown("""
    <style>
    /* 전체 페이지 배경색 */
    .stApp {
        background-color: #F8F9FA;
    }
    
    /* 8px 기반 스페이싱 시스템 */
    :root {
        --spacing-1: 8px;
        --spacing-2: 16px;
        --spacing-3: 24px;
    }
    
    /* Metric(배지) 카드 스타일 */
    [data-testid="stMetric"] {
        background-color: #FFFFFF;
        padding: var(--spacing-2);
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-left: 5px solid #4a90e2;
        border: 1px solid #E0E0E0;
        margin-bottom: var(--spacing-1);
    }
    
    /* st.container(border=True)에 대한 글로벌 카드 스타일 적용 */
    div[data-testid="stVerticalBlockBorderWrapper"] {
        background-color: #FFFFFF !important;
        border: 1px solid #E0E0E0 !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
        padding: 20px !important;
    }
    </style>
""", unsafe_allow_html=True)

st.title("🧾 폐업 세금(부가세) 자동 계산기")
st.write("폐업 시 매입세액 공제를 받은 남아있는 자산(건물, 인테리어, 비품 등)에 대해 납부해야 할 **'폐업 시 잔존재화 간주공급'** 부가가치세를 손쉽게 계산해 보세요.")

st.info("💡 **알아두세요:** 매입 당시 부가세 환급(매입세액 공제)을 받은 자산에 대해서만 계산합니다. 환급을 받지 않았거나 면세사업자인 경우 납부 의무가 없습니다.")

st.markdown("### 1. 자산 취득 및 폐업일 입력")
col1, col2 = st.columns(2)

with col1:
    acq_date = st.date_input("자산 취득일 (매입일)", datetime.date(2023, 1, 1), format="YYYY/MM/DD")

with col2:
    close_date = st.date_input("사업 폐업일", datetime.date.today(), format="YYYY/MM/DD")

st.markdown("### 2. 자산 정보 입력")
col3, col4 = st.columns(2)

with col3:
    asset_type = st.selectbox("자산 종류", ["기타 감가상각자산 (기계, 비품, 인테리어 등 상각률 25%)", "건물 및 구축물 (상각률 5%)"])

# 실시간 콤마 렌더링을 위한 세션 상태 및 콜백 설정
if 'asset_price_input' not in st.session_state:
    st.session_state.asset_price_input = "10,000,000"

def format_price():
    raw_val = st.session_state.asset_price_input
    try:
        clean_val = int(raw_val.replace(",", ""))
        st.session_state.asset_price_input = f"{clean_val:,}"
    except ValueError:
        pass

with col4:
    raw_price = st.text_input("취득가액 (공급가액 기준, 원)", key="asset_price_input", on_change=format_price)
    try:
        asset_price = int(raw_price.replace(",", ""))
    except ValueError:
        st.error("올바른 금액(숫자)을 입력해 주세요.")
        asset_price = 0

if st.button("세금 계산하기", type="primary", use_container_width=True):
    if acq_date > close_date:
        st.error("취득일이 폐업일보다 늦을 수 없습니다.")
    else:
        # 과세기간 계산 로직
        y1, m1 = acq_date.year, acq_date.month
        y2, m2 = close_date.year, close_date.month
        
        p1 = 1 if m1 <= 6 else 2
        p2 = 1 if m2 <= 6 else 2
        
        # 총 경과된 과세기간 수 = (폐업 연도 - 취득 연도) * 2 + (폐업 기수 - 취득 기수)
        passed_periods = (y2 - y1) * 2 + (p2 - p1)
        passed_periods = max(0, passed_periods)
        
        rate_per_period = 0.05 if "건물" in asset_type else 0.25
        
        total_depreciation_rate = min(1.0, passed_periods * rate_per_period)
        
        residual_value = asset_price * (1.0 - total_depreciation_rate)
        vat_to_pay = residual_value * 0.10
        
        st.divider()
        st.subheader("📊 계산 결과")
        
        with st.container(border=True):
            res_col1, res_col2, res_col3 = st.columns(3)
            with res_col1:
                st.metric("⏳ 경과된 과세기간", f"{passed_periods}기")
            with res_col2:
                st.metric("📉 총 감가상각률", f"{int(total_depreciation_rate * 100)}%")
            with res_col3:
                st.metric("💰 잔존가치 (간주공급액)", f"{int(residual_value):,}원")
                
            st.markdown("### 🚨 최종 예상 부가가치세")
            st.warning(f"예상 부가세는 약 **{int(vat_to_pay):,}**원입니다.")
            
            with st.expander("📝 상세 계산 내역 보기"):
                st.markdown(f"""
                - **취득 과세기간**: {y1}년 {p1}기
                - **폐업 과세기간**: {y2}년 {p2}기
                - **경과된 과세기간 수**: {passed_periods}기 (폐업일이 속한 기수는 산입하지 않음)
                - **적용 상각률**: {int(rate_per_period*100)}% × {passed_periods}기 = {int(total_depreciation_rate*100)}%
                - **잔존가치 계산**: {int(asset_price):,}원 × (1 - {total_depreciation_rate}) = {int(residual_value):,}원
                - **부가세 계산**: 잔존가치 {int(residual_value):,}원 × 10% = {int(vat_to_pay):,}원
                """)

# 5. 하단 광고 및 정책 (공통 컴포넌트 형식)
st.divider()
import streamlit.components.v1 as components
def ad_space(text="AD Space (Google AdSense)"):
    components.html(
        f"""
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
            margin: 0;">
            <h3>{text}</h3>
        </div>
        """,
        height=120
    )
ad_space("AD Space (Bottom Banner)")
