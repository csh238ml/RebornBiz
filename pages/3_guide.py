import streamlit as st
import streamlit.components.v1 as components
import sys
import os

# 1. 페이지 기본 설정
st.set_page_config(page_title="정부 지원 정책 가이드 | RebornBiz", page_icon="🏛️", layout="wide", initial_sidebar_state="auto")

# 2. 커스텀 사이드바 로드
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.components import set_custom_sidebar, inject_seo_tags
from modules.database import log_page_access

set_custom_sidebar()
inject_seo_tags()

# 페이지 접속 로그 기록
log_page_access("정부 지원 정책")


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


# Custom CSS 주입: 전역 배경 설정 및 커스텀 카드 클래스
st.markdown("""
<style>
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
    flex: 1; /* 가로 균등 배치 */
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

/* 커스텀 카드 CSS (policy-card-marker 다음 요소 적용) */
.policy-card-marker + div {
    background-color: #ffffff !important;
    border-radius: 16px !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 4px 20px rgba(30, 58, 138, 0.02) !important;
    padding: 24px !important;
    margin-bottom: 24px !important;
}
</style>
""", unsafe_allow_html=True)


from modules.database import SessionLocal, GovPolicyGuide
import re

from sqlalchemy import or_

@st.cache_data(ttl=600, show_spinner=False)
def get_latest_policies():
    """DB에서 '소상공인' 관련 최신 정책 데이터를 가져옵니다."""
    db = SessionLocal()
    try:
        # 소상공인 키워드가 타겟이나 제목에 포함된 정책만 필터링
        policies = db.query(GovPolicyGuide).filter(
            or_(
                GovPolicyGuide.trget_nm.like('%소상공인%'),
                GovPolicyGuide.pblanc_nm.like('%소상공인%')
            )
        ).order_by(GovPolicyGuide.creat_pnttm.desc()).limit(50).all()
        
        result = []
        for p in policies:
            # HTML 태그 제거 함수
            def strip_html(text):
                if not text: return ""
                clean = re.compile('<.*?>')
                return re.sub(clean, '', text).strip()
                
            result.append({
                "pblanc_nm": p.pblanc_nm or "제목 없음",
                "jrsd_instt_nm": p.jrsd_instt_nm or "기관 정보 없음",
                "reqst_begin_end_de": p.reqst_begin_end_de or "기간 미정",
                "trget_nm": strip_html(p.trget_nm) if hasattr(p, 'trget_nm') and p.trget_nm else "지원 대상 상세 정보는 공고문 참조",
                "bsns_sumry_cn": strip_html(p.bsns_sumry_cn) or "혜택 상세 정보는 공고문 참조",
                "reqst_mth_papers_cn": strip_html(p.reqst_mth_papers_cn) or "신청 방법은 공식 사이트 확인",
                "pldir_sport_realm_lclas_code_nm": p.pldir_sport_realm_lclas_code_nm or "",
                "pblanc_url": p.pblanc_url or ""
            })
        return result
    except Exception as e:
        print(f"[ERROR] 정책 조회 실패: {e}")
        return []
    finally:
        db.close()

# 4. 탭(Tabs)을 활용한 카테고리 분류
tab1, tab2, tab3 = st.tabs(["💰 정부 지원금 (금융/자금)", "👨‍💼 컨설팅 프로그램 (경영/창업)", "🧾 기타 정책 (세제/일반)"])

policies = get_latest_policies()

def render_policy_card(p):
    """단일 정책의 Card 스타일 렌더링"""
    st.markdown('<div class="policy-card-marker"></div>', unsafe_allow_html=True)
    with st.container():
        category_nm = p['pldir_sport_realm_lclas_code_nm'] if p['pldir_sport_realm_lclas_code_nm'] else "지원사업"
        st.markdown(f"""
<div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
    <span style="background-color: #fff0ea; color: #FF8C42; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: bold;">⚡ 접수중</span>
    <span style="background-color: #eff6ff; color: #1E3A8A; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: bold;">{category_nm}</span>
    <span style="background-color: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: bold;">{p['jrsd_instt_nm']}</span>
</div>
<h3 style="color: #1E3A8A; margin-top: 0; margin-bottom: 16px; font-size: 1.35rem; line-height: 1.4;">{p['pblanc_nm']}</h3>

<h4 style="color: #1E3A8A; margin-top: 20px; margin-bottom: 8px; font-size: 1.05rem;">🎯 1. 누가 받을 수 있나요?</h4>
<p style="color: #334155; line-height: 1.6; margin-bottom: 16px;">{p['trget_nm']}</p>

<h4 style="color: #1E3A8A; margin-top: 16px; margin-bottom: 8px; font-size: 1.05rem;">💰 2. 어떤 혜택을 받나요?</h4>
<p style="color: #334155; line-height: 1.6; margin-bottom: 16px;">{p['bsns_sumry_cn']}</p>

<h4 style="color: #1E3A8A; margin-top: 16px; margin-bottom: 8px; font-size: 1.05rem;">📋 3. 어떻게 신청하나요?</h4>
<p style="color: #334155; line-height: 1.6; margin-bottom: 16px;">{p['reqst_mth_papers_cn']}</p>

<div style="color: #ef4444; font-weight: bold; margin-bottom: 16px; font-size: 0.95rem;">📅 신청기간: {p['reqst_begin_end_de']}</div>
""", unsafe_allow_html=True)
        
        if p['pblanc_url'] and p['pblanc_url'].startswith('http'):
            st.link_button("👉 원본 공고문 바로가기", p['pblanc_url'], use_container_width=True)


