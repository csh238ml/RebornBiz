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

    # 5. 네이버 애널리틱스 스크립트 주입 (중복 주입 방지)
    naver_script = """    <script type="text/javascript" src="//wcs.pstatic.net/wcslog.js"></script>
    <script type="text/javascript">
        if(!window.wcs_add) window.wcs_add = {};
        window.wcs_add["wa"] = "cb815cb694e138";
        if(window.wcs) { window.wcs_do(); }
    </script>
  </head>"""

    if "wcs.pstatic.net/wcslog.js" not in content:
        content = content.replace("  </head>", naver_script)
        print("[SUCCESS] Naver Analytics script injected into index.html.")
    else:
        print("[INFO] Naver Analytics script already patched.")

    # 수정된 내용 저장
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Patch completed successfully! Please restart your Streamlit server.")

if __name__ == "__main__":
    patch_streamlit()
