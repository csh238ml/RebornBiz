import streamlit as st
import streamlit.components.v1 as components
import plotly.express as px
import sys
import os

# 모듈 폴더 경로 추가 (calculators 함수를 불러오기 위함)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.calculators import calculate_closure_cost

from modules.components import set_custom_sidebar

st.set_page_config(page_title="폐업 비용 계산기 - RebornBiz", page_icon="🧮", layout="wide")
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

# (2) Plotly 파이 차트
st.write("#### 항목별 비용 비중")
# 파이 차트에 들어갈 데이터 구성 (차감 요소 제외)
chart_data = {
    "비용 항목": ["철거비", "원상복구비", "임대료 위약금", "인건비 정산"],
    "금액": [results["철거비"], results["원상복구비"], results["임대료 위약금"], results["인건비 정산"]]
}

# 모든 금액이 0일 경우 에러 방지
if total_expense > 0:
    fig = px.pie(
        chart_data, 
        names="비용 항목", 
        values="금액", 
        hole=0.4, # 도넛 차트 형태
        color_discrete_sequence=px.colors.sequential.RdBu
    )
    fig.update_traces(textposition='inside', textinfo='percent+label')
    st.plotly_chart(fig, use_container_width=True)
else:
    st.info("비용이 발생하지 않는 조건입니다.")

st.markdown("---")

# 5. 안내 섹션
st.subheader("💡 정부 지원금 신청 안내 (희망리턴패키지)")
st.info("""
**소상공인시장진흥공단 '희망리턴패키지' 원스톱 폐업 지원**
- **지원 대상**: 폐업을 앞두고 있거나 이미 폐업한 소상공인
- **지원 내용**: 점포 철거 및 원상복구 비용 (최대 250만 원 한도) 및 사업정리 컨설팅
- **신청 자격**: 사업자등록증상 영업 기간이 60일 이상인 소상공인 등 (세부 조건은 소진공 홈페이지 참조)
- **⚠️ 주의 사항**: **철거 공사 시작 전**에 반드시 사전 신청 및 승인이 필요합니다. (공사 후 신청 시 지원금 수령 불가)
""")

# 6. 페이지 최하단 광고
ad_space()
