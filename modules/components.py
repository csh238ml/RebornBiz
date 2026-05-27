import streamlit as st

def set_custom_sidebar():
    # 1. 사이드바 디자인을 위한 CSS
    st.sidebar.markdown("""
    <style>
        [data-testid="stSidebarNav"] { display: none !important; }
        [data-testid="stSidebar"] { background-color: #1e293b !important; }
        
        /* 1. 상단 기본 헤더 제거 (글자 가림 방지) */
        header[data-testid="stHeader"] {
            display: none !important;
        }

        /* 2. 모든 페이지 메인 컨테이너 상단 여백 통일 */
        .block-container {
            padding-top: 3rem !important; 
            padding-bottom: 3rem !important;
        }

        /* 3. 제목 태그 자체의 불필요한 기본 여백 제거 */
        div[data-testid="stVerticalBlock"] > div:first-child {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }

        /* 🌟 모든 페이지의 메인 타이틀(h1) 크기와 굵기를 강제 통일 */
        .block-container h1, 
        div[data-testid="stHeadingWithActionElements"] h1,
        div[data-testid="stMarkdownContainer"] h1 {
            font-size: 2.2rem !important;
            font-weight: 700 !important;
            line-height: 1.3 !important;
        }
        
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

def inject_seo_tags():
    """SEO 및 Open Graph 메타 태그를 부모 HTML의 <head>에 동적으로 주입합니다."""
    import streamlit.components.v1 as components
    
    seo_html = """
    <script>
    function addMetaTag(name, content, isProperty=false) {
        let attr = isProperty ? 'property' : 'name';
        let meta = window.parent.document.querySelector(`meta[${attr}="${name}"]`);
        if (!meta) {
            meta = window.parent.document.createElement('meta');
            meta.setAttribute(attr, name);
            window.parent.document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }

    addMetaTag('description', '소상공인의 안전한 폐업과 성공적인 재창업을 돕습니다. 폐업 비용 계산, 상권 분석, 정부 지원 정책을 한 번에 확인하세요.');
    addMetaTag('keywords', '소상공인, 폐업 비용 계산기, 업종 변경, 상권 분석, 희망리턴패키지, 재창업, RebornBiz');
    addMetaTag('og:title', 'RebornBiz | 소상공인 폐업 및 재창업 지원 플랫폼', true);
    addMetaTag('og:description', '소상공인의 안전한 폐업과 성공적인 재창업을 돕습니다. 폐업 비용 계산, 상권 분석, 정부 지원 정책을 한 번에 확인하세요.', true);
    addMetaTag('og:type', 'website', true);
    </script>
    """
    components.html(seo_html, width=0, height=0)