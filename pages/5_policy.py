import streamlit as st
import sys
import os

st.set_page_config(page_title="이용약관 및 개인정보처리방침 | RebornBiz", page_icon="📜", layout="wide", initial_sidebar_state="auto")

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.components import set_custom_sidebar, inject_seo_tags, render_footer
from modules.database import log_page_access

set_custom_sidebar()
inject_seo_tags()
log_page_access("이용약관 및 개인정보처리방침")

st.title("📜 이용약관 및 개인정보처리방침")
st.write("RebornBiz(이하 '본 사이트')의 이용약관 및 개인정보처리방침을 안내해 드립니다.")

st.divider()

st.header("제1장 이용약관 (Terms of Service)")
st.markdown("""
**제1조 (목적)**
본 약관은 본 사이트가 제공하는 모든 정보 및 시뮬레이션 서비스의 이용 조건 및 절차, 이용자와 본 사이트의 권리, 의무, 책임사항을 규정함을 목적으로 합니다.

**제2조 (서비스의 성격 및 면책)**
1. 본 사이트에서 제공하는 폐업 비용 계산, 업종 변경 시뮬레이션, 상권 분석 등의 데이터는 참고용 추정치이며, 실제 수치와 다를 수 있습니다.
2. 본 사이트의 정보를 바탕으로 내린 의사결정 및 금전적 손실에 대해 본 사이트는 어떠한 법적 책임도 지지 않습니다.

**제3조 (서비스 이용)**
본 사이트는 회원가입 절차 없이 누구나 무료로 이용할 수 있는 개방형 웹 서비스입니다.
""")

st.header("제2장 개인정보처리방침 (Privacy Policy)")
st.markdown("""
**제1조 (개인정보 수집 및 이용 목적)**
본 사이트는 회원가입 기능을 제공하지 않으며, 사용자의 이름, 전화번호, 주민등록번호 등 **개인을 직접 식별할 수 있는 민감한 개인정보를 일절 수집하지 않습니다.**

**제2조 (제3자 광고 스크립트 및 쿠키 수집 고지)**
본 사이트는 서비스 운영 및 유지를 위해 **구글 애드센스(Google AdSense)** 등의 제3자 광고 스크립트를 사용하고 있습니다. 
이를 위해 다음과 같은 비식별 정보 및 쿠키(Cookie)가 수집될 수 있습니다.
* 구글을 포함한 제3자 공급업체는 쿠키를 사용하여 사용자가 본 사이트 또는 다른 웹사이트를 이전에 방문한 기록을 기반으로 맞춤 광고를 게재합니다.
* 구글의 광고 쿠키 사용을 통해 구글 및 파트너는 사용자의 사이트 방문 기록을 바탕으로 사용자에게 적절한 광고를 제공할 수 있습니다.
* 사용자는 [구글 광고 설정](https://myadcenter.google.com/)에서 맞춤 광고를 위한 쿠키 사용을 선택 해제할 수 있습니다.

**제3조 (접속 로그 및 통계 데이터)**
본 사이트는 서비스 품질 향상을 위해 사용자의 메뉴 접속 횟수 등 익명화된 단순 통계 데이터(로그)만 내부적으로 기록하며, 이는 특정 개인을 추적하거나 외부로 반출되지 않습니다.
""")

st.divider()
st.caption("본 약관 및 개인정보처리방침은 2026년 6월 8일부터 적용됩니다.")

render_footer()
