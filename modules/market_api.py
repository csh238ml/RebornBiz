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
    내 주변 반경 데이터를 DB에서 먼저 조회합니다.
    단, DB에 데이터가 없을 경우 공공데이터 API를 호출해 DB에 실시간 저장(캐싱)한 뒤 다시 불러옵니다.
    """
    results = _fetch_from_db(lat, lon, radius)
    
    if not results:
        print("[INFO] 해당 지역에 조회된 데이터가 없어 API 실시간 연동을 시도합니다.")
        success = sync_local_stores(lat, lon, radius)
        if success:
            # API에서 가져와 DB에 넣었으므로, 다시 DB에서 조회하여 반환
            results = _fetch_from_db(lat, lon, radius)
            
    return results

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

def sync_local_stores(lat, lon, radius):
    """
    공공데이터 API(storeListInRadius)를 사용해서 특정 위치 주변의 데이터를 가져온 뒤,
    store_master 테이블에 즉시 저장(Upsert)하는 동기화 함수
    """
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
        response = requests.get(API_URL, params=params, verify=False, timeout=10)
        response.raise_for_status()
        data = response.json()
            
        header = data.get("header", {})
        if header.get("resultCode") == "00":
            items = data.get("body", {}).get("items", [])
            if items:
                from modules.sync_stores_batch import upsert_stores_to_db
                upsert_stores_to_db(items)
                return True
        
        print(f"[WARN] API 정상 응답 아님 (데이터 없음 또는 만료). 응답: {str(data)[:100]}")
        return False
        
    except Exception as e:
        print(f"[ERROR] API 호출 실패: {e}")
        return False
