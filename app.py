# Streamlit Watcher Trigger
import streamlit as st
import streamlit.components.v1 as components
from modules.database import init_db, log_page_access
from modules.components import set_custom_sidebar

# 1. 페이지 설정 (최상단)
st.set_page_config(page_title="RebornBiz | 소상공인 폐업 및 재창업 지원 플랫폼", page_icon="🏢", layout="wide", initial_sidebar_state="auto")

# 2. DB 초기화
init_db()

# 페이지 접속 로그 기록
log_page_access("홈")

# 3. SPA 라우팅 가로채기 (핵심)
components.html("""
    <script type="text/javascript">
        // [핵심] 클릭할 때마다 부모 창의 사이드바를 실시간으로 탐색
        window.parent.document.addEventListener('click', function(e) {
            const btn = e.target.closest('.custom-btn');
            if (btn && btn.hasAttribute('data-target')) {
                e.preventDefault();
                const targetKeyword = btn.getAttribute('data-target');
                
                // 💡 로컬/운영 어디서든 사이드바 링크를 실시간으로 찾음
                const links = window.parent.document.querySelectorAll('[data-testid="stPageLink-NavLink"]');
                
                let found = false;
                for (let i = 0; i < links.length; i++) {
                    // 실제 데이터-테스트아이디가 포함된 순정 링크를 찾음
                    if (links[i].innerText.includes(targetKeyword) || 
                        links[i].href.includes(targetKeyword)) {
                        links[i].click();
                        found = true;
                        break;
                    }
                }
                if (!found) console.warn("링크를 찾을 수 없습니다. [타겟: " + targetKeyword + "]");
            }
        }, true);
    </script>
""", width=0, height=0)

# 4. 사이드바 메뉴 렌더링
from modules.components import set_custom_sidebar, inject_seo_tags, render_footer
set_custom_sidebar()
inject_seo_tags()

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
    --accent-5: linear-gradient(135deg, #fca5a5 0%, #ef4444 100%);
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
.tax .card-icon-box { background: var(--accent-5); } .tax .card-badge { background: #fee2e2; color: #991b1b; }
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
        
        <div class="custom-card tax">
            <div class="card-icon-box">🧾</div>
            <div class="card-content">
                <span class="card-badge">세무</span>
                <h3>세금 자동 계산기</h3>
                <p>폐업 시 매입세액 공제 자산에 대한 부가가치세(잔존재화 간주공급)를 세법 기준으로 산출합니다.</p>
                <button class="custom-btn" data-target="tax_cal">세금 계산하기</button>
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

st.markdown("---")

st.markdown("""
### 📢 RebornBiz 소개

**RebornBiz가 뭐예요?**
RebornBiz(rebornbiz.co.kr)는 전국의 자영업·소상공인 및 예비 창업자 사장님들을 위해 상권 분석부터 폐업, 재창업까지의 의사결정을 데이터 기반으로 돕는 종합 프롭테크(Proptech) 플랫폼입니다. 
복잡한 내 주변 상권 분석과 상가 실거래가 조회부터, 막막한 폐업 비용 계산, 업종 변경 시뮬레이션, 그리고 꼭 필요한 정부 지원사업(정책자금, 희망리턴패키지 등) 가이드까지 사장님이 필요로 하는 핵심 도구와 정보를 한곳에 모아 쉬운 말로 제공하는 든든한 파트너입니다.

**데이터 출처**
RebornBiz는 국가에서 제공하는 공식 데이터를 기반으로 작동합니다.
- **공공데이터포털**: 상업업무용 부동산 실거래 자료 및 소상공인 상권 정보
- **소상공인시장진흥공단 (소상공인24)**: 희망리턴패키지, 철거비 지원 등 소상공인 특화 공고
- **기업마당 / K-Startup**: 중앙·공공 지원사업 통합 공고 및 창업 관련 공고

**업데이트 주기**
지원사업 공고 및 상권 데이터는 자동화된 수집 시스템을 통해 매일(주기적으로) 최신화되어 반영됩니다. 다만, 데이터 수집 시점과 실제 공고 변경 시점 간의 차이가 발생할 수 있으므로, 신청 및 계약 전에는 반드시 원문 공고나 공식 행정기관의 안내를 함께 확인해 주세요.

**면책 고지**
- RebornBiz는 공공데이터를 가공하여 사장님들이 이해하기 쉬운 참고용 정보를 제공할 뿐, 정부나 행정기관을 대변하는 공식 기관이 아닙니다.
- 상권 분석 결과, 폐업 비용 계산기 및 시뮬레이션은 사장님의 합리적 판단을 돕기 위한 보조 도구이며, 실제 소요되는 비용, 매출, 심사 결과를 보장하지 않습니다.
- 공고의 조건·금액·기한 및 상가 실거래가 정보는 사전 고지 없이 변경될 수 있으며, 원문과 본 사이트의 내용이 다를 경우 공식 기관의 원문이 우선합니다.
- RebornBiz는 부동산 중개, 세무, 노무, 법률 상담을 대체하지 않습니다. 개별 사안의 구체적인 실행은 반드시 해당 분야 전문가에게 문의하시기 바랍니다.

**피드백 및 문의**
잘못된 정보, 깨진 링크 신고 또는 서비스 기능 개선 제안은 운영팀(csh238ml@gmail.com)으로 알려주시면 빠르게 검토하여 반영하겠습니다.
""")

st.markdown("<br>", unsafe_allow_html=True)

# 6. 하단 광고 영역
st.html("""
    <div style="
        display: flex; justify-content: center; align-items: center; 
        height: 150px; border: 2px dashed #cccccc; border-radius: 10px; 
        background-color: #f8f9fa; color: #adb5bd; font-family: 'Segoe UI', Tahoma, sans-serif;
        margin-top: 0;">
        <h3>AD Space</h3>
    </div>
""")

# 7. 푸터 적용
render_footer()