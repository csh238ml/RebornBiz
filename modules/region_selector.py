import streamlit as st
import modules.database

def render_region_selector():
    """
    3단계(시/도 -> 시/군/구 -> 읍/면/동) 캐스케이딩 지역 선택 셀렉트박스를 렌더링합니다.
    """
    st.write("#### 📍 지역 선택")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        sido_list = modules.database.get_sido_list()
        selected_sido = st.selectbox(
            "시/도",
            options=sido_list,
            index=None,
            placeholder="시/도를 선택하세요"
        )
        
    with col2:
        sigungu_list = modules.database.get_sigungu_list(selected_sido) if selected_sido else []
        selected_sigungu = st.selectbox(
            "시/군/구",
            options=sigungu_list,
            index=None,
            placeholder="시/군/구를 선택하세요",
            disabled=(selected_sido is None)
        )
        
    with col3:
        dong_list = modules.database.get_dong_list(selected_sido, selected_sigungu) if selected_sigungu else []
        selected_dong = st.selectbox(
            "읍/면/동",
            options=dong_list,
            index=None,
            placeholder="읍/면/동을 선택하세요",
            disabled=(selected_sigungu is None)
        )
        
    return selected_sido, selected_sigungu, selected_dong

