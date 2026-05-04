import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="RebornBiz",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 사이드바 메뉴 설정
with st.sidebar:
    st.title("메뉴")
    st.page_link("app.py", label="[홈] 메인 화면", icon="🏠")
    st.page_link("pages/1_calculator.py", label="[진단] 폐업 비용 계산기", icon="🧮")
    st.page_link("pages/2_simulation.py", label="[분석] 업종 변경 시뮬레이션", icon="📊")
    st.page_link("pages/3_guide.py", label="[가이드] 정부 지원 정책", icon="📚")

# 메인 화면
st.title("RebornBiz: 소상공인 재기 지원 솔루션")
st.write("""
**RebornBiz**에 오신 것을 환영합니다! 

소상공인 여러분의 새로운 시작과 도약을 체계적이고 안전하게 돕기 위해 마련된 종합 플랫폼입니다. 
좌측 사이드바 메뉴를 통해 다음과 같은 유용한 서비스를 이용하실 수 있습니다.

- **[진단] 폐업 비용 계산기**: 사업 정리 시 발생하는 철거비, 위약금 등 각종 예상 비용을 산출해 봅니다.
- **[분석] 업종 변경 시뮬레이션**: 새로운 업종으로 전환할 때의 예상 리스크와 수익성을 시뮬레이션합니다.
- **[가이드] 정부 지원 정책**: 소상공인 재기 및 창업과 관련된 다양한 정부 지원금을 한눈에 확인합니다.
""")

st.markdown("---")

# 하단 광고 영역 Placeholder (구글 애드센스용)
components.html(
    """
    <div style="
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 150px; 
        border: 2px dashed #cccccc; 
        border-radius: 10px; 
        background-color: #f8f9fa; 
        color: #adb5bd; 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin-top: 30px;">
        <h3>AD Space</h3>
    </div>
    """,
    height=200
)
