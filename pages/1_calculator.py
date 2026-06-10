import streamlit as st
st.set_page_config(page_title="폐업 비용 계산기 | RebornBiz", page_icon="🧮", layout="wide", initial_sidebar_state="auto")

import streamlit.components.v1 as components
import sys
import os

# 모듈 폴더 경로 추가 (calculators 함수를 불러오기 위함)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.calculators import calculate_closure_cost
from modules.components import set_custom_sidebar, inject_seo_tags, inject_global_css, render_footer
from modules.database import log_page_access

set_custom_sidebar()
inject_seo_tags()
inject_global_css()

# 페이지 접속 로그 기록
log_page_access("폐업 비용 계산기")

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
            margin: 0;">
            <h3>AD Space (Google AdSense)</h3>
        </div>
        """,
        height=120
    )


st.title("폐업 비용 계산기 🧮")
st.write("사업장 철거, 임대차 계약 위약금, 인건비 정산 등 폐업 시 발생하는 예상 비용을 계산해 보세요.")
st.markdown("---")

# 2. 입력 섹션
st.subheader("매장 정보 입력")
# 가로로 나란히 배치하기 위해 columns 활용
col1, col2, col3, col4 = st.columns(4)

with col1:
    area_pyeong = st.number_input("매장 평수(평)", min_value=1.0, value=15.0, step=1.0)
with col2:
    monthly_rent_manwon = st.number_input("월 임대료(만원)", min_value=0, value=150, step=10)
with col3:
    remaining_months = st.number_input("남은 계약 기간(개월)", min_value=0, value=6, step=1)
with col4:
    num_employees = st.number_input("직원 수(명)", min_value=0, value=1, step=1)

# 3. 로직 연동
# 만원 단위의 임대료를 원 단위로 변환하여 함수 호출
monthly_rent_won = monthly_rent_manwon * 10_000
results = calculate_closure_cost(area_pyeong, monthly_rent_won, remaining_months, num_employees)

# 총 발생 비용 (정부 지원금 차감 전)
total_expense = results["철거비"] + results["원상복구비"] + results["임대료 위약금"] + results["인건비 정산"]
final_cost = results["최종 예상 합계"]
gov_support = results["정부 지원금 (차감)"]

st.markdown("---")

# 4. 시각화 섹션
st.subheader("예상 비용 분석 결과")

# (1) Metric 시각화
mcol1, mcol2, mcol3 = st.columns(3)
with mcol1:
    st.metric(label="총 예상 비용 (지원금 적용 전)", value=f"{total_expense:,.0f} 원")
with mcol2:
    st.metric(label="정부 지원금 (예상 차감액)", value=f"{gov_support:,.0f} 원", delta=f"-{gov_support:,.0f} 원", delta_color="inverse")
with mcol3:
    st.metric(label="정부 지원금 적용 후 실부담액", value=f"{final_cost:,.0f} 원")

import pandas as pd

# (2) 상세 비용 명세서 및 체크리스트
st.markdown("#### 📝 항목별 상세 비용 명세서")
breakdown_data = [
    {"항목": "임대료 위약금", "예상 금액(원)": f"{results['임대료 위약금']:,}", "산출 근거": "월 임대료 × 남은 계약 기간"},
    {"항목": "철거비", "예상 금액(원)": f"{results['철거비']:,}", "산출 근거": "평당 약 15~20만 원 기준"},
    {"항목": "원상복구비", "예상 금액(원)": f"{results['원상복구비']:,}", "산출 근거": "평당 약 10~15만 원 기준"},
    {"항목": "인건비 정산", "예상 금액(원)": f"{results['인건비 정산']:,}", "산출 근거": "직원 수에 따른 해고수당 및 퇴직금 추정"},
]
df_breakdown = pd.DataFrame(breakdown_data)
st.dataframe(df_breakdown, hide_index=True, use_container_width=True)

st.markdown("<br>", unsafe_allow_html=True)
st.markdown("#### ✅ 폐업 필수 체크리스트 타임라인")
st.markdown("""
<div class="reborn-card" style="margin-top: 10px;">
    <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <b style="color: #1e293b; font-size: 1.05rem;">1. 임대차 계약 해지 통보</b><br>
            <span style="color: #64748b; font-size: 0.95rem; line-height: 1.5; display: inline-block; margin-top: 4px;">최소 1~3개월 전 임대인에게 내용증명 또는 서면으로 해지 의사를 명확히 통보해야 위약금을 최소화할 수 있습니다.</span>
        </div>
        <div style="padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #10b981;">
            <b style="color: #1e293b; font-size: 1.05rem;">2. 직원 해고 통보 및 4대 보험 정산</b><br>
            <span style="color: #64748b; font-size: 0.95rem; line-height: 1.5; display: inline-block; margin-top: 4px;">30일 전 해고 예고를 하지 않으면 해고예고수당이 발생합니다. 퇴직금 및 4대 보험 상실 신고를 신속히 처리하세요.</span>
        </div>
        <div style="padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <b style="color: #1e293b; font-size: 1.05rem;">3. 철거 및 원상복구 진행 (지원금 신청)</b><br>
            <span style="color: #64748b; font-size: 0.95rem; line-height: 1.5; display: inline-block; margin-top: 4px;">공사 시작 전에 반드시 '희망리턴패키지' 원상복구 지원금을 신청하여 최대 250만 원의 실비를 지원받으세요.</span>
        </div>
        <div style="padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #ef4444;">
            <b style="color: #1e293b; font-size: 1.05rem;">4. 세무서 폐업 신고 및 부가세 납부</b><br>
            <span style="color: #64748b; font-size: 0.95rem; line-height: 1.5; display: inline-block; margin-top: 4px;">폐업일 기준 다음 달 25일까지 부가가치세(폐업 시 잔존재화 포함)를 신고하고 납부해야 가산세를 피할 수 있습니다.</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("---")

