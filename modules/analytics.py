import streamlit.components.v1 as components

def inject_naver_analytics():
    """
    Streamlit 앱의 상위(Parent) 문서 구조에 네이버 애널리틱스 추적 코드를 동적으로 주입합니다.
    Streamlit의 iframe 구조 한계를 우회하여 정확한 페이지 뷰 통계를 수집하며,
    SPA(Single Page Application) 특성을 고려하여 페이지 전환 시에도 중복 주입 없이 추적이 가능하도록 방어 로직이 적용되어 있습니다.
    """
    
    # 네이버 애널리틱스 WA ID (사용자가 제공한 ID)
    wa_id = "cb815cb694e138"
    
    js_code = f"""
    <script>
    // Streamlit 컴포넌트는 iframe 내부에서 실행되므로, 실제 브라우저 창인 window.parent에 접근
    const parentDoc = window.parent.document;
    const parentWin = window.parent;

    // 이미 스크립트가 로드되었는지 확인 (중복 주입 방지)
    if (!parentDoc.getElementById('naver-analytics-wcslog')) {{
        
        // 1. 네이버 애널리틱스 외부 스크립트(wcslog.js) 로드
        const script1 = parentDoc.createElement('script');
        script1.id = 'naver-analytics-wcslog';
        script1.type = 'text/javascript';
        script1.src = '//wcs.pstatic.net/wcslog.js';
        
        // 2. 외부 스크립트 로드가 완료된 후 초기화 및 통계 수집 코드 실행
        script1.onload = function() {{
            const script2 = parentDoc.createElement('script');
            script2.id = 'naver-analytics-init';
            script2.type = 'text/javascript';
            script2.innerHTML = `
                if(!window.wcs_add) window.wcs_add = {{}};
                window.wcs_add["wa"] = "{wa_id}";
                if(window.wcs) {{
                    window.wcs_do();
                }}
            `;
            parentDoc.head.appendChild(script2);
        }};
        
        // 스크립트를 실제 헤더에 추가
        parentDoc.head.appendChild(script1);
        
    }} else {{
        // 스크립트가 이미 로드된 상태(예: Streamlit 페이지 간 이동 시)
        // SPA 특성상 페이지 전환 시에도 통계가 잡히도록 wcs_do()를 다시 호출
        if (parentWin.wcs) {{
            // 페이지 전환을 인식할 수 있도록 약간의 지연 후 호출
            setTimeout(() => {{
                parentWin.wcs_do();
            }}, 300);
        }}
    }}
    </script>
    """
    
    # width=0, height=0으로 설정하여 화면에 보이지 않는 백그라운드 컴포넌트로 렌더링
    components.html(js_code, width=0, height=0)
