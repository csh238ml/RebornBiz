import streamlit as st
import streamlit.components.v1 as components
from modules.database import init_db

# 앱 실행 시 DB 연결 테스트 및 테이블 자동 생성
init_db()

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
    st.page_link("pages/4_market_analysis.py", label="[상권] 내 주변 상권 분석", icon="🗺️")
    st.page_link("pages/3_guide.py", label="[가이드] 정부 지원 정책", icon="📚")

# 메인 화면 디자인 (제공된 HTML/CSS 적용)
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

.custom-header {
    margin-bottom: 3rem;
}

.custom-header h1 {
    font-size: 2.25rem;
    font-weight: 800;
    margin-bottom: 1rem;
    letter-spacing: -1px;
}

.custom-header p {
    color: var(--text-muted);
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 700px;
}

.custom-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
}

.custom-card {
    background: var(--card-bg);
    border-radius: 1.25rem;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0,0,0,0.05);
}

.custom-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-icon-box {
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
}

.card-content {
    padding: 1.75rem;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 700;
    margin-bottom: 1rem;
    width: fit-content;
}

.custom-card h3 {
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
}

.custom-card p {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    flex: 1;
}

.custom-btn {
    background-color: var(--primary) !important;
    color: white !important;
    padding: 0.8rem;
    border-radius: 0.75rem;
    text-align: center;
    text-decoration: none !important;
    font-weight: 600;
    font-size: 0.9rem;
    transition: background 0.2s;
    display: block;
}

.custom-btn:hover {
    background-color: #1d4ed8 !important;
}

.diag .card-icon-box { background: var(--accent-1); }
.diag .card-badge { background: #fef3c7; color: #92400e; }
.simul .card-icon-box { background: var(--accent-2); }
.simul .card-badge { background: #d1fae5; color: #065f46; }
.area .card-icon-box { background: var(--accent-3); }
.area .card-badge { background: #dbeafe; color: #1e40af; }
.gov .card-icon-box { background: var(--accent-4); }
.gov .card-badge { background: #ede9fe; color: #5b21b6; }
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
                <a target="_self" href="/calculator" class="custom-btn">비용 계산하기</a>
            </div>
        </div>

        <div class="custom-card simul">
            <div class="card-icon-box">📈</div>
            <div class="card-content">
                <span class="card-badge">분석</span>
                <h3>업종 변경 시뮬레이션</h3>
                <p>새로운 업종 전환 시의 예상 리스크와 수익성을 분석하여 안전한 도전을 지원합니다.</p>
                <a target="_self" href="/simulation" class="custom-btn">시뮬레이션 시작</a>
            </div>
        </div>

        <div class="custom-card area">
            <div class="card-icon-box">📍</div>
            <div class="card-content">
                <span class="card-badge">상권</span>
                <h3>내 주변 상권 분석</h3>
                <p>현재 위치 기반 상권 밀집도와 업종 분포 파악하여 최적의 입지 전략을 제시합니다.</p>
                <a target="_self" href="/market_analysis" class="custom-btn">상권 분석하기</a>
            </div>
        </div>

        <div class="custom-card gov">
            <div class="card-icon-box">🏛️</div>
            <div class="card-content">
                <span class="card-badge">가이드</span>
                <h3>정부 지원 정책</h3>
                <p>재취업, 재창업 등 소상공인에게 꼭 필요한 정부 지원금을 한눈에 확인하고 신청하세요.</p>
                <a target="_self" href="/guide" class="custom-btn">지원 정책 확인</a>
            </div>
        </div>
    </div>
</div>
""")

st.markdown("<br><br><hr>", unsafe_allow_html=True)

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
        margin-top: 10px;">
        <h3>AD Space</h3>
    </div>
    """,
    height=200
)