def render_fallback_card(title, instt, trget, summary, reqst, link_url=None):
    """DB 장애 시 폴백용 수동 렌더링 카드"""
    p = {
        "pblanc_nm": title,
        "jrsd_instt_nm": instt,
        "reqst_begin_end_de": "예산 소진 시까지 (상시 접수)",
        "trget_nm": trget,
        "bsns_sumry_cn": summary,
        "reqst_mth_papers_cn": reqst,
        "pldir_sport_realm_lclas_code_nm": "지원사업",
        "pblanc_url": link_url
    }
    render_policy_card(p)


# --- 탭 1: 정부 지원금 ---
with tab1:
    st.header("정부 지원금 안내")
    tab1_policies = [p for p in policies if '금융' in p['pldir_sport_realm_lclas_code_nm'] or '자금' in p['pblanc_nm']]
    
    if tab1_policies:
        for p in tab1_policies[:10]:
            render_policy_card(p)
    else:
        # DB 장애 시 Fallback
        render_fallback_card(
            title="점포철거비 지원 (희망리턴패키지)",
            instt="소상공인시장진흥공단",
            trget="폐업을 예정하거나 기폐업한 소상공인",
            summary="전용면적(평) 당 13만 원 (최대 250만 원 한도) 실비 지원",
            reqst="소상공인시장진흥공단 희망리턴패키지 홈페이지에서 온라인 신청 접수",
            link_url="https://hope.sbiz.or.kr/"
        )
        render_fallback_card(
            title="재창업 사업화 자금 지원",
            instt="소상공인시장진흥공단",
            trget="폐업 후 재창업을 준비 중인 소상공인 (단, 공단의 재창업 교육 수료 필수)",
            summary="사업화 자금(임대료, 마케팅, 시제품 제작 등) 최대 2,000만 원 한도 내 차등 지원",
            reqst="소상공인시장진흥공단 홈페이지 공고 확인 후 신청",
            link_url=""
        )

# --- 탭 2: 컨설팅 프로그램 ---
with tab2:
    st.header("컨설팅 프로그램")
    tab2_policies = [p for p in policies if '경영' in p['pldir_sport_realm_lclas_code_nm'] or '창업' in p['pldir_sport_realm_lclas_code_nm']]
    
    if tab2_policies:
        for p in tab2_policies[:10]:
            render_policy_card(p)
    else:
        # DB 장애 시 Fallback
        render_fallback_card(
            title="사업정리 컨설팅",
            instt="소상공인시장진흥공단",
            trget="폐업을 준비 중인 소상공인 누구나",
            summary="세무, 부동산(권리금/보증금 보호), 노무 등의 문제를 전문가가 1:1 방문하여 무료로 컨설팅 (정부 100% 지원)",
            reqst="가까운 지역센터 방문 또는 온라인 신청",
            link_url=""
        )
        render_fallback_card(
            title="업종전환·재창업 컨설팅",
            instt="소상공인시장진흥공단",
            trget="업종을 변경하거나 재창업을 희망하는 기폐업 소상공인",
            summary="상권 분석, 아이템 검증, 마케팅 전략 등 성공적인 재창업을 위한 전문가 멘토링 제공",
            reqst="온라인 신청",
            link_url=""
        )

# --- 탭 3: 세제 혜택 및 법무 (기타) ---
with tab3:
    st.header("세제 혜택 및 기타 지원")
    tab3_policies = [p for p in policies if p not in tab1_policies and p not in tab2_policies]
    
    if tab3_policies:
        for p in tab3_policies[:10]:
            render_policy_card(p)
    else:
        # DB 장애 시 Fallback
        render_fallback_card(
            title="폐업 시 부가가치세 신고 가이드",
            instt="국세청",
            trget="사업자등록을 말소하고 폐업을 진행하는 모든 개인/법인 사업자",
            summary="잔존재화 부가세(판매하지 못한 재고품 등) 신고 및 종합소득세 신고 의무 안내",
            reqst="폐업일이 속한 달의 다음 달 25일까지 국세청 홈택스에서 반드시 확정 신고 진행",
            link_url="https://www.hometax.go.kr/"
        )
        render_fallback_card(
            title="상가임대차 분쟁 조정 지원",
            instt="대한법률구조공단",
            trget="임대인과의 임대료, 권리금, 보증금 반환 관련 분쟁을 겪고 있는 임차인",
            summary="분쟁 발생 시 법률 상담 및 조정을 통해 원만한 합의 유도",
            reqst="대한법률구조공단 상가건물임대차 분쟁조정위원회 접수",
            link_url=""
        )

# 5. 하단 문의/안내 및 TODO 영역
st.divider()
st.caption("💡 **안내:** 위 정보는 정부 및 지자체의 예산 상황에 따라 조기 마감되거나 정책 내용이 변동될 수 있습니다. 반드시 해당 기관의 공식 홈페이지 공고문을 확인하시기 바랍니다.")
st.caption("※ **업데이트 예정:** 실시간 정책 데이터 연동 및 맞춤형 검색 기능이 추가될 예정입니다.")

# ==========================================
# 🌟 추가된 영역: 페이지 최하단 광고 배너
ad_space("AD Space (Bottom Banner)")
# ==========================================