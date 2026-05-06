import streamlit as st
import folium
from streamlit_folium import st_folium
from folium.plugins import MarkerCluster
from streamlit_geolocation import streamlit_geolocation
import pandas as pd
import plotly.express as px
import sys
import os
import importlib

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import modules.database
importlib.reload(modules.database)
import modules.market_api
importlib.reload(modules.market_api)
from modules.market_api import fetch_stores_in_radius

st.set_page_config(page_title="내 주변 상권 분석 - RebornBiz", page_icon="🗺️", layout="wide")

st.title("🗺️ 내 주변 상권 분석")
st.write("현재 내 위치를 기반으로 주변 반경 내에 어떤 상권이 형성되어 있는지 시각적으로 확인합니다.")
st.markdown("---")

# 1. 위치 획득
st.subheader("1. 기준 위치 설정")
st.write("아래 버튼을 눌러 내 위치를 가져오거나, **지도 위를 직접 클릭**하여 상권을 분석할 위치를 지정할 수 있습니다.")

col_btn, col_text = st.columns([1, 4])
with col_btn:
    location = streamlit_geolocation()
with col_text:
    st.markdown("<div style='margin-top: 10px;'>👈 (브라우저 위치 권한 허용 필요)</div>", unsafe_allow_html=True)

if "active_lat" not in st.session_state:
    st.session_state.active_lat = 37.498
    st.session_state.active_lon = 127.027
if "last_gps" not in st.session_state:
    st.session_state.last_gps = None
if "last_clicked_coord" not in st.session_state:
    st.session_state.last_clicked_coord = None

# GPS 위치가 업데이트된 경우
if location and location.get('latitude') and location.get('longitude'):
    current_gps = (location['latitude'], location['longitude'])
    if st.session_state.last_gps != current_gps:
        st.session_state.last_gps = current_gps
        st.session_state.active_lat = current_gps[0]
        st.session_state.active_lon = current_gps[1]
        st.session_state.last_clicked_coord = None # GPS 우선 적용
        
lat = st.session_state.active_lat
lon = st.session_state.active_lon

@st.cache_data(ttl=86400, show_spinner=False)
def reverse_geocode(lat, lon):
    try:
        import requests
        url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
        res = requests.get(url, headers={'User-Agent': 'RebornBiz/1.0'}, verify=False, timeout=3).json()
        address = res.get('address', {})
        city = address.get('city', address.get('province', ''))
        borough = address.get('borough', address.get('county', ''))
        suburb = address.get('suburb', address.get('town', address.get('village', '')))
        parts = [city, borough, suburb]
        return " ".join([p for p in parts if p]).strip() or "상세 주소 알 수 없음"
    except:
        return "주소 변환 실패"

address_str = reverse_geocode(lat, lon)
st.success(f"📍 현재 분석 기준 위치: **{address_str}**")

st.markdown("---")

# 2. 반경 설정
st.subheader("2. 상권 분석 반경 설정")
radius = st.slider("검색 반경을 선택하세요 (미터)", min_value=100, max_value=2000, value=500, step=100)

# API를 통해 데이터 로드
@st.cache_data(ttl=600, show_spinner=False)
def get_cached_stores(c_lat, c_lon, c_radius, c_addr):
    return fetch_stores_in_radius(c_lat, c_lon, c_radius, c_addr)

with st.spinner('주변 상권 데이터를 불러오는 중입니다...'):
    stores = get_cached_stores(lat, lon, radius, address_str)

if not stores:
    st.warning("해당 반경 내에 조회된 상권 데이터가 없습니다.")
else:
    st.success(f"반경 {radius}m 내 총 {len(stores)}개의 점포를 찾았습니다!")
    
    # 3. 데이터 시각화 (차트와 지도)
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.write("#### 📍 주변 상권 지도 (클러스터링)")
        # Folium 지도 생성
        m = folium.Map(location=[lat, lon], zoom_start=15)
        
        # 중심점 (내 위치) 표시
        folium.Marker(
            location=[lat, lon],
            popup="내 위치 (중심점)",
            icon=folium.Icon(color="red", icon="star")
        ).add_to(m)
        
        # 상가 마커 클러스터링
        marker_cluster = MarkerCluster().add_to(m)
        for store in stores:
            folium.Marker(
                location=[store["lat"], store["lon"]],
                popup=f"{store.get('bizesNm', '알수없음')} ({store.get('indsMclsNm', '')})",
                tooltip=store.get("bizesNm", ""),
                icon=folium.Icon(color="blue", icon="info-sign")
            ).add_to(marker_cluster)
            
        # 지도 렌더링 (클릭 이벤트 처리를 위해 last_clicked 반환)
        map_data = st_folium(m, width=600, height=500, key="market_map", returned_objects=["last_clicked"])
        
        # 지도 클릭 시 해당 위치로 분석 갱신
        if map_data and map_data.get("last_clicked"):
            clicked = map_data["last_clicked"]
            coord = (clicked["lat"], clicked["lng"])
            if st.session_state.last_clicked_coord != coord:
                st.session_state.last_clicked_coord = coord
                st.session_state.active_lat = coord[0]
                st.session_state.active_lon = coord[1]
                st.rerun()
        
    with col2:
        st.write("#### 📊 업종별 분포도")
        # 데이터프레임 변환 후 통계 산출
        df_stores = pd.DataFrame(stores)
        
        if "indsLclsNm" in df_stores.columns:
            # 대분류별 파이 차트
            lcls_counts = df_stores['indsLclsNm'].value_counts().reset_index()
            lcls_counts.columns = ['업종 대분류', '점포 수']
            
            fig_pie = px.pie(lcls_counts, names='업종 대분류', values='점포 수', hole=0.4)
            st.plotly_chart(fig_pie, use_container_width=True)
            
            # 중분류별 바 차트 (Top 10)
            if "indsMclsNm" in df_stores.columns:
                mcls_counts = df_stores['indsMclsNm'].value_counts().head(10).reset_index()
                mcls_counts.columns = ['업종 중분류', '점포 수']
                
                fig_bar = px.bar(
                    mcls_counts, 
                    x='점포 수', 
                    y='업종 중분류', 
                    orientation='h',
                    color='업종 중분류'
                )
                fig_bar.update_layout(yaxis={'categoryorder':'total ascending'}, showlegend=False)
                st.plotly_chart(fig_bar, use_container_width=True)

    st.markdown("---")
    st.subheader("3. 주변 경쟁 업체 현황 분석")
    
    if "indsMclsNm" in df_stores.columns:
        st.write("#### 🎯 주변 경쟁 매장 리스트 조회")
        
        # 업종 리스트 추출
        industry_options = sorted(df_stores['indsMclsNm'].dropna().unique().tolist())
        selected_industry = st.selectbox("분석할 업종(선택 업종)을 고르세요", options=industry_options)
        
        if selected_industry:
            competitors = df_stores[df_stores['indsMclsNm'] == selected_industry]
            competitor_count = len(competitors)
            st.metric(label=f"반경 {radius}m 내 '{selected_industry}' 업체 수", value=f"{competitor_count} 개 매장")
            
            if competitor_count > 0 and 'bizesNm' in competitors.columns:
                st.write("##### 🏪 매장 목록")
                store_names = competitors[['bizesNm']].reset_index(drop=True)
                store_names.columns = ['매장명']
                st.dataframe(store_names, hide_index=True, use_container_width=True)
