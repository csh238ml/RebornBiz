import streamlit as st
import pandas as pd
import plotly.express as px
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import modules.database
import modules.market_api
from modules.market_api import fetch_stores_in_radius
from modules.kakao_component import kakao_map

st.set_page_config(page_title="내 주변 상권 분석 - RebornBiz", page_icon="🗺️", layout="wide")

st.title("🗺️ 내 주변 상권 분석")
st.write("현재 내 위치를 기반으로 주변 반경 내에 어떤 상권이 형성되어 있는지 시각적으로 확인합니다.")
st.markdown("---")

if "active_lat" not in st.session_state:
    st.session_state.active_lat = 37.498
    st.session_state.active_lon = 127.027
if "last_clicked_coord" not in st.session_state:
    st.session_state.last_clicked_coord = None
if "location_fetched" not in st.session_state:
    st.session_state.location_fetched = False

auto_locate = not st.session_state.location_fetched
        
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

# 커스텀 CSS (8px 기반 시스템 및 카드 UI 디자인 시스템)
st.markdown("""
    <style>
    /* 전체 페이지 배경색 */
    .stApp {
        background-color: #F8F9FA;
    }
    
    /* 8px 기반 스페이싱 시스템 */
    :root {
        --spacing-1: 8px;
        --spacing-2: 16px;
        --spacing-3: 24px;
    }
    
    /* Metric(배지) 카드 스타일 */
    [data-testid="stMetric"] {
        background-color: #FFFFFF;
        padding: var(--spacing-2);
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        border-left: 5px solid #4a90e2;
        border: 1px solid #E0E0E0;
        margin-bottom: var(--spacing-1);
    }
    
    /* st.container(border=True)에 대한 글로벌 카드 스타일 적용 */
    div[data-testid="stVerticalBlockBorderWrapper"] {
        background-color: #FFFFFF !important;
        border: 1px solid #E0E0E0 !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
        padding: 20px !important;
    }
    
    /* 주요 컨테이너 상하 여백 */
    .css-1544g2n.e1fqcg0o4 {
        padding-top: var(--spacing-3);
    }
    </style>
""", unsafe_allow_html=True)

if not stores:
    st.warning("해당 반경 내에 조회된 상권 데이터가 없습니다.")
