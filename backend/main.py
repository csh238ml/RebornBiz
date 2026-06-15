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
from modules.industry_analyzer import compare_industries
from modules.database import SessionLocal, GovPolicyGuide, get_board_list, get_board_detail
from modules.market_api import fetch_stores_in_radius

app = FastAPI(title="RebornBiz Backend API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://rebornbiz.co.kr", "*"],
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

@app.post("/api/simulate")
def api_simulate(req: SimulateRequest):
    results = compare_industries(
        current_biz=req.current_biz,
        target_biz=req.target_biz,
        investment=req.investment
    )
    return results

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
    data = [{"id": p.id, "title": p.title, "views": p.views, "created_at": p.created_at.strftime("%Y-%m-%d")} for p in posts]
    return {"success": True, "data": data}

@app.get("/api/magazine/{post_id}")
def api_magazine_detail(post_id: int):
    try:
        post = get_board_detail(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return {
            "success": True,
            "data": {
                "id": post.id,
                "title": post.title,
                "views": post.views,
                "created_at": post.created_at.strftime("%Y-%m-%d %H:%M"),
                "content_html": post.content_html
            }
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail="Post not found")

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
