import os
try:
    import streamlit as st
    HAS_STREAMLIT = True
except ImportError:
    st = None
    HAS_STREAMLIT = False

def cache_data_fallback(*args, **kwargs):
    def decorator(func):
        return func
    return decorator

st_cache_data = st.cache_data if HAS_STREAMLIT else cache_data_fallback
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import datetime
import pytz

# .env 파일에서 환경변수 로드
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT", "3306")

# MySQL 연결 문자열 (pymysql 드라이버 사용)
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# 엔진 생성 (echo=False로 설정하여 쿼리 로그 생략 가능)
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Users 테이블 정의
class User(Base):
    __tablename__ = "Users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Simulations 테이블 정의
class Simulation(Base):
    __tablename__ = "Simulations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.id"))
    current_biz = Column(String(50))
    target_biz = Column(String(50))
    investment = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 업종 마스터 테이블 정의
class IndustryMaster(Base):
    __tablename__ = "industry_master"
    
    large_cat_code = Column(String(20))
    large_cat_name = Column(String(100))
    medium_cat_code = Column(String(20))
    medium_cat_name = Column(String(100))
    small_cat_code = Column(String(20), primary_key=True, index=True)
    small_cat_name = Column(String(100))
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 상가(점포) 데이터 마스터 테이블 (배치 수집용)
class StoreMaster(Base):
    __tablename__ = "store_master"
    
    bizesId = Column(String(50), primary_key=True, index=True)
    bizesNm = Column(String(255))
    indsLclsNm = Column(String(100))
    indsMclsNm = Column(String(100))
    indsSclsNm = Column(String(100))
    lat = Column(Float, index=True)
    lon = Column(Float, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 지역 데이터 마스터 테이블 정의
class RegionMaster(Base):
    __tablename__ = "region_master"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sido_name = Column(String(50), index=True)
    sigungu_name = Column(String(50), index=True)
    dong_name = Column(String(50), index=True)
    sort_order = Column(Integer, default=0)

# 업종 시뮬레이션 지표 테이블 정의
class IndustryMetrics(Base):
    __tablename__ = "industry_metrics"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    industry_name = Column(String(100), unique=True, index=True)
    avg_sales = Column(Integer)  # 월 평균 매출액 (만원 단위)
    avg_margin_rate = Column(Integer) # 평균 영업이익률 (%)
    setup_cost = Column(Integer) # 평균 창업 비용 (만원 단위)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 접속 로그 테이블 정의
class AccessLog(Base):
    __tablename__ = "access_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    access_time = Column(DateTime, default=datetime.datetime.utcnow)
    ip_address = Column(String(100))
    user_agent = Column(String(500))
    accessed_menu = Column(String(100))

# 정부 지원 정책 테이블 정의
class GovPolicyGuide(Base):
    __tablename__ = "gov_policy_guides"
    
    pblanc_id = Column(String(50), primary_key=True)
    pblanc_nm = Column(String(500), nullable=False)
    pblanc_url = Column(Text)
    jrsd_instt_nm = Column(String(255))
    exc_instt_nm = Column(String(255))
    bsns_sumry_cn = Column(Text)
    pldir_sport_realm_lclas_code_nm = Column(String(100), index=True)
    creat_pnttm = Column(DateTime, index=True)
    reqst_begin_end_de = Column(String(255))
    updt_pnttm = Column(DateTime)
    trget_nm = Column(Text)
    inqire_co = Column(Integer, default=0)
    flpth_nm = Column(Text)
    file_nm = Column(String(500))
    print_flpth_nm = Column(Text)
    print_file_nm = Column(String(500))
    hashtags = Column(Text)
    reqst_mth_papers_cn = Column(Text)
    refrnc_nm = Column(Text)
    rcept_engn_hmpg_url = Column(Text)
    fetched_at = Column(DateTime, default=datetime.datetime.utcnow)
    
# Reborn 매거진 (게시판) 테이블 정의
class RebornBoard(Base):
    __tablename__ = "reborn_board"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    content_html = Column(Text, nullable=False)
    views = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    """DB 연결을 확인하고 테이블을 자동 생성합니다."""
    try:
        # DB 연결 확인
        with engine.connect() as connection:
            print("[SUCCESS] AWS RDS (MySQL) 연결에 성공했습니다!")
            
        # 테이블 생성 (이미 존재하면 무시됨)
        Base.metadata.create_all(bind=engine)
        print("[SUCCESS] 데이터베이스 테이블 초기화 완료.")
        
        # 더미 데이터 삽입 (게시글이 없을 경우)
        with SessionLocal() as db:
            if db.query(RebornBoard).count() == 0:
                dummy1 = RebornBoard(
                    title="2026년 소상공인 폐업 지원금 완벽 가이드",
                    content_html="""
                    <h3>폐업지원금 최대 250만원 지원</h3>
                    <p>정부에서 제공하는 희망리턴패키지를 통해 폐업 시 발생하는 철거비와 원상복구 비용을 지원받을 수 있습니다.</p>
                    <p>자세한 신청 방법과 필요 서류는 관할 센터에 문의하세요.</p>
                    """
                )
                dummy2 = RebornBoard(
                    title="상권 분석: 어느 동네가 요즘 뜨고 있을까?",
                    content_html="""
                    <h3>성공적인 재창업을 위한 상권 분석</h3>
                    <p>최근 실거래가 데이터와 유동인구 데이터를 기반으로 한 최신 상권 트렌드를 분석합니다.</p>
                    <p>특히 수도권 주요 상권의 매출액 증가 추이를 눈여겨 보세요!</p>
                    """
                )
                db.add_all([dummy1, dummy2])
                db.commit()
                print("[INFO] 매거진 더미 데이터 삽입 완료.")
                
    except Exception as e:
        print(f"[ERROR] DB 연결 실패: {e}")

# ==========================================
# Reborn 매거진 (게시판) 데이터 접근 로직
# ==========================================

def get_board_list(search_term=None):
    """게시판 리스트 조회 (검색 필터 포함)"""
    db = SessionLocal()
    try:
        query = db.query(RebornBoard)
        if search_term:
            query = query.filter(RebornBoard.title.like(f"%{search_term}%"))
        return query.order_by(RebornBoard.created_at.desc()).all()
    except Exception as e:
        print(f"[ERROR] 매거진 리스트 조회 실패: {e}")
        return []
    finally:
        db.close()

def get_board_detail(post_id):
    """게시판 단건 상세 조회 (조회수 증가 포함)"""
    db = SessionLocal()
    try:
        post = db.query(RebornBoard).filter(RebornBoard.id == post_id).first()
        if post:
            post.views += 1
            db.commit()
            db.refresh(post)
        return post
    except Exception as e:
        print(f"[ERROR] 매거진 상세 조회 실패: {e}")
        return None
    finally:
        db.close()

@st_cache_data(show_spinner=False)
def get_large_categories():
    """DB에서 대분류 목록을 조회합니다."""
    db = SessionLocal()
    try:
        results = db.query(IndustryMaster.large_cat_name).distinct().all()
        return sorted([r[0] for r in results if r[0]])
    except Exception as e:
        print(f"[ERROR] 대분류 조회 에러: {e}")
        return []
    finally:
        db.close()

@st_cache_data(show_spinner=False)
def get_medium_categories(large_cat_name):
    """선택된 대분류에 속하는 중분류 목록을 조회합니다."""
    if not large_cat_name:
        return []
    db = SessionLocal()
    try:
        results = db.query(IndustryMaster.medium_cat_name).filter(
            IndustryMaster.large_cat_name == large_cat_name
        ).distinct().all()
        return sorted([r[0] for r in results if r[0]])
    except Exception as e:
        print(f"[ERROR] 중분류 조회 에러: {e}")
        return []
    finally:
        db.close()

@st_cache_data(show_spinner=False)
def get_small_categories(medium_cat_name):
    """선택된 중분류에 속하는 소분류 목록을 조회합니다."""
    if not medium_cat_name:
        return []
    db = SessionLocal()
    try:
        results = db.query(IndustryMaster.small_cat_name).filter(
            IndustryMaster.medium_cat_name == medium_cat_name
        ).distinct().all()
        return sorted([r[0] for r in results if r[0]])
    except Exception as e:
        print(f"[ERROR] 소분류 조회 에러: {e}")
        return []
    finally:
        db.close()

@st_cache_data(show_spinner=False)
def get_sido_list():
    """DB에서 시/도 목록을 조회합니다."""
    db = SessionLocal()
    try:
        # distinct() 사용 시 충돌을 막기 위해 쿼리를 수정하고 sort_order로 정렬
        results = db.query(RegionMaster.sido_name, RegionMaster.sort_order)\
                    .filter(RegionMaster.sido_name.isnot(None))\
                    .distinct()\
                    .order_by(RegionMaster.sort_order.asc())\
                    .all()
        
        # 튜플에서 이름(r[0])만 추출하여 리스트로 반환 (이미 정렬되어 있으므로 sorted 불필요)
        return [r[0] for r in results if r[0]]
    except Exception as e:
        print(f"[ERROR] 시/도 조회 에러: {e}")
        return []
    finally:
        db.close()

@st_cache_data(show_spinner=False)
def get_sigungu_list(sido_name):
    """선택된 시/도에 속하는 시/군/구 목록을 조회합니다. (sort_order 오름차순)"""
    if not sido_name:
        return []
    db = SessionLocal()
    try:
        results = db.query(RegionMaster.sigungu_name, RegionMaster.sort_order).filter(
            RegionMaster.sido_name == sido_name,
            RegionMaster.sigungu_name.isnot(None)
        ).distinct().order_by(RegionMaster.sort_order.asc()).all()
        
        seen = set()
        sigungu_list = []
        for r in results:
            if r[0] and r[0] not in seen:
                sigungu_list.append(r[0])
                seen.add(r[0])
        return sigungu_list
    except Exception as e:
        print(f"[ERROR] 시/군/구 조회 에러: {e}")
        return []
    finally:
        db.close()

@st_cache_data(show_spinner=False)
def get_dong_list(sido_name, sigungu_name):
    """선택된 시/도, 시/군/구에 속하는 읍/면/동 목록을 조회합니다."""
    if not sido_name or not sigungu_name:
        return []
    db = SessionLocal()
    try:
        results = db.query(RegionMaster.dong_name).filter(
            RegionMaster.sido_name == sido_name,
            RegionMaster.sigungu_name == sigungu_name,
            RegionMaster.dong_name.isnot(None)
        ).distinct().all()
        return sorted([r[0] for r in results if r[0]])
    except Exception as e:
        print(f"[ERROR] 읍/면/동 조회 에러: {e}")
        return []
    finally:
        db.close()

def st_cache_data_fallback(func):
    if HAS_STREAMLIT:
        return st.cache_data(show_spinner=False, ttl=3600)(func)
    return func

@st_cache_data_fallback
def get_industry_metrics():
    """DB에서 업종 지표를 조회합니다. DB가 비어있으면 기본 하드코딩 데이터를 반환합니다."""
    # 1. Fallback / Seed 데이터 정의
    default_metrics = {
        "커피전문점": {"sales": 1500, "margin": 25, "setup": 5000},
        "한식음식점": {"sales": 3000, "margin": 20, "setup": 8000},
        "치킨전문점": {"sales": 2500, "margin": 18, "setup": 4500},
        "편의점": {"sales": 4000, "margin": 10, "setup": 7000},
        "의류소매점": {"sales": 1200, "margin": 30, "setup": 4000},
        "미용실": {"sales": 1800, "margin": 35, "setup": 6000},
        "제과점": {"sales": 2200, "margin": 22, "setup": 8500},
        "패스트푸드": {"sales": 3500, "margin": 15, "setup": 9000},
        "피트니스센터": {"sales": 2800, "margin": 40, "setup": 15000},
        "약국": {"sales": 5000, "margin": 12, "setup": 12000},
        "기타": {"sales": 2000, "margin": 20, "setup": 5000}
    }
    
    db = SessionLocal()
    try:
        results = db.query(IndustryMetrics).all()
        if not results:
            return default_metrics
            
        metrics_dict = {}
        for row in results:
            metrics_dict[row.industry_name] = {
                "sales": row.avg_sales,
                "margin": row.avg_margin_rate,
                "setup": row.setup_cost
            }
            
        # DB에 '기타' 업종이 없을 경우 Fallback의 기타 데이터 삽입
        if "기타" not in metrics_dict:
            metrics_dict["기타"] = default_metrics["기타"]
            
        return metrics_dict
    except Exception as e:
        print(f"[ERROR] 업종 지표 DB 조회 실패: {e}")
        return default_metrics
    finally:
        db.close()

def get_client_info():
    """Streamlit 컨텍스트에서 Nginx 프록시 환경을 고려하여 실제 클라이언트 IP와 브라우저 정보를 추출합니다."""
    ip_address = "Unknown"
    user_agent = "Unknown"
    
    try:
        if HAS_STREAMLIT and hasattr(st, "context") and hasattr(st.context, "headers"):
            headers = st.context.headers
            
            # X-Forwarded-For에서 우선 추출 (Nginx 프록시 환경)
            x_forwarded_for = headers.get("X-Forwarded-For")
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(",")[0].strip()
            else:
                x_real_ip = headers.get("X-Real-IP")
                if x_real_ip:
                    ip_address = x_real_ip
                
            user_agent = headers.get("User-Agent", "Unknown")
    except Exception as e:
        print(f"[ERROR] 클라이언트 정보 추출 실패: {e}")
        
    return ip_address, user_agent

def log_page_access(menu_name):
    """현재 접속한 사용자의 정보를 추출하여 access_logs 테이블에 비동기적으로(또는 예외 처리 후) 기록합니다."""
    try:
        ip_address, user_agent = get_client_info()
        
        # 명시적으로 한국 시간(KST) 생성
        kst = pytz.timezone('Asia/Seoul')
        kst_now = datetime.datetime.now(kst)
        
        db = SessionLocal()
        new_log = AccessLog(
            access_time=kst_now,
            ip_address=ip_address,
            user_agent=user_agent,
            accessed_menu=menu_name
        )
        db.add(new_log)
        db.commit()
    except Exception as e:
        print(f"[ERROR] 페이지 접속 로깅 실패: {e}")
    finally:
        if 'db' in locals():
            db.close()
