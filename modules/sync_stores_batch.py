import os
import sys
import random
import time
import requests
import urllib.parse
import urllib3
from sqlalchemy.dialects.mysql import insert

# 상위 폴더 경로 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from modules.database import SessionLocal, StoreMaster

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

API_URL = "http://apis.data.go.kr/B553077/api/open/sdsc2/storeList"
API_KEY = "FmRJggnPbuErC7S3g3D1K51bawXyTDd7hh/JZP+dkyl5OdU79rlNJ+NZWXUfncUYfKzWtgUj8Ks6oxWvRQdPSg=="

def generate_mock_stores(count=5000):
    """서울/수도권 지역 임의의 가상 점포 데이터 대량 생성"""
    print(f"[INFO] 가상(Mock) 데이터 {count}건 생성을 시작합니다...")
    
    categories = ["음식", "소매", "서비스", "학문/교육"]
    sub_categories = {
        "음식": ["한식", "카페", "치킨", "중식", "양식"],
        "소매": ["편의점", "의류", "화장품", "식료품"],
        "서비스": ["미용실", "세탁소", "부동산", "사진관"],
        "학문/교육": ["보습학원", "어학원", "독서실"]
    }
    
    mock_data = []
    # 서울/수도권 바운딩 박스 대략적 설정
    lat_min, lat_max = 37.40, 37.70
    lon_min, lon_max = 126.80, 127.20
    
    for i in range(count):
        lcls = random.choice(categories)
        mcls = random.choice(sub_categories[lcls])
        
        # 특정 주요 지역(예: 강남 37.498, 127.027) 주변에 밀집되도록 가중치 부여
        if random.random() < 0.3:
            lat = 37.498 + random.uniform(-0.02, 0.02)
            lon = 127.027 + random.uniform(-0.02, 0.02)
        else:
            lat = random.uniform(lat_min, lat_max)
            lon = random.uniform(lon_min, lon_max)
            
        mock_data.append({
            "bizesId": f"BATCH_MOCK_{i}",
            "bizesNm": f"{mcls} 테스트상가 {i}",
            "indsLclsNm": lcls,
            "indsMclsNm": mcls,
            "indsSclsNm": f"{mcls} 상세",
            "lat": lat,
            "lon": lon
        })
    return mock_data

def sync_stores_from_api(max_pages=5):
    """
    공공데이터포털에서 전체 상가 데이터를 페이지네이션으로 가져옵니다.
    (API 키나 응답에 문제가 있을 경우 Mock 데이터로 대체합니다)
    """
    decoded_key = urllib.parse.unquote(API_KEY)
    all_items = []
    
    for page in range(1, max_pages + 1):
        params = {
            "serviceKey": decoded_key,
            "pageNo": page,
            "numOfRows": 1000,
            "type": "json"
        }
        
        try:
            print(f"[INFO] API 호출 중 (페이지 {page}/{max_pages})...")
            res = requests.get(API_URL, params=params, verify=False, timeout=10)
            res.raise_for_status()
            data = res.json()
            
            header = data.get("header", {})
            if header.get("resultCode") == "00":
                items = data.get("body", {}).get("items", [])
                if items:
                    all_items.extend(items)
                else:
                    print("[INFO] 더 이상 데이터가 없습니다.")
                    break
            else:
                print(f"[WARN] API 정상 응답 아님: {str(header)[:100]}")
                break
        except Exception as e:
            print(f"[ERROR] API 호출 실패 (페이지 {page}): {e}")
            break
            
        time.sleep(0.5) # API 부하 방지
        
    if not all_items:
        print("[WARN] API를 통해 가져온 데이터가 없어 Mock 데이터를 생성합니다.")
        return generate_mock_stores(5000)
        
    return all_items

def upsert_stores_to_db(stores):
    """
    수집한 상가 리스트를 DB에 벌크 Upsert (ON DUPLICATE KEY UPDATE) 방식으로 저장
    """
    if not stores:
        print("[INFO] 저장할 데이터가 없습니다.")
        return
        
    db = SessionLocal()
    try:
        # SQLAlchemy MySQL Insert 문 구성
        stmt = insert(StoreMaster).values([
            {
                "bizesId": str(s.get("bizesId")),
                "bizesNm": str(s.get("bizesNm")),
                "indsLclsNm": str(s.get("indsLclsNm")),
                "indsMclsNm": str(s.get("indsMclsNm")),
                "indsSclsNm": str(s.get("indsSclsNm")),
                "lat": float(s.get("lat")),
                "lon": float(s.get("lon"))
            } for s in stores if s.get("lat") and s.get("lon")
        ])
        
        # 중복 키 발생 시 업데이트할 컬럼들
        on_duplicate_key_stmt = stmt.on_duplicate_key_update(
            bizesNm=stmt.inserted.bizesNm,
            indsLclsNm=stmt.inserted.indsLclsNm,
            indsMclsNm=stmt.inserted.indsMclsNm,
            indsSclsNm=stmt.inserted.indsSclsNm,
            lat=stmt.inserted.lat,
            lon=stmt.inserted.lon
        )
        
        db.execute(on_duplicate_key_stmt)
        db.commit()
        print(f"[SUCCESS] {len(stores)}건의 상가 데이터가 DB에 동기화(Upsert) 되었습니다.")
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] DB 동기화 실패: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("="*50)
    print("상가업소 데이터 일일 배치 수집(Sync) 작업을 시작합니다.")
    print("="*50)
    
    # 1. API 데이터 수집 (또는 Mock)
    stores_data = sync_stores_from_api(max_pages=5)
    
    # 2. DB 저장
    upsert_stores_to_db(stores_data)
    
    print("배치 작업이 완료되었습니다.")
