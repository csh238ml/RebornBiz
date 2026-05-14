import streamlit as st

def set_custom_sidebar():
    st.sidebar.markdown("""
    <style>
    /* 1. 기본 스트림릿 사이드바 메뉴 숨기기 */
    [data-testid="stSidebarNav"] {
        display: none;
    }

    /* 사이드바 전체 배경색 및 텍스트 색상 커스텀 */
    [data-testid="stSidebar"] {
        background-color: #1e293b !important;
    }

    /* 커스텀 로고 */
    .custom-logo {
        font-size: 1.5rem;
        font-weight: 800;
        margin-bottom: 2rem;
        color: #38bdf8;
        letter-spacing: -0.5px;
        padding: 0 1rem;
    }

    /* 커스텀 메뉴 리스트 */
    .custom-menu {
        list-style: none;
        padding-left: 0;
        margin: 0;
    }

    .custom-menu li {
        margin-bottom: 0.5rem;
    }

    .custom-menu li a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0.85rem 1rem;
        border-radius: 0.5rem;
        color: white !important;
        text-decoration: none !important;
        font-size: 0.95rem;
        opacity: 0.8;
        transition: 0.2s;
    }

    .custom-menu li a:hover {
        background-color: rgba(255, 255, 255, 0.1);
        opacity: 1;
    }
    </style>

    <div class="custom-logo">RebornBiz</div>
    <ul class="custom-menu">
        <li><a href="/" target="_self">🏠 <span>홈</span></a></li>
        <li><a href="/calculator" target="_self">🧮 <span>폐업 비용 계산기</span></a></li>
        <li><a href="/simulation" target="_self">📈 <span>업종 변경 시뮬레이션</span></a></li>
        <li><a href="/market_analysis" target="_self">📍 <span>내 주변 상권 분석</span></a></li>
        <li><a href="/guide" target="_self">🏛️ <span>정부 지원 정책</span></a></li>
    </ul>
    """, unsafe_allow_html=True)
