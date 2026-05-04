def calculate_closure_cost(area_pyeong: float, monthly_rent: int, remaining_months: int, num_employees: int) -> dict:
    """
    폐업 시 발생하는 예상 비용을 계산합니다.
    
    Args:
        area_pyeong (float): 매장 평수
        monthly_rent (int): 월 고정 임대료 (원)
        remaining_months (int): 남은 계약 기간 (개월)
        num_employees (int): 직원 수 (명)
        
    Returns:
        dict: 항목별 예상 비용과 최종 합계
    """
    
    # 1. 철거비: 평당 20만 원 (기본값)
    demolition_cost = int(area_pyeong * 200_000)
    
    # 2. 원상복구비: 평당 10만 원
    restoration_cost = int(area_pyeong * 100_000)
    
    # 3. 임대료 위약금: 월세 * 남은 개월 수 * 0.5
    rent_penalty = int(monthly_rent * remaining_months * 0.5)
    
    # 4. 직원 인건비 정산 (예상 퇴직금/위로금 등)
    # ※ 명시된 로직은 없으나 입력값(직원 수)이 있으므로 임의의 평균치(1인당 300만원)로 계산합니다.
    # 필요에 따라 로직을 수정할 수 있습니다.
    labor_cost = num_employees * 3_000_000
    
    # 5. 정부 지원금 (철거비 지원 등 최대 250만 원 차감)
    # 보통 정부 지원금(희망리턴패키지 등)은 철거비 한도 내에서 최대 250만원까지 지원됩니다.
    gov_support = min(demolition_cost, 2_500_000)
    
    # 6. 최종 합계 계산 (비용 합산 후 정부 지원금 차감)
    total_cost = demolition_cost + restoration_cost + rent_penalty + labor_cost - gov_support
    
    # 결과값 반환
    return {
        "철거비": demolition_cost,
        "원상복구비": restoration_cost,
        "임대료 위약금": rent_penalty,
        "인건비 정산": labor_cost,
        "정부 지원금 (차감)": gov_support,
        "최종 예상 합계": total_cost
    }
