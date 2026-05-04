import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import datetime

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

def init_db():
    """DB 연결을 확인하고 테이블을 자동 생성합니다."""
    try:
        # DB 연결 확인
        with engine.connect() as connection:
            print("[SUCCESS] AWS RDS (MySQL) 연결에 성공했습니다!")
            
        # 테이블 생성 (이미 존재하면 무시됨)
        Base.metadata.create_all(bind=engine)
        print("[SUCCESS] 데이터베이스 테이블(Users, Simulations) 초기화 완료.")
    except Exception as e:
        print(f"[ERROR] DB 연결 실패: {e}")
