import sys
import os
import urllib3
import requests
import urllib.parse
from sqlalchemy.dialects.mysql import insert

# 모듈 경로 설정을 위해 프로젝트 루트를 sys.path에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modules.database import SessionLocal, IndustryMaster

# InsecureRequestWarning 숨기기 (공공데이터포털 SSL 인증서 이슈 우회)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 요청하신 새로운 API URL (odcloud 표준데이터)
API_URL = "https://api.odcloud.kr/api/15067631/v1/uddi:25e5510c-001c-41e5-9f93-80ad8faba582"
API_KEY = "FmRJggnPbuErC7S3g3D1K51bawXyTDd7hh/JZP+dkyl5OdU79rlNJ+NZWXUfncUYfKzWtgUj8Ks6oxWvRQdPSg=="

def fetch_and_sync_industry_codes():
    print("[INFO] 업종코드 API 동기화 시작...")
    
    # API 키 URL 디코딩
    decoded_key = urllib.parse.unquote(API_KEY)
    params = {
        "serviceKey": decoded_key, # odcloud는 serviceKey 소문자 선호
        "page": 1,
        "perPage": 10000
    }
    
    try:
        # 공공데이터포털 일부 API의 SSL 인증서 만료/검증 실패 이슈를 피하기 위해 verify=False 추가
        response = requests.get(API_URL, params=params, verify=False)
        response.raise_for_status()
        
        try:
            data = response.json()
        except ValueError:
            print(f"[ERROR] JSON 파싱 실패. API 응답이 JSON 형식이 아닙니다.\n응답 내용: {response.text[:200]}")
            return
            
        # api.odcloud.kr 표준데이터 응답 구조는 "data" 필드에 리스트로 제공됨
        items = data.get("data", [])
        
        # 만약 data 필드가 없고 예외적인 에러 응답이라면 (예: 인증키 오류)
        if not items and data.get("code") and data.get("code") < 0:
            print(f"[ERROR] API 에러 응답: {data}")
            return
            
        if not items:
            # 구버전이나 다른 형식의 OpenAPI일 경우 대비
            items = data.get("body", {}).get("items", [])
            
        if not items:
            print(f"[WARN] API에서 가져올 데이터가 없습니다. 응답 데이터 일부: {str(data)[:200]}")
            return
            
        print(f"[INFO] 총 {len(items)}개의 업종코드를 가져왔습니다. DB 저장을 시작합니다.")
        
        db = SessionLocal()
        try:
            # MySQL 전용 ON DUPLICATE KEY UPDATE
            stmt = insert(IndustryMaster)
            
            # 업데이트할 컬럼 지정 (기본키 제외)
            update_dict = {
                "large_cat_code": stmt.inserted.large_cat_code,
                "large_cat_name": stmt.inserted.large_cat_name,
                "medium_cat_code": stmt.inserted.medium_cat_code,
                "medium_cat_name": stmt.inserted.medium_cat_name,
                "small_cat_name": stmt.inserted.small_cat_name
            }
            
            upsert_stmt = stmt.on_duplicate_key_update(**update_dict)
            
            db_values = []
            for item in items:
                # odcloud 공공데이터포털 데이터셋(csv 헤더 기반)의 한글 컬럼명 또는 영문 컬럼명 매핑
                indsLclsCd = item.get("대분류코드", "")
                indsLclsNm = item.get("대분류명", item.get("대분류", ""))
                indsMclsCd = item.get("중분류코드", "")
                indsMclsNm = item.get("중분류명", item.get("중분류", ""))
                indsSclsCd = item.get("소분류코드", "")
                indsSclsNm = item.get("소분류명", item.get("소분류", ""))
                
                # 식별자(코드)가 없는 데이터는 무시
                if not indsSclsCd:
                    continue
                    
                db_values.append({
                    "large_cat_code": indsLclsCd,
                    "large_cat_name": indsLclsNm,
                    "medium_cat_code": indsMclsCd,
                    "medium_cat_name": indsMclsNm,
                    "small_cat_code": indsSclsCd,
                    "small_cat_name": indsSclsNm
                })
            
            if db_values:
                # DB Bulk Execute
                db.execute(upsert_stmt, db_values)
                db.commit()
                print(f"[SUCCESS] 업종코드 {len(db_values)}건 동기화 및 DB 업데이트 완료.")
            else:
                print("[WARN] 유효한 업종코드 데이터(코드값 존재)가 없습니다.")
                
        except Exception as e:
            db.rollback()
            print(f"[ERROR] DB 업데이트 중 오류 발생: {e}")
        finally:
            db.close()
            
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] API 호출 실패: {e}")

if __name__ == "__main__":
    fetch_and_sync_industry_codes()
