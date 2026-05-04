import pandas as pd

# 업종별 샘플 데이터
# revenue: 월 평균 매출 (만원)
# margin: 영업이익률 (소수점)
# setup_cost: 초기 세팅 비용 (만원)
INDUSTRY_DATA = {
    "카페": {"revenue": 1500, "margin": 0.15, "setup_cost": 5000},
    "치킨전문점": {"revenue": 2000, "margin": 0.18, "setup_cost": 6000},
    "편의점": {"revenue": 3000, "margin": 0.08, "setup_cost": 4000},
    "배달전문점": {"revenue": 1200, "margin": 0.25, "setup_cost": 2000},
    "무인아이스크림": {"revenue": 800, "margin": 0.35, "setup_cost": 1500},
}

def compare_industries(current_biz: str, target_biz: str, investment: float) -> dict:
    """
    현재 업종과 전환 희망 업종의 수익성을 비교 분석합니다.
    """
    curr_data = INDUSTRY_DATA.get(current_biz, {"revenue": 0, "margin": 0, "setup_cost": 0})
    tgt_data = INDUSTRY_DATA.get(target_biz, {"revenue": 0, "margin": 0, "setup_cost": 0})
    
    # 현재 및 타겟 업종의 월 순이익 계산
    curr_profit = curr_data["revenue"] * curr_data["margin"]
    tgt_profit = tgt_data["revenue"] * tgt_data["margin"]
    
    # 월별 예상 추가 수익
    additional_profit = tgt_profit - curr_profit
    
    # 타겟 업종 세팅 비용
    setup_cost = tgt_data["setup_cost"]
    
    # 투자금 회수 기간 (Months) = 총 소요 비용 / 타겟 월 순이익
    if tgt_profit > 0:
        payback_months = setup_cost / tgt_profit
    else:
        payback_months = float('inf')
        
    return {
        "current_revenue": curr_data["revenue"],
        "current_profit": curr_profit,
        "target_revenue": tgt_data["revenue"],
        "target_profit": tgt_profit,
        "target_setup_cost": setup_cost,
        "additional_profit": additional_profit,
        "payback_months": payback_months,
        "investment": investment
    }
