import streamlit as st
import os
import sys
import re

# 상위 폴더 경로 추가 (모듈 임포트용)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modules.components import inject_global_css, render_footer, set_custom_sidebar, inject_seo_tags
from modules.database import get_board_list, get_board_detail

post_id_param = st.query_params.get("post_id")
current_post = None

if post_id_param:
    try:
        current_post = get_board_detail(int(post_id_param))
    except ValueError:
        pass

# 1. 페이지 설정 (동적 타이틀 적용)
if current_post:
    st.set_page_config(page_title=f"{current_post.title} | Reborn 매거진", page_icon="📰", layout="wide")
else:
    st.set_page_config(page_title="Reborn 매거진 | RebornBiz", page_icon="📰", layout="wide")

# 2. 커스텀 사이드바 로드, 글로벌 CSS 및 SEO 태그 주입
set_custom_sidebar()
inject_global_css()

if current_post:
    # 정규식으로 HTML 태그 완전 제거 후 첫 150글자 추출
    clean_text = re.sub(r'<[^>]+>', '', current_post.content_html)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    seo_desc = clean_text[:150] + ("..." if len(clean_text) > 150 else "")
    inject_seo_tags(title=f"{current_post.title} | Reborn 매거진", description=seo_desc)
else:
    inject_seo_tags(title="Reborn 매거진 | RebornBiz", description="소상공인을 위한 최신 정책, 창업 가이드, 그리고 상권 분석 인사이트를 만나보세요.")

def show_list_view():
    st.title("📰 [매거진] Reborn 매거진")
    st.markdown("""
    소상공인을 위한 최신 정책, 창업 가이드, 그리고 상권 분석 인사이트를 만나보세요.  
    빠르게 변화하는 트렌드를 확인하고 성공적인 비즈니스를 준비하세요!
    """)
    st.divider()
    
    # 검색창
    col1, col2 = st.columns([8.5, 1.5])
    with col1:
        search_term = st.text_input("검색어를 입력하세요", placeholder="예: 지원금, 상권 분석 등", label_visibility="collapsed")
    with col2:
        st.button("🔍 검색", use_container_width=True)
    
    # 게시글 데이터 조회
    posts = get_board_list(search_term)
    
    if not posts:
        st.info("검색 결과가 없습니다.")
    else:
        st.markdown("<br>", unsafe_allow_html=True)
        # 게시글 리스트 렌더링 (아싸 스타일 카드)
        for post in posts:
            created_date = post.created_at.strftime("%Y-%m-%d")
            st.markdown(f"""
            <div class="reborn-card" style="margin-bottom: 15px; padding: 20px; transition: transform 0.2s;">
                <a href="?post_id={post.id}" target="_self" style="text-decoration: none;">
                    <h3 style="color: #1E3A8A; margin-top: 0; font-size: 1.3rem;">{post.title}</h3>
                    <div style="color: #888; font-size: 0.9rem; margin-top: 10px;">
                        <span>📅 {created_date}</span>
                        <span style="margin-left: 15px;">👁️ 조회수 {post.views}</span>
                    </div>
                </a>
            </div>
            """, unsafe_allow_html=True)

def show_detail_view(post):
    if not post:
        st.error("게시글을 찾을 수 없거나 삭제되었습니다.")
        if st.button("⬅️ 목록으로 돌아가기"):
            st.query_params.clear()
            st.rerun()
        return

    import streamlit.components.v1 as components
    


    def render_buttons(key_prefix):
        col1, col2, col3 = st.columns([7.4, 1.3, 1.3])
        with col2:
            st.markdown("""
            <div style="margin-top: 0px;">
                <a href="?" target="_self" style="text-decoration: none;">
                    <button style="
                        background-color: #fff; 
                        color: #333; 
                        border: 1px solid #ccc; 
                        border-radius: 6px; 
                        cursor: pointer; 
                        font-weight: bold;
                        font-size: 0.95rem;
                        height: 38px;
                        width: 100%;
                        white-space: nowrap;
                        font-family: sans-serif;
                        padding: 0;
                        margin: 0;
                    ">⬅️ 목록으로</button>
                </a>
            </div>
            """, unsafe_allow_html=True)
        with col3:
            # 복사 버튼은 onclick 이벤트를 위해 iframe 사용
            components.html("""
            <body style="margin: 0; padding: 0; overflow: hidden;">
                <button onclick="copyToClipboard()" style="
                    background-color: #FF8C42; 
                    color: white; 
                    border: none; 
                    border-radius: 6px; 
                    cursor: pointer; 
                    font-weight: bold;
                    font-size: 0.95rem;
                    height: 38px;
                    width: 100%;
                    white-space: nowrap;
                    font-family: sans-serif;
                    padding: 0;
                    margin: 0;
                ">🔗 링크 복사</button>
                <script>
                function copyToClipboard() {
                    var url = window.parent.location.href;
                    navigator.clipboard.writeText(url).then(function() {
                        alert('링크가 복사되었습니다!');
                    }).catch(function(err) {
                        var dummy = document.createElement('input');
                        document.body.appendChild(dummy);
                        dummy.value = url;
                        dummy.select();
                        document.execCommand('copy');
                        document.body.removeChild(dummy);
                        alert('링크가 복사되었습니다!');
                    });
                }
                </script>
            </body>
            """, height=38)

    # 상단 버튼 렌더링
    render_buttons("top")

    st.markdown("<hr style='margin-top: 10px; margin-bottom: 20px;'>", unsafe_allow_html=True)
    
    # 제목 및 메타 정보
    st.markdown(f"<h1 style='color: #1E3A8A; margin-bottom: 10px;'>{post.title}</h1>", unsafe_allow_html=True)
    created_date = post.created_at.strftime("%Y-%m-%d %H:%M")
    st.markdown(f"""
    <div style='color: #888; font-size: 0.95rem; margin-bottom: 30px;'>
        <span>📅 작성일: {created_date}</span>
        <span style='margin-left: 15px;'>👁️ 조회수: {post.views}</span>
    </div>
    """, unsafe_allow_html=True)
    
    # 본문 렌더링
    full_html = f"<div style='line-height: 1.6; font-size: 1.1rem;'>{post.content_html}</div>"
    st.html(full_html)
    
    st.markdown("<br><hr style='margin-bottom: 20px;'>", unsafe_allow_html=True)
    
    # 하단 버튼 렌더링
    render_buttons("bottom")
    
    st.markdown("<br><br>", unsafe_allow_html=True)


# 3. 라우팅 로직
if post_id_param:
    show_detail_view(current_post)
else:
    show_list_view()

# 4. 하단 광고 영역
st.html("""
    <div style="
        display: flex; justify-content: center; align-items: center; 
        height: 150px; border: 2px dashed #cccccc; border-radius: 10px; 
        background-color: #f8f9fa; color: #adb5bd; font-family: 'Segoe UI', Tahoma, sans-serif;
        margin-top: 20px; margin-bottom: 20px;">
        <h3>AD Space</h3>
    </div>
""")

# 5. 푸터 렌더링
render_footer()
