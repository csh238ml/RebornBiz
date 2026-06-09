import streamlit as st
import streamlit.components.v1 as components

def set_custom_sidebar():
    # 1. 사이드바 디자인을 위한 CSS
    st.sidebar.markdown("""
    <style>
        [data-testid="stSidebar"] { background-color: #1e293b !important; }
        
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
        /* 🌟 모바일 사이드바 열기(햄버거) 버튼 커스텀 (확장된 셀렉터) */
        button[data-testid="collapsedControl"] svg,
        button[data-testid="stSidebarCollapse"] svg,
        button[data-testid="stSidebarCollapseButton"] svg,
        button[class*="stSidebarCollapse"] svg {
            display: none !important;
        }

        button[data-testid="collapsedControl"]::before,
        button[data-testid="stSidebarCollapse"]::before,
        button[data-testid="stSidebarCollapseButton"]::before,
        button[class*="stSidebarCollapse"]::before {
            content: "☰" !important;
            font-size: 24px !important;
            color: #1e293b !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            transition: color 0.3s ease !important;
            width: 100% !important;
            height: 100% !important;
        }

        button[data-testid="collapsedControl"]:hover::before,
        button[data-testid="stSidebarCollapse"]:hover::before,
        button[data-testid="stSidebarCollapseButton"]:hover::before,
        button[class*="stSidebarCollapse"]:hover::before {
            color: #38bdf8 !important;
        }

        /* 🌟 우측 상단 Deploy 버튼 및 기본 메뉴 완전히 숨기기 (핀포인트 저격) */
        #MainMenu,
        .stDeployButton,
        .stAppDeployButton,
        header[data-testid="stHeader"] div[data-testid="stActionButton"] {
            visibility: hidden !important;
            display: none !important;
        }
    </style>
    <div class="custom-logo">RebornBiz</div>
    """, unsafe_allow_html=True)

    # 2. 페이지 링크 - 태그 없이 순수 텍스트만 입력
    st.sidebar.page_link("app.py", label="홈", icon="🏠")
    st.sidebar.page_link("pages/1_calculator.py", label="폐업 비용 계산기", icon="🧮")
    st.sidebar.page_link("pages/tax_cal.py", label="폐업 세금 계산기", icon="🧾")
    st.sidebar.page_link("pages/2_simulation.py", label="업종 변경 시뮬레이션", icon="📈")
    st.sidebar.page_link("pages/4_market_analysis.py", label="내 주변 상권 분석", icon="📍")
    st.sidebar.page_link("pages/3_guide.py", label="정부 지원 정책", icon="🏛️")
    
    # 하단 푸터 느낌의 약관 및 정책 링크 추가
    st.sidebar.divider()
    st.sidebar.page_link("pages/5_policy.py", label="이용약관 및 처리방침", icon="📜")


def inject_seo_tags():
    """SEO, Open Graph 메타 태그 및 애드센스 스크립트를 부모 HTML의 <head>에 동적으로 주입합니다."""
    
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
    addMetaTag('naver-site-verification', '60e370a04a68c7125d47cc27112186c48372d8b8');
    addMetaTag('google-site-verification', 'KJ_THHy7VKDvnXerQT1S5I0B2U2glszxIeS5Ge34Gvs');
    addMetaTag('og:type', 'website', true);
    addMetaTag('og:url', 'https://rebornbiz.co.kr', true);
    addMetaTag('og:title', 'RebornBiz(리본비즈) | 소상공인 폐업 및 업종 변경 시뮬레이터', true);
    addMetaTag('og:description', '폐업 비용 계산, 희망 업종 수익성 시뮬레이션, 내 주변 상권 분석부터 정부 지원 정책 가이드까지 1분 만에 무료로 확인하세요.', true);
    addMetaTag('og:image', 'https://rebornbiz.co.kr/assets/og-image.png', true);

    addMetaTag('twitter:card', 'summary_large_image');
    addMetaTag('twitter:title', 'RebornBiz(리본비즈)');
    addMetaTag('twitter:description', '소상공인 폐업 비용 및 비즈니스 전환 올인원 시뮬레이터');
    addMetaTag('twitter:image', 'https://rebornbiz.co.kr/assets/og-image.png');

    // 구글 애드센스 스크립트 주입
    if (!window.parent.document.querySelector('script[src*="adsbygoogle.js"]')) {
        let adsScript = window.parent.document.createElement('script');
        adsScript.async = true;
        adsScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4577150400116930';
        adsScript.crossOrigin = 'anonymous';
        window.parent.document.head.appendChild(adsScript);
    }
    </script>
    """
    components.html(seo_html, width=0, height=0)