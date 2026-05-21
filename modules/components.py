import streamlit as st

def set_custom_sidebar():
    # 1. 사이드바 디자인을 위한 CSS 주입 (HTML 레이아웃은 완전 배제)
    st.sidebar.markdown("""
    <style>
        /* 기본 네비게이션 메뉴 완전히 숨기기 */
        [data-testid="stSidebarNav"] { 
            display: none !important; 
        }
        
        /* 사이드바 전체 다크 배경색 강제 적용 */
        [data-testid="stSidebar"] { 
            background-color: #1e293b !important; 
        }
        
        /* 커스텀 로고 스타일링 */
        .custom-logo { 
            font-size: 1.5rem; 
            font-weight: 800; 
            margin-bottom: 2rem; 
            color: #38bdf8; 
            letter-spacing: -0.5px; 
            padding: 0 1rem; 
        }

        /* 🌟 핵심: Streamlit 순정 page_link 버튼을 커스텀 디자인으로 덮어쓰기 */
        [data-testid="stPageLink-NavLink"] {
            background-color: transparent !important;
            padding: 0.85rem 1rem !important;
            border-radius: 0.5rem !important;
            color: white !important;
            transition: all 0.2s ease !important;
            margin-bottom: 0.5rem !important;
            text-decoration: none !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            border: none !important;
        }
        
        /* 마우스 커서 호버 시 배경 흐리게 처리 */
        [data-testid="stPageLink-NavLink"]:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
            opacity: 1 !important;
        }
        
        /* 현재 활성화된 페이지 메뉴 하이라이트 */
        [data-testid="stPageLink-NavLink"][data-selected="true"] {
            background-color: rgba(56, 189, 248, 0.15) !important;
            color: #38bdf8 !important;
            font-weight: 600 !important;
        }
        
        /* 내부 텍스트 및 아이콘 색상 고정 */
        [data-testid="stPageLink-NavLink"] p {
            color: white !important;
            margin: 0 !important;
        }
        [data-testid="stPageLink-NavLink"][data-selected="true"] p {
            color: #38bdf8 !important;
        }
    </style>
    
    <div class="custom-logo">RebornBiz</div>
    """, unsafe_allow_html=True)

    # 2. Streamlit 순정 단일 페이지 라우팅 적용
    # 💡 이렇게 호출하면 내부 SPA 시스템이 작동하여 새로고침 없이 화면 전환이 이루어지며,
    #    모바일 환경에서는 메뉴 클릭 시 사이드바가 자동으로 연동되어 부드럽게 닫힙니다.
    st.sidebar.page_link("app.py", label="홈", icon="🏠")
    st.sidebar.page_link("pages/1_calculator.py", label="폐업 비용 계산기", icon="🧮")
    st.sidebar.page_link("pages/2_simulation.py", label="업종 변경 시뮬레이션", icon="📈")
    st.sidebar.page_link("pages/4_market_analysis.py", label="내 주변 상권 분석", icon="📍")
    st.sidebar.page_link("pages/3_guide.py", label="정부 지원 정책", icon="🏛️")