import sys
import os
import requests
import urllib3
from dotenv import load_dotenv

# SSL 경고 무시
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 상위 폴더 경로를 sys.path에 추가하여 modules 패키지 임포트 허용
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modules.database import SessionLocal, IndustryMetrics, init_db

# 기존 Fallback(템플릿)의 기본 마진과 초기비용을 보존하기 위한 딕셔너리
DEFAULT_METRICS = {
    "커피전문점": {"margin": 25, "setup": 5000},
    "한식음식점": {"margin": 20, "setup": 8000},
    "치킨전문점": {"margin": 18, "setup": 4500},
    "편의점": {"margin": 10, "setup": 7000},
    "의류소매점": {"margin": 30, "setup": 4000},
    "미용실": {"margin": 35, "setup": 6000},
    "제과점": {"margin": 22, "setup": 8500},
    "패스트푸드": {"margin": 15, "setup": 9000},
    "피트니스센터": {"margin": 40, "setup": 15000},
    "약국": {"margin": 12, "setup": 12000},
    "기타": {"margin": 20, "setup": 5000}
}

def fetch_ftc_data():
    """공정거래위원회 가맹사업 통계 API에서 데이터를 가져옵니다."""
    API_KEY = "FmRJggnPbuErC7S3g3D1K51bawXyTDd7hh/JZP+dkyl5OdU79rlNJ+NZWXUfncUYfKzWtgUj8Ks6oxWvRQdPSg=="
    url = f"https://apis.data.go.kr/1130000/FftcBrandFrcsStatsService/getBrandFrcsStats?serviceKey={API_KEY}"
    
    # pageNo=1, numOfRows=100 (가맹사업 통계는 데이터양이 많을 수 있음)
    params = {
        "pageNo": 1,
        "numOfRows": 1000,
        "resultType": "json"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10, verify=False)
        if response.status_code == 200:
            data = response.json()
            # items 구조 파악
            if "items" in data:
                return data["items"]
            elif "response" in data and "body" in data["response"] and "items" in data["response"]["body"]:
                return data["response"]["body"]["items"]
            elif "items" in data.get("body", {}):
                return data["body"]["items"]
            elif isinstance(data, list):
                return data
            else:
                print("API 응답에서 items를 찾을 수 없습니다.")
                return []
        else:
            print(f"API 호출 실패: 상태코드 {response.status_code}")
            return []
    except Exception as e:
        print(f"API 호출 중 예외 발생: {e}")
        return []

def extract_core_keyword(ind_name):
    """업종명에서 핵심 키워드(템플릿 매핑 키) 추출"""
    keywords_map = {
        "커피": "커피전문점", "카페": "커피전문점", "음료": "커피전문점",
        "한식": "한식음식점", "국수": "한식음식점", "백반": "한식음식점", "고기": "한식음식점", "찌개": "한식음식점",
        "치킨": "치킨전문점", "통닭": "치킨전문점", "호프": "치킨전문점",
        "편의점": "편의점", "마트": "편의점", "슈퍼": "편의점",
        "의류": "의류소매점", "옷": "의류소매점", "패션": "의류소매점", "복장": "의류소매점",
        "미용": "미용실", "헤어": "미용실", "이발": "미용실", "뷰티": "미용실",
        "제과": "제과점", "빵": "제과점", "베이커리": "제과점", "디저트": "제과점",
        "패스트푸드": "패스트푸드", "버거": "패스트푸드", "피자": "패스트푸드", "샌드위치": "패스트푸드",
        "피트니스": "피트니스센터", "헬스": "피트니스센터", "운동": "피트니스센터", "요가": "피트니스센터", "필라테스": "피트니스센터",
        "약국": "약국", "의약": "약국"
    }
    for keyword, template_key in keywords_map.items():
        if keyword in ind_name:
            return template_key
    return "기타"

def sync_industry_metrics():
    print("--- 공정위 가맹사업 통계 API 동기화 시작 ---")
    
    # DB 초기화 확인
    init_db()
    
    items = fetch_ftc_data()
    if not items:
        print("수집된 데이터가 없습니다. 동기화를 종료합니다.")
        return
        
    print(f"총 {len(items)}건의 통계 항목을 조회했습니다. 매출 데이터 추출 중...")
    
    # 업종별 매출 데이터 집계 (같은 업종 키워드에 속하는 브랜드들의 평균 매출 계산)
    industry_sales = {}
    for item in items:
        # 공정위 API 구조에 따라 'indutyMlsfcNm', 'indutyLclasNm' 또는 중첩된 item 속성을 확인
        induty_name = item.get("indutyMlsfcNm") or item.get("indutyLclasNm") or ""
        
        # 연평균매출금액 (천원 단위)
        avrg_sls_amt_str = item.get("avrgSlsAmt", "0")
        
        try:
            avrg_sls_amt = float(avrg_sls_amt_str)
            if avrg_sls_amt > 0 and induty_name:
                template_key = extract_core_keyword(induty_name)
                if template_key not in industry_sales:
                    industry_sales[template_key] = []
                industry_sales[template_key].append(avrg_sls_amt)
        except ValueError:
            continue
            
    if not industry_sales:
        print("유효한 매출 데이터를 추출하지 못했습니다. (API 결과 내에 avrgSlsAmt 필드가 없거나 모두 0일 수 있습니다)")
        return
        
    db = SessionLocal()
    try:
        updated_count = 0
        inserted_count = 0
        
        for template_key, sales_list in industry_sales.items():
            # 평균 연매출 (천원)
            avg_yearly_sales_krw_thousands = sum(sales_list) / len(sales_list)
            
            # 월평균 매출액 (만원 단위) = (연매출(천원) * 1000) / 12 / 10000 = 연매출(천원) / 120
            avg_monthly_sales_manwon = int(avg_yearly_sales_krw_thousands / 120)
            
            # 기본값 설정
            default_margin = DEFAULT_METRICS.get(template_key, DEFAULT_METRICS["기타"])["margin"]
            default_setup = DEFAULT_METRICS.get(template_key, DEFAULT_METRICS["기타"])["setup"]
            
            # DB 레코드 확인 (Upsert 로직)
            record = db.query(IndustryMetrics).filter(IndustryMetrics.industry_name == template_key).first()
            if record:
                # 기존 데이터 업데이트: 매출만 갱신하고 이익률과 창업비용은 기존값 유지 (0인 경우에만 기본값 세팅)
                record.avg_sales = avg_monthly_sales_manwon
                if not record.avg_margin_rate:
                    record.avg_margin_rate = default_margin
                if not record.setup_cost:
                    record.setup_cost = default_setup
                updated_count += 1
                print(f"[UPDATE] {template_key} -> 월 평균 매출 {avg_monthly_sales_manwon} 만원 갱신")
            else:
                # 신규 데이터 삽입
                new_record = IndustryMetrics(
                    industry_name=template_key,
                    avg_sales=avg_monthly_sales_manwon,
                    avg_margin_rate=default_margin,
                    setup_cost=default_setup
                )
                db.add(new_record)
                inserted_count += 1
                print(f"[INSERT] {template_key} -> 월 평균 매출 {avg_monthly_sales_manwon} 만원 신규 등록")
                
        db.commit()
        print(f"동기화 완료: 신규 삽입 {inserted_count}건, 업데이트 {updated_count}건")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] DB 동기화 중 오류 발생: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    sync_industry_metrics()
