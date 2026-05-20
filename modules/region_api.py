import requests
import streamlit as st
import urllib.parse
from modules.korea_regions import KOREA_REGIONS

API_URL = "http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList"

@st.cache_data(show_spinner=False)
def get_sido_api():
    """시/도 목록을 공공데이터 API 또는 로컬 데이터에서 조회합니다."""
    # API 키가 없거나 에러 발생 시 로컬 KOREA_REGIONS 데이터 사용 (Fallback)
    try:
        api_key = st.secrets.get("PUBLIC_DATA_API_KEY", None)
        if not api_key:
            return list(KOREA_REGIONS.keys())
            
        decoded_key = urllib.parse.unquote(api_key)
        params = {
            "serviceKey": decoded_key,
            "pageNo": 1,
            "numOfRows": 50,
            "type": "json"
        }
        # 실제 API 호출을 시뮬레이션 하거나 수행 (여기서는 구조적 구현)
        response = requests.get(API_URL, params=params, timeout=3)
        if response.status_code == 200:
            data = response.json()
            # API 응답 구조에 맞게 파싱하는 로직이 필요 (응답이 정상일 경우)
            # 여기서는 편의상 로컬 fallback을 반환하지만, 실제 API 연동 시 아래를 수정하세요.
            # items = data.get("StanReginCd", [])[1].get("row", [])
            # return [item["locatadd_nm"] for item in items if ...]
            pass
    except Exception as e:
        pass
    
    return list(KOREA_REGIONS.keys())

@st.cache_data(show_spinner=False)
def get_sigungu_api(sido_name):
    """특정 시/도에 속하는 시/군/구 목록을 조회합니다."""
    if not sido_name:
        return []
        
    try:
        api_key = st.secrets.get("PUBLIC_DATA_API_KEY", None)
        if api_key:
            # API 연동 로직
            pass
    except Exception:
        pass
        
    # Fallback 로직
    return list(KOREA_REGIONS.get(sido_name, {}).keys()) if sido_name in KOREA_REGIONS else []

@st.cache_data(show_spinner=False)
def get_dong_api(sido_name, sigungu_name):
    """특정 시/도 및 시/군/구에 속하는 읍/면/동 목록을 조회합니다."""
    if not sido_name or not sigungu_name:
        return []
        
    try:
        api_key = st.secrets.get("PUBLIC_DATA_API_KEY", None)
        if api_key:
            # API 연동 로직
            pass
    except Exception:
        pass
        
    # Fallback 로직
    if sido_name in KOREA_REGIONS and sigungu_name in KOREA_REGIONS[sido_name]:
        return KOREA_REGIONS[sido_name][sigungu_name]
    return []
