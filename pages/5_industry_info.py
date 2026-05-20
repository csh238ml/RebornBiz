import streamlit as st
import pandas as pd
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.components import set_custom_sidebar
from modules.database import SessionLocal

st.set_page_config(page_title="업종 정보 조회 - RebornBiz", page_icon="🏢", layout="wide")
set_custom_sidebar()

st.title("🏢 업종 정보 조회")
st.markdown("상권 분석 및 시뮬레이션에 활용되는 표준 업종 마스터(industry_master) 정보를 조회합니다.")

@st.cache_data(ttl=3600)
def load_industry_data():
    db = SessionLocal()
    try:
        df = pd.read_sql("SELECT large_cat_code, large_cat_name, medium_cat_code, medium_cat_name, small_cat_code, small_cat_name FROM industry_master", db.bind)
        return df
    except Exception as e:
        st.error(f"데이터베이스 조회 오류: {e}")
        return pd.DataFrame()
    finally:
        db.close()

df = load_industry_data()

if not df.empty:
    with st.container(border=True):
        st.subheader("업종 필터링")
        col1, col2 = st.columns(2)
        with col1:
            large_cats = ["전체"] + sorted([c for c in df['large_cat_name'].unique() if c])
            selected_large = st.selectbox("대분류", large_cats)
        
        with col2:
            if selected_large != "전체":
                medium_cats = ["전체"] + sorted([c for c in df[df['large_cat_name'] == selected_large]['medium_cat_name'].unique() if c])
            else:
                medium_cats = ["전체"]
            selected_medium = st.selectbox("중분류", medium_cats, disabled=(selected_large == "전체"))

    filtered_df = df.copy()
    if selected_large != "전체":
        filtered_df = filtered_df[filtered_df['large_cat_name'] == selected_large]
    if selected_medium != "전체" and selected_large != "전체":
        filtered_df = filtered_df[filtered_df['medium_cat_name'] == selected_medium]
        
    st.markdown(f"**조회 결과:** 총 **{len(filtered_df):,}** 건")
    st.dataframe(
        filtered_df,
        column_config={
            "large_cat_code": "대분류 코드",
            "large_cat_name": "대분류명",
            "medium_cat_code": "중분류 코드",
            "medium_cat_name": "중분류명",
            "small_cat_code": "소분류 코드",
            "small_cat_name": "소분류명",
        },
        use_container_width=True,
        hide_index=True,
        height=600
    )
else:
    st.warning("등록된 업종 마스터 정보가 없습니다.")
