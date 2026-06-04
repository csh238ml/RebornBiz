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
    # 현재 파이썬 스크립트 파일 위치를 기준으로 프론트엔드 폴더(kakao_map)의 절대 경로 계산
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    kakao_component_path = os.path.join(parent_dir, "kakao_map")
    
    # 서버 터미널 디버깅용 로그 출력
    print(f"[DEBUG] 카카오맵 컴포넌트 폴더 경로: {kakao_component_path}")
    print(f"[DEBUG] index.html 실제 존재 여부: {os.path.exists(os.path.join(kakao_component_path, 'index.html'))}")
    
    kakao_map = components.declare_component(
        "kakao_map",
        path=kakao_component_path
    )