else:
    # Top Section: 헤더 및 요약 지표 (반응형 3단 배지)
    st.markdown("### 📋 상권 요약 지표")
    m_col1, m_col2, m_col3 = st.columns(3)
    with m_col1:
        st.metric("📍 현재 분석 위치", address_str)
    with m_col2:
        st.metric("⭕ 검색 반경", f"{radius}m")
    with m_col3:
        st.metric("🏪 검색된 총 점포", f"{len(stores)} 개")
    
    # 3. 데이터 시각화 대시보드
    st.markdown("---")
    st.subheader("3. 상권 시각화 대시보드")
    
    # 2단 그리드 구조 적용 (좌: 지도, 우: 차트 및 데이터)
    col1, col2 = st.columns([1.2, 1.0], gap="large")
    
    df_stores = pd.DataFrame(stores)
    
    with col1:
        with st.container(border=True):
            st.markdown("#### 📍 주변 상권 지도 (카카오 맵)")
            
            # 데이터를 딕셔너리로 직렬화 (간소화)
            simple_stores = [{"lat": s["lat"], "lon": s["lon"], "bizesNm": s.get("bizesNm", "알수없음"), "indsMclsNm": s.get("indsMclsNm", "")} for s in stores]
            
            # 컴포넌트 호출 및 자동 위치 조회 플래그 전달
            clicked_data = kakao_map(lat=lat, lon=lon, stores=simple_stores, auto_locate=auto_locate, key="kakaomap_comp")
            
            # 지도 상호작용 (클릭 또는 자동 위치 반환) 처리
            if clicked_data:
                # 자동 위치 조회가 완료되었음을 마킹
                if clicked_data.get("_is_auto_located"):
                    st.session_state.location_fetched = True
                    
                if "lat" in clicked_data and "lng" in clicked_data:
                    coord = (clicked_data["lat"], clicked_data["lng"])
                    if st.session_state.last_clicked_coord != coord:
                        st.session_state.last_clicked_coord = coord
                        st.session_state.active_lat = coord[0]
                        st.session_state.active_lon = coord[1]
                        st.rerun()
        
    with col2:
        with st.container(border=True):
            st.markdown("#### 📊 상권 상세 지표 및 리스트")
            
            # 탭을 활용하여 차트와 리스트 정보를 분리 및 정돈
            tab1, tab2 = st.tabs(["📊 업종 분포 차트", "🎯 주변 경쟁 매장 검색"])
        
        with tab1:
            if "indsLclsNm" in df_stores.columns:
                st.markdown("##### 🔹 업종 대분류 비중")
                # 대분류별 파이 차트
                lcls_counts = df_stores['indsLclsNm'].value_counts().reset_index()
                lcls_counts.columns = ['업종 대분류', '점포 수']
                
                fig_pie = px.pie(lcls_counts, names='업종 대분류', values='점포 수', hole=0.4, 
                               color_discrete_sequence=px.colors.qualitative.Pastel)
                # 범례를 하단으로 내려 모바일 가독성 확보
                fig_pie.update_layout(
                    margin=dict(t=10, b=10, l=10, r=10),
                    legend=dict(orientation="h", yanchor="bottom", y=-0.2, xanchor="center", x=0.5)
                )
                st.plotly_chart(fig_pie, use_container_width=True)
                
                st.markdown("---")
                st.markdown("##### 🔹 주요 업종 중분류 (Top 10)")
                # 중분류별 바 차트 (Top 10)
                if "indsMclsNm" in df_stores.columns:
                    mcls_counts = df_stores['indsMclsNm'].value_counts().head(10).reset_index()
                    mcls_counts.columns = ['업종 중분류', '점포 수']
                    
                    # 텍스트 라벨 길이 자동 조절 (긴 이름 자르기)
                    mcls_counts['업종 라벨'] = mcls_counts['업종 중분류'].apply(lambda x: x[:10] + '...' if len(x) > 10 else x)
                    
                    fig_bar = px.bar(
                        mcls_counts, 
                        x='점포 수', 
                        y='업종 라벨', 
                        orientation='h',
                        color='업종 라벨',
                        color_discrete_sequence=px.colors.qualitative.Pastel,
                        hover_data={'업종 라벨': False, '업종 중분류': True} # 호버 시 전체 이름 표시
                    )
                    # 유연한 폰트 크기 및 여백 자동 조절(automargin)
                    fig_bar.update_layout(
                        yaxis=dict(categoryorder='total ascending', automargin=True, tickfont=dict(size=11)),
                        xaxis=dict(title="점포 수"),
                        showlegend=False, 
                        margin=dict(t=10, b=10, l=10, r=10)
                    )
                    st.plotly_chart(fig_bar, use_container_width=True)
                    
        with tab2:
            if "indsMclsNm" in df_stores.columns:
                st.markdown("##### 반경 내 특정 업종의 매장들을 확인합니다.")
                # 업종 리스트 추출
                industry_options = sorted(df_stores['indsMclsNm'].dropna().unique().tolist())
                selected_industry = st.selectbox("분석할 업종을 고르세요", options=industry_options)
                
                if selected_industry:
                    competitors = df_stores[df_stores['indsMclsNm'] == selected_industry]
                    competitor_count = len(competitors)
                    
                    st.metric(label=f"반경 {radius}m 내 '{selected_industry}' 매장 수", value=f"{competitor_count} 개")
                    
                    if competitor_count > 0 and 'bizesNm' in competitors.columns:
                        st.markdown("<br><b>🏪 매장 리스트</b>", unsafe_allow_html=True)
                        store_names = competitors[['bizesNm', 'indsSclsNm']].reset_index(drop=True)
                        store_names.columns = ['상호명', '상세 업종']
                        st.dataframe(store_names, hide_index=True, use_container_width=True, height=400)
