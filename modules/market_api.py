import requests
import urllib.parse
import urllib3
import random
import math
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.database import SessionLocal, StoreMaster

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

API_URL = "http://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius"
API_KEY = "FmRJggnPbuErC7S3g3D1K51bawXyTDd7hh/JZP+dkyl5OdU79rlNJ+NZWXUfncUYfKzWtgUj8Ks6oxWvRQdPSg=="

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000 # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(delta_lambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

def fetch_stores_in_radius(lat: float, lon: float, radius: int = 500, address_str: str = "") -> list:
    """
    주소에 따라 수도권/광역시(서울, 경기, 인천, 부산, 대구, 광주, 대전, 울산, 세종)는 DB에서,
    그 외 지역은 실시간 API를 통해 조회하는 하이브리드 라우팅 함수입니다.
    """
    # 주소 문자열이 없거나 알 수 없을 경우 기본값으로 DB 조회
    if not address_str or address_str == "상세 주소 알 수 없음":
        use_batch_db = True
    else:
        batch_regions = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종"]
        use_batch_db = any(region in address_str for region in batch_regions)
    
    if use_batch_db:
        print(f"[INFO] '{address_str}' 지역: 배치 수집된 자체 DB를 조회합니다.")
        return _fetch_from_db(lat, lon, radius)
    else:
        print(f"[INFO] '{address_str}' 지역: 외부 공공데이터 API를 실시간 호출합니다.")
        return _fetch_from_api(lat, lon, radius)

def _fetch_from_db(lat, lon, radius):
    db = SessionLocal()
    try:
        # Bounding box calculation for quick SQL filtering
        d_lat = radius / 111000.0
        d_lon = radius / 88000.0
        
        query = db.query(StoreMaster).filter(
            StoreMaster.lat.between(lat - d_lat, lat + d_lat),
            StoreMaster.lon.between(lon - d_lon, lon + d_lon)
        ).all()
        
        results = []
        for s in query:
            if haversine(lat, lon, s.lat, s.lon) <= radius:
                results.append({
                    "bizesId": s.bizesId,
                    "bizesNm": s.bizesNm,
                    "indsLclsNm": s.indsLclsNm,
                    "indsMclsNm": s.indsMclsNm,
                    "indsSclsNm": s.indsSclsNm,
                    "lat": s.lat,
                    "lon": s.lon
                })
        return results
    except Exception as e:
        print(f"[ERROR] DB 조회 에러: {e}")
        return []
    finally:
        db.close()

def _fetch_from_api(lat, lon, radius):
    decoded_key = urllib.parse.unquote(API_KEY)
    params = {
        "serviceKey": decoded_key,
        "pageNo": 1,
        "numOfRows": 1000,
        "radius": radius,
        "cx": lon,
        "cy": lat,
        "type": "json"
    }
    
    try:
        response = requests.get(API_URL, params=params, verify=False, timeout=5)
        response.raise_for_status()
        
        try:
            data = response.json()
        except ValueError:
            print("[WARN] API 응답이 JSON이 아닙니다. Mock 데이터를 반환합니다.")
            return _generate_mock_stores(lat, lon, radius)
            
        header = data.get("header", {})
        if header.get("resultCode") == "00":
            items = data.get("body", {}).get("items", [])
            if items:
                return items
        
        print(f"[WARN] API 정상 응답 아님. 응답: {str(data)[:100]}. Mock 데이터를 반환합니다.")
        return _generate_mock_stores(lat, lon, radius)
        
    except Exception as e:
        print(f"[ERROR] API 호출 실패: {e}")
        return _generate_mock_stores(lat, lon, radius)

def _generate_mock_stores(lat, lon, radius, count=50):
    """API 연동 전 시각화 테스트를 위한 가상 데이터 생성"""
    categories = ["음식", "소매", "서비스", "학문/교육"]
    sub_categories = {
        "음식": ["한식", "카페", "치킨", "중식", "양식"],
        "소매": ["편의점", "의류", "화장품", "식료품"],
        "서비스": ["미용실", "세탁소", "부동산", "사진관"],
        "학문/교육": ["보습학원", "어학원", "독서실"]
    }
    
    mock_data = []
    lat_degree_per_m = 1 / 111000
    lon_degree_per_m = 1 / 88000
    
    for i in range(count):
        r = random.uniform(0, radius)
        offset_lat = r * lat_degree_per_m * random.uniform(-1, 1)
        offset_lon = r * lon_degree_per_m * random.uniform(-1, 1)
        
        lcls = random.choice(categories)
        mcls = random.choice(sub_categories[lcls])
        
        mock_data.append({
            "bizesId": f"MOCK_{i}",
            "bizesNm": f"테스트 상가 {i}",
            "indsLclsNm": lcls,
            "indsMclsNm": mcls,
            "indsSclsNm": f"{mcls} 상세",
            "lat": lat + offset_lat,
            "lon": lon + offset_lon
        })
    return mock_data
