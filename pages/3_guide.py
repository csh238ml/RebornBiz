import streamlit as st
import streamlit.components.v1 as components
import sys
import os

# 1. 페이지 기본 설정
st.set_page_config(page_title="정부 지원 정책 가이드 | RebornBiz", page_icon="🏛️", layout="wide", initial_sidebar_state="auto")

# 2. 커스텀 사이드바 로드
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.components import set_custom_sidebar, inject_seo_tags

set_custom_sidebar()
inject_seo_tags()

# 🌟 광고 렌더링 함수 정의
def ad_space(text="AD Space (Google AdSense)"):
    """광고 플레이스홀더를 렌더링하는 함수"""
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

# 3. 페이지 헤더 및 소개
st.title("🏛️ [가이드] 정부 지원 정책")
st.markdown("""
폐업 예정자 및 재창업 소상공인을 위한 다양한 **정부 지원금, 컨설팅 프로그램, 세제 혜택** 등을 안내합니다.  
현재 상황에 맞는 지원 정책을 확인하고 혜택을 놓치지 마세요!
""")

st.divider()


# 4. 탭(Tabs)을 활용한 카테고리 분류
tab1, tab2, tab3 = st.tabs(["💰 정부 지원금", "👨‍💼 컨설팅 프로그램", "🧾 세제 혜택 및 법무"])

# --- 탭 1: 정부 지원금 ---
with tab1:
    st.header("정부 지원금 안내")
    
    with st.expander("1. 점포철거비 지원 (희망리턴패키지)", expanded=True):
        st.markdown("""
        * **지원 대상:** 폐업을 예정하거나 기폐업한 소상공인
        * **지원 내용:** 전용면적(평) 당 13만 원 (최대 250만 원 한도)
        * **신청 방법:** 소상공인시장진흥공단 희망리턴패키지 홈페이지 신청
        """)
        st.link_button("👉 희망리턴패키지 바로가기", "https://hope.sbiz.or.kr/")
        
    with st.expander("2. 재창업 사업화 자금 지원"):
        st.markdown("""
        * **지원 대상:** 폐업 후 재창업을 준비 중인 소상공인
        * **지원 내용:** 사업화 자금(임대료, 마케팅, 시제품 제작 등) 최대 2,000만 원 한도 차등 지원
        * **필수 조건:** 소상공인시장진흥공단의 재창업 교육 수료
        """)

# --- 탭 2: 컨설팅 프로그램 ---
with tab2:
    st.header("컨설팅 프로그램")
    
    with st.expander("1. 사업정리 컨설팅", expanded=True):
        st.markdown("""
        * **지원 내용:** 폐업 시 발생하는 세무, 부동산, 노무 등의 문제를 전문가가 1:1 방문하여 무료로 컨설팅
        * **자부담금:** 전액 무료 (정부 100% 지원)
        * **분야:** 세무, 부동산(권리금/보증금 보호), 직무/노무
        """)
        
    with st.expander("2. 업종전환·재창업 컨설팅"):
        st.markdown("""
        * **지원 내용:** 상권 분석, 아이템 검증, 마케팅 전략 등 성공적인 재창업을 위한 전문가 멘토링
        """)

# --- 탭 3: 세제 혜택 및 법무 ---
with tab3:
    st.header("세제 혜택 및 법무 가이드")
    
    with st.expander("1. 폐업 시 부가가치세 신고 가이드", expanded=True):
        st.info("폐업일이 속한 달의 다음 달 25일까지 반드시 폐업 부가가치세 확정 신고를 해야 합니다.")
        st.markdown("""
        * **잔존재화 부가세:** 판매하지 못한 재고품, 비품 등은 본인에게 공급한 것으로 보아 부가세를 납부해야 할 수 있습니다.
        * **종합소득세:** 다음 해 5월에 폐업일까지의 소득에 대해 종합소득세를 신고해야 합니다.
        """)
        st.link_button("👉 국세청 홈택스 바로가기", "https://www.hometax.go.kr/")
        
    with st.expander("2. 상가임대차 분쟁 조정 지원"):
        st.markdown("""
        * **지원 내용:** 임대료 지연, 권리금 회수 방해, 원상복구 범위 등 임대인과의 분쟁 발생 시 법률 상담 및 조정 지원
        * **신청 기관:** 대한법률구조공단 상가건물임대차 분쟁조정위원회
        """)

# 5. 하단 문의/안내 및 TODO 영역
st.divider()
st.caption("💡 **안내:** 위 정보는 정부 및 지자체의 예산 상황에 따라 조기 마감되거나 정책 내용이 변동될 수 있습니다. 반드시 해당 기관의 공식 홈페이지 공고문을 확인하시기 바랍니다.")

# 기존 TODO 주석 반영
st.caption("※ **업데이트 예정:** 향후 실시간 정책 데이터 연동 및 맞춤형 검색 기능이 추가될 예정입니다.")

# ==========================================
# 🌟 추가된 영역: 페이지 최하단 광고 배너
ad_space("AD Space (Bottom Banner)")
# ==========================================