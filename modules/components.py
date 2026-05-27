import streamlit as st

def set_custom_sidebar():
    # 1. 사이드바 디자인을 위한 CSS
    st.sidebar.markdown("""
    <style>
        [data-testid="stSidebarNav"] { display: none !important; }
        [data-testid="stSidebar"] { background-color: #1e293b !important; }
        
        .custom-logo { 
            font-size: 1.5rem; 
            font-weight: 800; 
            margin-bottom: 2rem; 
            color: #38bdf8; 
            padding: 0 1rem; 
        }

        /* 버튼 컨테이너 기본 스타일 */
        [data-testid="stPageLink-NavLink"] {
            background-color: transparent !important;
            padding: 0.85rem 1rem !important;
            border-radius: 0.5rem !important;
            margin-bottom: 0.5rem !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            border: none !important;
            text-decoration: none !important;
        }
        
        [data-testid="stPageLink-NavLink"]:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        [data-testid="stPageLink-NavLink"][data-selected="true"] {
            background-color: rgba(56, 189, 248, 0.15) !important;
        }

        /* 🌟 핵심: Streamlit이 p를 쓰든 span을 쓰든 무조건 흰색으로 강제 덮어쓰기 */
        [data-testid="stPageLink-NavLink"],
        [data-testid="stPageLink-NavLink"] p,
        [data-testid="stPageLink-NavLink"] span,
        [data-testid="stPageLink-NavLink"] * {
            color: #ffffff !important;
            font-size: 1rem !important;
        }
        
        /* 현재 선택된 메뉴의 텍스트와 아이콘은 파란색으로 하이라이트 */
        [data-testid="stPageLink-NavLink"][data-selected="true"],
        [data-testid="stPageLink-NavLink"][data-selected="true"] p,
        [data-testid="stPageLink-NavLink"][data-selected="true"] span,
        [data-testid="stPageLink-NavLink"][data-selected="true"] * {
            color: #38bdf8 !important;
            font-weight: 600 !important;
        }
    </style>
    <div class="custom-logo">RebornBiz</div>
    """, unsafe_allow_html=True)

    # 2. 페이지 링크 - 태그 없이 순수 텍스트만 입력
    st.sidebar.page_link("app.py", label="홈", icon="🏠")
    st.sidebar.page_link("pages/1_calculator.py", label="폐업 비용 계산기", icon="🧮")
    st.sidebar.page_link("pages/2_simulation.py", label="업종 변경 시뮬레이션", icon="📈")
    st.sidebar.page_link("pages/4_market_analysis.py", label="내 주변 상권 분석", icon="📍")
    st.sidebar.page_link("pages/3_guide.py", label="정부 지원 정책", icon="🏛️")