# 5. 안내 섹션
st.html("""
<div style="background-color: #eff6ff; border-radius: 12px; padding: 24px; margin-top: 32px; border: 1px solid #bfdbfe; font-family: 'Pretendard', sans-serif;">
    <h4 style="color: #1E3A8A; margin-top: 0; margin-bottom: 12px; font-weight: bold; font-size: 18px;">💡 정부 지원금 신청 안내 (희망리턴패키지)</h4>
    
    <div style="font-size: 14px; color: #334155; line-height: 1.6;">
        <strong style="color: #1E3A8A;">
            <a href="https://hope.sbiz.or.kr" target="_blank" style="text-decoration: none; color: #1E3A8A;">소상공인시장진흥공단 '희망리턴패키지' 원스톱 폐업 지원</a>
        </strong>
        <ul style="margin-top: 8px; margin-bottom: 20px; padding-left: 20px;">
            <li><strong>지원 대상:</strong> 폐업을 앞두고 있거나 이미 폐업한 소상공인</li>
            <li><strong>지원 내용:</strong> 점포 철거 및 원상복구 비용 (최대 250만 원 한도) 및 사업정리 컨설팅</li>
            <li><strong>신청 자격:</strong> 사업자등록증상 영업 기간이 60일 이상인 소상공인 등 <br>(세부 조건은 <a href="https://hope.sbiz.or.kr" target="_blank" style="color: #007bff; text-decoration: underline; font-weight: bold;">소진공 홈페이지 참조</a>)</li>
            <li style="color: #ef4444; font-weight: 700; margin-top: 4px;">⚠️ 주의 사항: 철거 공사 시작 전에 반드시 사전 신청 및 승인이 필요합니다. (공사 후 신청 시 지원금 수령 불가)</li>
        </ul>
    </div>
    
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="https://hope.sbiz.or.kr" target="_blank" style="display: inline-block; background-color: #1E3A8A; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: bold; text-align: center; transition: all 0.2s;">
            희망리턴패키지 상세 보기 ↗
        </a>
        <a href="https://www.sbiz24.kr" target="_blank" style="display: inline-block; background-color: #ffffff; color: #1E3A8A; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: bold; text-align: center; border: 1px solid #1E3A8A; transition: all 0.2s;">
            점포철거비 공식 신청 (소상공인24) ↗
        </a>
    </div>
</div>
""")

# 6. 페이지 최하단 광고
ad_space()

# 7. 푸터 적용
render_footer()
