import sys
import os
from dotenv import load_dotenv

# Add parent directory to sys.path to access existing modules
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

# Load existing .env file from root
dotenv_path = os.path.join(parent_dir, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

from modules.calculators import calculate_closure_cost
from modules.industry_analyzer import compare_industries

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

@app.get("/health")
def health_check():
    return {"status": "ok"}
