import streamlit as st
import streamlit.components.v1 as components
from modules.database import init_db
from modules.components import set_custom_sidebar

# 1. 페이지 설정 (최상단)
st.set_page_config(page_title="RebornBiz", page_icon="🏢", layout="wide", initial_sidebar_state="auto")

# 2. DB 초기화
init_db()

# 3. 네이버 애널리틱스 & SPA 라우팅 가로채기 (핵심)
components.html("""
    <script type="text/javascript" src="//wcs.pstatic.net/wcslog.js"></script>
    <script type="text/javascript">
        // [1] 네이버 애널리틱스 (iframe 내부 실행으로 샌드박스 에러 원천 차단)
        if(!window.wcs_add) window.wcs_add = {};
        window.wcs_add["wa"] = "cb815cb694e138";
        if(window.wcs) { window.wcs_do(); }

        // [2] 404 에러 원천 차단기 (사이드바 원격 클릭 로직)
        // 중복 실행을 방지하기 위해 부모 창에 플래그 설정
        if (!window.parent.customRouterInitialized) {
            window.parent.customRouterInitialized = true;
            
            window.parent.document.addEventListener('click', function(e) {
                const btn = e.target.closest('.custom-btn');
                if (btn && btn.hasAttribute('data-target')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const targetKeyword = btn.getAttribute('data-target');
                    
                    // 사이드바에 있는 안전한 Streamlit 순정 링크를 찾아 대신 클릭합니다.
                    const links = window.parent.document.querySelectorAll('a');
                    for (let i = 0; i < links.length; i++) {
                        if (links[i].href && links[i].href.includes(targetKeyword)) {
                            links[i].click(); 
                            break;
                        }
                    }
                }
            });
        }
    </script>
""", width=0, height=0)

# 4. 사이드바 메뉴 렌더링
st.markdown('<style>[data-testid="stSidebarNav"] {display: none !important;}</style>', unsafe_allow_html=True)
set_custom_sidebar()

# 5. 메인 화면 디자인 (마크다운 깨짐 방지를 위해 st.html 사용)
st.html("""
<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
    --text-muted: #64748b;
    --card-bg: #ffffff;
    --primary: #2563eb;
    --accent-1: linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%);
    --accent-2: linear-gradient(135deg, #6ee7b7 0%, #10b981 100%);
    --accent-3: linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%);
    --accent-4: linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 100%);
}

.custom-main {
    font-family: 'Pretendard', sans-serif;
    padding: 1rem 0;
    color: #1e293b;
}

.custom-header { margin-bottom: 3rem; }
.custom-header h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -1px; }
.custom-header p { color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; max-width: 700px; }
.custom-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }

.custom-card {
    background: var(--card-bg); border-radius: 1.25rem; overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex; flex-direction: column; border: 1px solid rgba(0,0,0,0.05);
}
.custom-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-icon-box { height: 160px; display: flex; align-items: center; justify-content: center; font-size: 4rem; }
.card-content { padding: 1.75rem; flex: 1; display: flex; flex-direction: column; }
.card-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700; margin-bottom: 1rem; width: fit-content; }
.custom-card h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 0.75rem; }
.custom-card p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; flex: 1; }

.custom-btn {
    background-color: var(--primary) !important; color: white !important;
    padding: 0.8rem; border-radius: 0.75rem; text-align: center;
    font-weight: 600; font-size: 0.9rem; transition: background 0.2s;
    display: block; border: none; width: 100%; cursor: pointer; font-family: 'Pretendard', sans-serif;
}
.custom-btn:hover { background-color: #1d4ed8 !important; }

.diag .card-icon-box { background: var(--accent-1); } .diag .card-badge { background: #fef3c7; color: #92400e; }
.simul .card-icon-box { background: var(--accent-2); } .simul .card-badge { background: #d1fae5; color: #065f46; }
.area .card-icon-box { background: var(--accent-3); } .area .card-badge { background: #dbeafe; color: #1e40af; }
.gov .card-icon-box { background: var(--accent-4); } .gov .card-badge { background: #ede9fe; color: #5b21b6; }
</style>

<div class="custom-main">
    <div class="custom-header">
        <h1>소상공인 지원 플랫폼</h1>
        <p>여러분의 새로운 시작과 도약을 체계적이고 안전하게 돕기 위해 마련된 종합 플랫폼입니다.</p>
    </div>

    <div class="custom-grid">
        <div class="custom-card diag">
            <div class="card-icon-box">🧮</div>
            <div class="card-content">
                <span class="card-badge">진단</span>
                <h3>폐업 비용 계산기</h3>
                <p>철거비, 위약금 등 사업 정리 시 발생하는 각종 예상 비용을 데이터로 정확히 산출합니다.</p>
                <button class="custom-btn" data-target="calculator">비용 계산하기</button>
            </div>
        </div>

        <div class="custom-card simul">
            <div class="card-icon-box">📈</div>
            <div class="card-content">
                <span class="card-badge">분석</span>
                <h3>업종 변경 시뮬레이션</h3>
                <p>새로운 업종 전환 시의 예상 리스크와 수익성을 분석하여 안전한 도전을 지원합니다.</p>
                <button class="custom-btn" data-target="simulation">시뮬레이션 시작</button>
            </div>
        </div>

        <div class="custom-card area">
            <div class="card-icon-box">📍</div>
            <div class="card-content">
                <span class="card-badge">상권</span>
                <h3>내 주변 상권 분석</h3>
                <p>현재 위치 기반 상권 밀집도와 업종 분포 파악하여 최적의 입지 전략을 제시합니다.</p>
                <button class="custom-btn" data-target="market_analysis">상권 분석하기</button>
            </div>
        </div>

        <div class="custom-card gov">
            <div class="card-icon-box">🏛️</div>
            <div class="card-content">
                <span class="card-badge">가이드</span>
                <h3>정부 지원 정책</h3>
                <p>재취업, 재창업 등 소상공인에게 꼭 필요한 정부 지원금을 한눈에 확인하고 신청하세요.</p>
                <button class="custom-btn" data-target="guide">지원 정책 확인</button>
            </div>
        </div>
    </div>
</div>
""")

st.markdown("<br><br><hr>", unsafe_allow_html=True)

# 6. 하단 광고 영역
st.html("""
    <div style="
        display: flex; justify-content: center; align-items: center; 
        height: 150px; border: 2px dashed #cccccc; border-radius: 10px; 
        background-color: #f8f9fa; color: #adb5bd; font-family: 'Segoe UI', Tahoma, sans-serif;
        margin-top: 10px;">
        <h3>AD Space</h3>
    </div>
""")