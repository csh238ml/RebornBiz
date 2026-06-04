import streamlit.components.v1 as components
import os

# 릴리즈 모드 (운영 환경에서는 True, 프론트엔드 개발 시에는 False)
_RELEASE = True

if not _RELEASE:
    kakao_map = components.declare_component(
        "kakao_map",
        url="http://localhost:3001",
    )
else:
    # 현재 스크립트(kakao_component.py)가 있는 디렉토리 (modules 폴더)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # 실제 index.html이 들어있는 폴더 지정
    target_path = os.path.join(current_dir, "kakao_map")
    
    # 서버 터미널 디버깅용 로그 출력
    print(f"[DEBUG] 카카오맵 컴포넌트 폴더 경로: {target_path}")
    print(f"[DEBUG] index.html 실제 존재 여부: {os.path.exists(os.path.join(target_path, 'index.html'))}")
    
    kakao_map = components.declare_component(
        "kakao_map",
        path=target_path
    )
