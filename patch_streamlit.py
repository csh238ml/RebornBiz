import os
import shutil
import streamlit

def patch_streamlit():
    print("Starting Streamlit core patch...")
    
    # 1. Streamlit 정적 파일 경로 찾기
    streamlit_dir = os.path.dirname(streamlit.__file__)
    static_dir = os.path.join(streamlit_dir, "static")
    index_path = os.path.join(static_dir, "index.html")
    
    if not os.path.exists(index_path):
        print(f"[ERROR] Streamlit index.html not found at: {index_path}")
        return

    # 2. 파비콘 이미지 파일들 덮어쓰기
    favicons_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "favicons")
    if os.path.exists(favicons_dir):
        for filename in os.listdir(favicons_dir):
            src = os.path.join(favicons_dir, filename)
            dst = os.path.join(static_dir, filename)
            if os.path.isfile(src):
                shutil.copy2(src, dst)
        print("[SUCCESS] Favicons copied to Streamlit static directory.")
    else:
        print(f"[WARNING] Favicons directory not found at: {favicons_dir}")

    # 2.5. OG 이미지(썸네일) 파일을 정적 서빙 경로로 복사 (rebornbiz.co.kr/assets/og-image.png 대응)
    target_assets_dir = os.path.join(static_dir, "assets")
    os.makedirs(target_assets_dir, exist_ok=True)
    og_image_src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "og-image.png")
    if os.path.exists(og_image_src):
        shutil.copy2(og_image_src, os.path.join(target_assets_dir, "og-image.png"))
        print("[SUCCESS] og-image.png copied to Streamlit static/assets directory.")
    else:
        print(f"[WARNING] og-image.png not found at: {og_image_src}")

    # 3. index.html 읽어오기
    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 4. 파비콘 태그 교체 (중복 주입 방지)
    old_icon_tag = '<link rel="shortcut icon" href="./favicon.png" />'
    new_icon_tags = """<link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png">
    <link rel="icon" type="image/x-icon" href="./favicon.ico">
    <link rel="manifest" href="./site.webmanifest">"""

    if old_icon_tag in content:
        content = content.replace(old_icon_tag, new_icon_tags)
        print("[SUCCESS] Favicon tags injected into index.html.")
    else:
        print("[INFO] Favicon tags already patched or default tag missing.")

    # 4.5. 잘못된 HTML 텍스트(주석 실수 등) 강제 클렌징
    malformed_texts = [
        "// 네이버 애널리틱스 소스",
        "//네이버 애널리틱스 소스",
        "// 네이버 애널리틱스",
        "//네이버 애널리틱스"
    ]
    for text in malformed_texts:
        if text in content:
            content = content.replace(text, "")
            print(f"[SUCCESS] Cleaned malformed text: {text}")

    # 5. 네이버 애널리틱스 및 정적 SEO/OG 메타 태그 주입
    injection_content = """
    <!-- SEO & Open Graph Tags -->
    <meta name="description" content="소상공인의 안전한 폐업과 성공적인 재창업을 돕습니다. 폐업 비용 계산, 상권 분석, 정부 지원 정책을 한 번에 확인하세요.">
    <meta name="keywords" content="소상공인, 폐업 비용 계산기, 업종 변경, 상권 분석, 희망리턴패키지, 재창업, RebornBiz">
    <meta name="naver-site-verification" content="60e370a04a68c7125d47cc27112186c48372d8b8">
    <meta name="google-site-verification" content="KJ_THHy7VKDvnXerQT1S5I0B2U2glszxIeS5Ge34Gvs">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://rebornbiz.co.kr">
    <meta property="og:title" content="RebornBiz(리본비즈) | 소상공인 폐업 및 업종 변경 시뮬레이터">
    <meta property="og:description" content="폐업 비용 계산, 희망 업종 수익성 시뮬레이션, 내 주변 상권 분석부터 정부 지원 정책 가이드까지 1분 만에 무료로 확인하세요.">
    <meta property="og:image" content="https://rebornbiz.co.kr/assets/og-image.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="RebornBiz(리본비즈)">
    <meta name="twitter:description" content="소상공인 폐업 비용 및 비즈니스 전환 올인원 시뮬레이터">
    <meta name="twitter:image" content="https://rebornbiz.co.kr/assets/og-image.png">
    
    <!-- Naver Analytics -->
    <script type="text/javascript" src="//wcs.pstatic.net/wcslog.js"></script>
    <script type="text/javascript">
        if(!window.wcs_add) window.wcs_add = {};
        window.wcs_add["wa"] = "cb815cb694e138";
        if(window.wcs) { window.wcs_do(); }
    </script>
"""

    import re
    # 기존 네이버 애널리틱스 스크립트 블록 삭제 (공백 무시 정규식)
    content = re.sub(r'<script type="text/javascript" src="//wcs\.pstatic\.net/wcslog\.js"></script>\s*<script type="text/javascript">\s*if\(!window\.wcs_add\) window\.wcs_add = \{\};\s*window\.wcs_add\["wa"\] = "cb815cb694e138";\s*if\(window\.wcs\) \{ window\.wcs_do\(\); \}\s*</script>', '', content)
    
    # 이전에 주입된 <!-- SEO & Open Graph Tags --> 부터 </head> 앞까지 삭제
    content = re.sub(r'<!-- SEO & Open Graph Tags -->.*?(?=</head>)', '', content, flags=re.DOTALL)

    # 깔끔해진 </head> 자리 바로 앞에 주입
    content = content.replace("</head>", injection_content + "\n  </head>")
    # 혹시 중복된 </head> 가 있다면 정리 (이전 버그 수정)
    content = content.replace("</head>\n  </head>", "</head>")
    content = content.replace("</head>\n  </head>", "</head>")
    
    print("[SUCCESS] SEO, OG Tags & Naver Analytics script freshly injected into index.html.")

    # 수정된 내용 저장
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Patch completed successfully! Please restart your Streamlit server.")

if __name__ == "__main__":
    patch_streamlit()
