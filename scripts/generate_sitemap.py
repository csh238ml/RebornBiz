import os
import sys
from datetime import datetime

# 상위 폴더 경로 추가 (modules 임포트용)
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PROJECT_DIR)

from modules.database import SessionLocal, RebornBoard

# 서버에 배포될 XML 저장 절대 경로 (로컬 윈도우 테스트 시에는 임시 경로 사용)
if os.name == 'nt':
    SITEMAP_PATH = os.path.join(PROJECT_DIR, 'frontend', 'public', 'sitemap.xml')
else:
    SITEMAP_PATH = '/home/ubuntu/rebornbiz/frontend/public/sitemap.xml'

BASE_URL = "https://rebornbiz.co.kr"

# 정적 페이지 라우팅 경로 (현재 Streamlit 실제 파일 구조 기준)
STATIC_PAGES = [
    "/",
    "/calculator",
    "/tax_cal",
    "/simulation",
    "/market_analysis",
    "/statistics"
]

def generate_sitemap():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 사이트맵 생성을 시작합니다...")
    
    # 1. XML 헤더 및 urlset 시작
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    # 2. 정적 페이지 추가
    for page in STATIC_PAGES:
        url = f"{BASE_URL}{page}"
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{url}</loc>")
        xml_lines.append(f"    <lastmod>{today_str}</lastmod>")
        xml_lines.append("    <changefreq>weekly</changefreq>")
        xml_lines.append("    <priority>0.8</priority>")
        xml_lines.append("  </url>")
        
    # 3. 동적 페이지 (게시판) 추가
    db = SessionLocal()
    try:
        # 최신 글이 위로 오도록 가져옴
        posts = db.query(RebornBoard).order_by(RebornBoard.id.desc()).all()
        
        for post in posts:
            url = f"{BASE_URL}/magazine/{post.id}"
            # created_at 값을 YYYY-MM-DD 형식으로 변환 (nullable 안전 장치)
            lastmod_str = post.created_at.strftime("%Y-%m-%d") if post.created_at else today_str
            
            xml_lines.append("  <url>")
            xml_lines.append(f"    <loc>{url}</loc>")
            xml_lines.append(f"    <lastmod>{lastmod_str}</lastmod>")
            xml_lines.append("    <changefreq>weekly</changefreq>")
            xml_lines.append("    <priority>0.6</priority>")
            xml_lines.append("  </url>")
            
        print(f"  - 동적 게시글 {len(posts)}개 추가 완료.")
            
    except Exception as e:
        print(f"[오류] 데이터베이스 조회 실패: {str(e)}")
        sys.exit(1)
    finally:
        db.close()
        
    # 4. urlset 종료
    xml_lines.append("</urlset>")
    
    # 5. XML 파일 쓰기
    try:
        with open(SITEMAP_PATH, 'w', encoding='utf-8') as f:
            f.write('\n'.join(xml_lines))
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 사이트맵 생성 완료! (경로: {SITEMAP_PATH})")
    except Exception as e:
        print(f"[오류] 파일 저장 실패 ({SITEMAP_PATH}): {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    generate_sitemap()
