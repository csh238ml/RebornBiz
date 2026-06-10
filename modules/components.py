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
        /* 🌟 기존 아이콘(SVG, 텍스트, div 등) 완벽 제거 (모든 내부 자식 요소 숨김) */
        button[data-testid="collapsedControl"] *,
        button[data-testid="stSidebarCollapse"] *,
        button[data-testid="stSidebarCollapseButton"] *,
        button[class*="stSidebarCollapse"] *,
        button[data-testid="baseButton-headerNoPadding"] *,
        button[kind="headerNoPadding"] * {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }

        button[data-testid="collapsedControl"]::before,
        button[data-testid="stSidebarCollapse"]::before,
        button[data-testid="stSidebarCollapseButton"]::before,
        button[class*="stSidebarCollapse"]::before,
        button[data-testid="baseButton-headerNoPadding"]::before,
        button[kind="headerNoPadding"]::before {
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
        button[class*="stSidebarCollapse"]:hover::before,
        button[data-testid="baseButton-headerNoPadding"]:hover::before,
        button[kind="headerNoPadding"]:hover::before {
            color: #38bdf8 !important;
        }

        /* 🌟 모바일 햄버거 버튼 강제 노출 및 고정 (최상위 Z-index) */
        button[data-testid="collapsedControl"],
        button[data-testid="stSidebarCollapse"],
        button[data-testid="stSidebarCollapseButton"],
        button[class*="stSidebarCollapse"],
        button[data-testid="baseButton-headerNoPadding"],
        button[kind="headerNoPadding"] {
            position: fixed !important;
            top: 8px !important;
            left: 8px !important;
            z-index: 999999 !important;
            background: transparent !important;
            color: transparent !important; /* 내부 텍스트 아이콘 강제 투명화 */
            border: none !important;
            visibility: visible !important;
            display: block !important;
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


    # 🌟 모바일 사이드바 닫기 - 궁극의 해결책: 부모 창 직접 주입 (1회성 버그 영구 해결)
    components.html("""
    <script>
        const parentWindow = window.parent;
        const parentDoc = parentWindow.document;

        // SPA 라우팅 시 iframe이 파괴되면서 이벤트 리스너가 죽는 현상을 막기 위해,
        // 부모 창(Streamlit 본체)의 head에 스크립트를 직접 주입하여 영구적으로 살아있게 만듭니다.
        if (!parentWindow._sidebarAutoCloseScriptInjected) {
            
            const script = parentDoc.createElement('script');
            script.type = 'text/javascript';
            script.innerHTML = `
                document.addEventListener('click', function(e) {
                    const navLink = e.target.closest('[data-testid="stPageLink-NavLink"]');
                    
                    if (navLink && window.innerWidth <= 992) {
                        
                        // 사이드바가 현재 열려있는지 확인 (aria-expanded 속성)
                        const sidebar = document.querySelector('[data-testid="stSidebar"]');
                        const isSidebarOpen = sidebar && sidebar.getAttribute('aria-expanded') === 'true';
                        
                        // 사이드바가 이미 닫혀있다면(예: 홈 화면의 카드 버튼 클릭 시), 개입하지 않고 즉시 정상 이동 허용
                        if (!isSidebarOpen) {
                            return;
                        }
                        
                        // 스크립트가 수동으로 발생시킨 클릭이면 정상 라우팅 허용
                        if (navLink.dataset.autoNavigating === "true") {
                            return;
                        }
                        
                        // 1. 사이드바가 열려있을 때만 라우팅 즉시 차단
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // 2. 모바일 사이드바 닫기 버튼 물리적 클릭
                        const closeBtn = document.querySelector('[data-testid="stSidebarHeader"] button, button[kind="headerNoPadding"], button[data-testid="baseButton-headerNoPadding"]');
                        if (closeBtn) {
                            closeBtn.click();
                        } else {
                            const x = window.innerWidth - 10;
                            const y = window.innerHeight / 2;
                            const backdrop = document.elementFromPoint(x, y);
                            if (backdrop && backdrop.tagName === 'DIV') {
                                backdrop.click();
                            }
                        }

                        // 3. 애니메이션 및 상태 저장 대기 후 지연 이동
                        navLink.dataset.autoNavigating = "true";
                        setTimeout(() => {
                            navLink.click();
                            
                            setTimeout(() => {
                                navLink.dataset.autoNavigating = "";
                            }, 500);
                        }, 300);
                    }
                }, true); // 캡처링 단계에서 최우선 실행
            `;
            
            parentDoc.head.appendChild(script);
            parentWindow._sidebarAutoCloseScriptInjected = true;
        }
    </script>
    """, width=0, height=0)

    # 2. 페이지 링크 - 태그 없이 순수 텍스트만 입력
    st.sidebar.page_link("app.py", label="홈", icon="🏠")
    st.sidebar.page_link("pages/1_calculator.py", label="폐업 비용 계산기", icon="🧮")
    st.sidebar.page_link("pages/tax_cal.py", label="폐업 세금 계산기", icon="🧾")
    st.sidebar.page_link("pages/2_simulation.py", label="업종 변경 시뮬레이션", icon="📈")
    st.sidebar.page_link("pages/4_market_analysis.py", label="내 주변 상권 분석", icon="📍")
    st.sidebar.page_link("pages/3_guide.py", label="정부 지원 정책", icon="🏛️")
    



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

def inject_global_css():
    """모든 페이지에 공통 적용되는 핵심 디자인 테마(배경, 탭, 카드, 메뉴 숨김) 주입"""
    st.markdown("""<style>
/* 전체 앱 배경 설정 */
.stApp {
background-color: #F8FAFC !important;
}

/* 탭 전체 배경(스위치 트랙 형태) */
.stTabs [data-baseweb="tab-list"] {
background-color: #f1f3f5;
border-radius: 12px;
padding: 8px;
display: flex;
justify-content: space-between;
gap: 0;
}

/* 개별 탭 버튼 (균등 분할) */
.stTabs [data-baseweb="tab"] {
flex: 1;
display: flex;
justify-content: center;
align-items: center;
height: 50px;
border-radius: 8px;
margin: 0 4px;
font-size: 1.15rem !important;
font-weight: 700 !important;
color: #868e96;
background-color: transparent;
border: none !important;
}

/* 선택된(활성화) 탭 스타일 (팝업되는 입체적인 스위치) */
.stTabs [aria-selected="true"] {
background-color: #ffffff !important;
color: #1E3A8A !important;
box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* 하단 기본 밑줄 및 보더 요소 완전히 숨김 */
.stTabs [data-baseweb="tab-highlight"],
.stTabs [data-baseweb="tab-border"] {
display: none !important;
}

/* 우측 상단 Deploy 버튼 및 기본 메뉴 완전히 숨기기 */
#MainMenu,
.stDeployButton,
.stAppDeployButton,
header[data-testid="stHeader"] div[data-testid="stActionButton"] {
visibility: hidden !important;
display: none !important;
}

/* 재사용 가능한 아싸지원사업 스타일 통합 카드 클래스 */
.reborn-card, .reborn-card-marker + div {
background-color: #ffffff !important;
border: 1px solid #e2e8f0 !important;
border-radius: 16px !important;
box-shadow: 0 4px 20px rgba(30, 58, 138, 0.02) !important;
padding: 32px 24px !important;
margin-bottom: 24px !important;
}
</style>""", unsafe_allow_html=True)

def render_footer():
    """앱 전체 하단에 노출되는 공통 Footer 컴포넌트"""
    st.markdown("""
<hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 60px; margin-bottom: 24px;">
<div style="color: #94a3b8; font-size: 13px; line-height: 1.6; font-family: 'Pretendard', sans-serif; padding-bottom: 40px;">
    <strong style="color: #64748b; font-size: 14px; display: block; margin-bottom: 8px;">면책 고지</strong>
    RebornBiz는 공개된 정부·공공 지원사업 공고 및 상권 데이터를 사장님이 이해하기 쉬운 형태로 재구성한 참고용 정보 사이트입니다. 최종 판단 및 신청은 반드시 각 공고의 원문과 발행 기관 안내에 따라 주세요. 공고 조건·금액·기한은 사전 고지 없이 변경될 수 있습니다.
    <br><br>
    <div style="display: flex; gap: 16px; font-weight: 600; color: #64748b; margin-bottom: 12px; flex-wrap: wrap;">
        <a href="/" target="_self" style="color: inherit; text-decoration: none;">사이트 소개</a>
        <span>·</span>
        <a href="/policy" target="_self" style="color: inherit; text-decoration: none;">개인정보처리방침</a>
        <span>·</span>
        <a href="/policy" target="_self" style="color: inherit; text-decoration: none;">이용약관</a>
    </div>
    © 2026 RebornBiz (rebornbiz.co.kr) · All Rights Reserved.<br>
    본 사이트의 쉬운 말 요약·자격 체크리스트·데이터 가공 문구는 저작물입니다. 무단 복제·재배포·스크래핑 금지.
</div>
    """, unsafe_allow_html=True)