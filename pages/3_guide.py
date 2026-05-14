import streamlit as st

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.components import set_custom_sidebar

st.set_page_config(page_title="정부 지원 정책 - RebornBiz", page_icon="📚")
set_custom_sidebar()

st.title("[가이드] 정부 지원 정책")
st.write("폐업 예정자 및 재창업 소상공인을 위한 다양한 정부 지원금, 컨설팅 프로그램, 세제 혜택 등을 안내합니다.")
# TODO: 정책 데이터 연동 및 검색 기능 구현 예정
