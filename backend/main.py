import sys
import os
import re
from dotenv import load_dotenv

# Add parent directory to sys.path to access existing modules
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

# Load existing .env file from root
dotenv_path = os.path.join(parent_dir, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from sqlalchemy import or_
from modules.calculators import calculate_closure_cost
# from modules.industry_analyzer import compare_industries # No longer using the dummy analyzer
from modules.database import SessionLocal, GovPolicyGuide, get_board_list, get_board_detail, get_large_categories, get_medium_categories, get_small_categories, get_sido_list, get_sigungu_list, get_dong_list, get_industry_metrics
import requests
from modules.market_api import fetch_stores_in_radius

app = FastAPI(title="RebornBiz Backend API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://www.rebornbiz.co.kr", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CalculateRequest(BaseModel):
    area_pyeong: float
    monthly_rent_manwon: int
    remaining_months: int
    num_employees: int

class SimulateRequest(BaseModel):
    region: str
    current_biz: str
    target_biz: str
    investment: float

class MarketAnalysisRequest(BaseModel):
    lat: float
    lon: float
    radius: int
    address: str

@app.post("/api/calculate")
def api_calculate(req: CalculateRequest):
    monthly_rent_won = req.monthly_rent_manwon * 10000
    results = calculate_closure_cost(
        area_pyeong=req.area_pyeong,
        monthly_rent=monthly_rent_won,
        remaining_months=req.remaining_months,
        num_employees=req.num_employees
    )
    return results

def fetch_seoul_api_sales(dong_name, industry_name):
    api_key = "5567484e5963736838385266797650"
    url = f"http://openapi.seoul.go.kr:8088/{api_key}/json/Vow_Trdar_Selng_Qu/1/1000/"
    try:
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            data = response.json()
            if 'Vow_Trdar_Selng_Qu' in data and 'row' in data['Vow_Trdar_Selng_Qu']:
                for row in data['Vow_Trdar_Selng_Qu']['row']:
                    row_dong = row.get("ADSTRD_CD_NM", "") or row.get("TRDAR_CD_NM", "")
                    row_ind = row.get("SVC_INDUTY_CD_NM", "")
                    if dong_name in row_dong:
                        clean_target = industry_name.replace("/", " ").replace("-", " ")
                        clean_row = row_ind.replace("/", " ").replace("-", " ")
                        is_matched = (clean_target in clean_row or clean_row in clean_target or 
                                      any(word in clean_row for word in clean_target.split() if len(word) > 1))
                        if is_matched:
                            quarter_sales = float(row.get("THSMON_SELNG_AMT", 0))
                            monthly_sales_manwon = (quarter_sales / 3) / 10000
                            store_count = int(row.get("STRE_CO", 0))
                            return {"sales": monthly_sales_manwon, "store_count": store_count}
    except Exception as e:
        print(f"[API ERROR] 서울시 상권 데이터 로드 실패: {e}")
    return None

def extract_core_keyword(ind_name):
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
        "약": "약국", "의약": "약국"
    }
    for keyword, template_key in keywords_map.items():
        if keyword in ind_name:
            return keyword, template_key
    first_word = ind_name.split()[0] if ind_name else "기타"
    return first_word, "기타"

def fetch_nationwide_store_count(dong_name, target_industry):
    API_KEY = "FmRJggnPbuErC7S3g3D1K51bawXyTDd7hh/JZP+dkyl5OdU79rlNJ+NZWXUfncUYfKzWtgUj8Ks6oxWvRQdPSg=="
    url = f"https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong?ServiceKey={API_KEY}"
    core_keyword, _ = extract_core_keyword(target_industry)
    params = {
        "pageNo": 1, "numOfRows": 1, "divId": "adongNm",
        "key": dong_name, "bizesNm": core_keyword, "type": "json"
    }
    try:
        response = requests.get(url, params=params, timeout=3)
        if response.status_code == 200:
            data = response.json()
            if "body" in data and "totalCount" in data["body"]:
                return int(data["body"]["totalCount"])
    except Exception as e:
        print(f"[API ERROR] 전국 상권 데이터 로드 실패: {e}")
    return None

def calculate_simulation(region, budget, curr_industry, target_industry):
    INDUSTRY_TEMPLATE = get_industry_metrics()
    
    def get_industry_data(ind_name):
        _, template_key = extract_core_keyword(ind_name)
        if template_key != "기타":
            return INDUSTRY_TEMPLATE[template_key]
        for key, data in INDUSTRY_TEMPLATE.items():
            if key in ind_name or ind_name in key:
                return data
        return INDUSTRY_TEMPLATE["기타"]

    curr_data = get_industry_data(curr_industry)
    target_data = get_industry_data(target_industry)
    
    curr_sales = curr_data["sales"]
    curr_profit = curr_sales * (curr_data["margin"] / 100)
    
    target_sales = target_data["sales"]
    target_setup = target_data["setup"]
    target_margin = target_data["margin"]
    
    store_count_info = None
    api_source = None

    if "서울특별시" in region:
        dong_name = region.split()[-1] if len(region.split()) > 0 else ""
        api_data = fetch_seoul_api_sales(dong_name, target_industry)
        if api_data and api_data["sales"] > 0:
            target_sales = api_data["sales"]
            store_count_info = api_data["store_count"]
            api_source = "서울시 공공데이터 API"
        else:
            target_sales = target_sales * 1.2
    else:
        dong_name = region.split()[-1] if len(region.split()) > 0 else ""
        nationwide_count = fetch_nationwide_store_count(dong_name, target_industry)
        if nationwide_count is not None and nationwide_count > 0:
            store_count_info = nationwide_count
            api_source = "소상공인시장진흥공단 API"
            if nationwide_count <= 5: weight = 1.15
            elif nationwide_count <= 15: weight = 1.0
            else: weight = 0.85
        else:
            metro_cities = ["부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시", "울산광역시"]
            if any(city in region for city in metro_cities): weight = 1.15
            else: weight = 0.95
        target_sales = target_sales * weight
    
    if budget > target_setup:
        ratio = (budget - target_setup) / target_setup
        sales_boost = ratio * 0.30
        target_sales = target_sales * (1 + sales_boost)
        
    final_monthly_profit = target_sales * (target_margin / 100)
    bep_months = target_setup / final_monthly_profit if final_monthly_profit > 0 else 999
    roi = (final_monthly_profit * 12 / target_setup) * 100 if target_setup > 0 else 0
    additional_profit = final_monthly_profit - curr_profit
    
    # We omit pandas Series/Dataframes to avoid sending complex objects over JSON.
    result = {
        "current_profit": int(curr_profit),
        "target_profit": int(final_monthly_profit),
        "target_setup_cost": int(target_setup),
        "bep_months": round(bep_months, 1),
        "additional_profit": int(additional_profit),
        "roi": round(roi, 1),
        "investment": budget
    }
    
    if store_count_info is not None:
        result["store_count"] = store_count_info
        if api_source:
            result["api_source"] = api_source
        
    return result

@app.post("/api/simulate")
def api_simulate(req: SimulateRequest):
    results = calculate_simulation(
        region=req.region,
        budget=req.investment,
        curr_industry=req.current_biz,
        target_industry=req.target_biz
    )
    return results

# Endpoints for Select Boxes
@app.get("/api/regions/sido")
def api_regions_sido():
    return {"success": True, "data": get_sido_list()}

@app.get("/api/regions/sigungu")
def api_regions_sigungu(sido: str = Query(..., description="시/도 이름")):
    return {"success": True, "data": get_sigungu_list(sido)}

@app.get("/api/regions/dong")
def api_regions_dong(sido: str = Query(...), sigungu: str = Query(...)):
    return {"success": True, "data": get_dong_list(sido, sigungu)}

@app.get("/api/categories/large")
def api_categories_large():
    return {"success": True, "data": get_large_categories()}

@app.get("/api/categories/medium")
def api_categories_medium(large: str = Query(...)):
    return {"success": True, "data": get_medium_categories(large)}

@app.get("/api/categories/small")
def api_categories_small(medium: str = Query(...)):
    return {"success": True, "data": get_small_categories(medium)}

@app.get("/api/policies")
def api_policies(search: Optional[str] = None):
    db = SessionLocal()
    try:
        query = db.query(GovPolicyGuide)
        if search:
            query = query.filter(
                or_(
                    GovPolicyGuide.pblanc_nm.like(f'%{search}%'),
                    GovPolicyGuide.bsns_sumry_cn.like(f'%{search}%')
                )
            )
        else:
            query = query.filter(
                or_(
                    GovPolicyGuide.trget_nm.like('%소상공인%'),
                    GovPolicyGuide.pblanc_nm.like('%소상공인%')
                )
            )
        policies = query.order_by(GovPolicyGuide.creat_pnttm.desc()).limit(50).all()
        result = []
        for p in policies:
            def strip_html(text):
                if not text: return ""
                clean = re.compile('<.*?>')
                return re.sub(clean, '', text).strip()
            
            result.append({
                "pblanc_nm": p.pblanc_nm or "제목 없음",
                "jrsd_instt_nm": p.jrsd_instt_nm or "기관 정보 없음",
                "reqst_begin_end_de": p.reqst_begin_end_de or "기간 미정",
                "trget_nm": strip_html(p.trget_nm) if hasattr(p, 'trget_nm') and p.trget_nm else "지원 대상 상세 정보는 공고문 참조",
                "bsns_sumry_cn": strip_html(p.bsns_sumry_cn) or "혜택 상세 정보는 공고문 참조",
                "reqst_mth_papers_cn": strip_html(p.reqst_mth_papers_cn) or "신청 방법은 공식 사이트 확인",
                "pldir_sport_realm_lclas_code_nm": p.pldir_sport_realm_lclas_code_nm or "지원사업",
                "pblanc_url": p.pblanc_url or ""
            })
        return {"success": True, "data": result}
    except Exception as e:
        print(f"Error fetching policies: {e}")
        return {"success": False, "data": []}
    finally:
        db.close()

@app.get("/api/magazine")
def api_magazine(search: Optional[str] = None):
    posts = get_board_list(search)
    data = []
    for p in posts:
        created_dt = p.created_at.strftime("%Y-%m-%d") if p.created_at else ""
        views = p.views if p.views is not None else 0
        data.append({"id": p.id, "title": p.title, "views": views, "created_at": created_dt})
    return {"success": True, "data": data}

@app.get("/api/magazine/{post_id}")
def api_magazine_detail(post_id: int):
    try:
        post = get_board_detail(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        created_dt = post.created_at.strftime("%Y-%m-%d %H:%M") if post.created_at else ""
        views = post.views if post.views is not None else 0
        
        return {
            "success": True,
            "data": {
                "id": post.id,
                "title": post.title,
                "views": views,
                "created_at": created_dt,
                "content_html": post.content_html
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in api_magazine_detail: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/api/market_analysis")
def api_market_analysis(req: MarketAnalysisRequest):
    try:
        stores = fetch_stores_in_radius(req.lat, req.lon, req.radius, req.address)
        return {"success": True, "data": stores}
    except Exception as e:
        print(f"Error fetching stores: {e}")
        return {"success": False, "data": []}

@app.get("/health")
def health_check():
    return {"status": "ok"}
