'use client';
import { useState, useEffect, useRef } from 'react';
import StickyHeader from '@/components/StickyHeader';
import AdSlot from '@/components/AdSlot';

export default function MarketAnalysisPage() {
  const [position, setPosition] = useState({ lat: 37.498, lon: 127.027 });
  const [radius, setRadius] = useState(500);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressStr, setAddressStr] = useState("주소를 불러오는 중...");
  const [selectedIndustry, setSelectedIndustry] = useState("전체");
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const clustererRef = useRef(null);

  // Load Kakao Map Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=709c40315079132e50e64ff31f511a13&libraries=clusterer,services&autoload=false";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const options = {
          center: new window.kakao.maps.LatLng(position.lat, position.lon),
          level: 4,
        };
        const map = new window.kakao.maps.Map(mapContainer.current, options);
        mapRef.current = map;
        setMapLoaded(true);

        const clusterer = new window.kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 5
        });
        clustererRef.current = clusterer;

        window.kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
          const latlng = mouseEvent.latLng;
          setPosition({ lat: latlng.getLat(), lon: latlng.getLng() });
        });

        // Try getting user location initially
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          }, () => { }, { enableHighAccuracy: true, timeout: 5000, maximumAge: Infinity });
        }
      });
    };
    return () => { document.head.removeChild(script); };
  }, []);

  // Fetch Stores when position or radius changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        // Reverse geocoding using Kakao Maps services
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(position.lon, position.lat, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            let addr = result[0].address_name;
            for (let i = 0; i < result.length; i++) {
              if (result[i].region_type === 'H') { // 행정동 기준
                const r2 = result[i].region_2depth_name;
                const r3 = result[i].region_3depth_name;
                const r4 = result[i].region_4depth_name;
                addr = `${r2} / ${r3}${r4 ? ' ' + r4 : ''}`;
                break;
              }
            }
            setAddressStr(addr);
          } else {
            setAddressStr(`위도: ${position.lat.toFixed(4)}, 경도: ${position.lon.toFixed(4)}`);
          }
        });

        mapRef.current.setCenter(new window.kakao.maps.LatLng(position.lat, position.lon));

        const res = await fetch(`/api/market_analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: position.lat, lon: position.lon, radius: radius, address: addressStr })
        });
        const data = await res.json();

        if (data.success) {
          setStores(data.data || []);
          drawMarkers(data.data || []);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
          setStores([]);
          drawMarkers([]);
        }
      } catch (err) {
        setError('서버에 연결할 수 없습니다. 백엔드 서버(포트 8000)가 실행 중인지 확인하세요.');
        setStores([]);
        drawMarkers([]);
      }
      setLoading(false);
    };

    fetchStores();
  }, [position.lat, position.lon, radius, mapLoaded]);

  const drawMarkers = (data) => {
    if (!clustererRef.current || !window.kakao) return;
    clustererRef.current.clear();

    const filteredData = selectedIndustry === "전체" ? data : data.filter(s => s.indsMclsNm === selectedIndustry);

    const markers = filteredData.map(store => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(store.lat, store.lon)
      });
      const iwContent = `<div style="padding:5px;font-size:12px;max-width:200px;white-space:normal;word-break:keep-all;">${store.bizesNm || '알수없음'}<br>(${store.indsMclsNm})</div>`;
      const infowindow = new window.kakao.maps.InfoWindow({ content: iwContent });

      window.kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(mapRef.current, marker));
      window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
      return marker;
    });

    clustererRef.current.addMarkers(markers);
  };

  useEffect(() => {
    drawMarkers(stores);
  }, [selectedIndustry]);

  const coreIndustries = ['음식', '소매', '생활서비스', '수리·개인·기타서비스', '예술·스포츠·여가'];
  const filteredStores = stores.filter(s => coreIndustries.includes(s.indsLclsNm));
  const uniqueIndustries = ["전체", ...new Set(filteredStores.map(s => s.indsMclsNm).filter(Boolean))].sort();

  const displayStores = selectedIndustry === "전체" ? filteredStores : filteredStores.filter(s => s.indsMclsNm === selectedIndustry);

  // Top 3 industries
  const industryCounts = {};
  filteredStores.forEach(s => {
    if (s.indsMclsNm) industryCounts[s.indsMclsNm] = (industryCounts[s.indsMclsNm] || 0) + 1;
  });
  const top3 = Object.entries(industryCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);

  return (
    <div className="custom-main">
      <StickyHeader>
        <div className="pc-only" style={{ alignItems: 'center', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '1rem' }}>
          <div style={{ flexShrink: 0, marginRight: '2rem' }}>
            <img src="/rebornBiz_logo.png" alt="RebornBiz Logo" style={{ width: '200px', height: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#31333F' }}>내 주변 상권 분석</h1>
            <p style={{ fontSize: '1rem', marginBottom: '0', lineHeight: '1.6', color: '#555' }}>
              관심 있는 지역의 업종 밀집도, 유동 인구 특성, 그리고 평균 매출 추이를 분석하여<br/>
              어느 곳에 어떤 매장을 열어야 할지 입지 선정의 나침반이 되어 드리는 상권 지도 도구입니다.
            </p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#31333F' }}>내 주변 상권 분석</h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>
            관심 있는 지역의 업종 밀집도와 경쟁 점포 수를 분석하여 최적의 입지 선정을 돕습니다. 지도를 클릭하면 중심점이 이동합니다.
          </p>
        </div>
      </StickyHeader>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />

      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>1. 상권 분석 반경 설정</h3>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>원하시는 지역의 지도를 클릭하고 반경을 설정하면, 해당 구역 내의 모든 활성 점포 데이터를 불러옵니다.</div>
      <div style={{ marginBottom: '2rem' }}>
        <input type="range" min="100" max="2000" step="100" value={radius} onChange={(e) => setRadius(Number(e.target.value))} style={{ width: '100%', maxWidth: '400px' }} />
        <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{radius} 미터</div>
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>📋 상권 요약 지표</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 200px', padding: '1.5rem', border: '1px solid rgba(49, 51, 63, 0.2)', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>📍 현재 위치</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{addressStr}</div>
        </div>
        <div style={{ flex: '1 1 200px', padding: '1.5rem', border: '1px solid rgba(49, 51, 63, 0.2)', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>⭕ 검색 반경</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{radius}m</div>
        </div>
        <div style={{ flex: '1 1 200px', padding: '1.5rem', border: '1px solid rgba(49, 51, 63, 0.2)', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>점포 수</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{filteredStores.length} 개</div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>3. 상권 시각화 대시보드</h3>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1.2 1 400px', border: '1px solid rgba(49, 51, 63, 0.2)', borderRadius: '0.5rem', padding: '1rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>📍 주변 상권 지도 (카카오 맵)</h4>
          <div ref={mapContainer} style={{ width: '100%', height: '500px', borderRadius: '0.5rem', position: 'relative' }}>
            {loading && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>데이터 로딩중...</div>}
          </div>
        </div>

        <div style={{ flex: '1 1 300px', border: '1px solid rgba(49, 51, 63, 0.2)', borderRadius: '0.5rem', padding: '1rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>🔍 주변 경쟁 매장 검색 및 리스트</h4>

          {top3.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <b>🏆 반경 내 Top 3 업종:</b>
              <div style={{ marginTop: '0.5rem' }}>
                {top3.map(inds => <span key={inds} style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', marginRight: '6px' }}>#{inds}</span>)}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>분석할 업종을 고르세요</label>
            <select value={selectedIndustry} onChange={e => setSelectedIndustry(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }}>
              {uniqueIndustries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '0.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>반경 {radius}m 내 '{selectedIndustry}' 매장 수</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{displayStores.length} 개</div>
          </div>

          {displayStores.length > 0 && (
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(49, 51, 63, 0.2)', borderRadius: '0.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid rgba(49, 51, 63, 0.2)' }}>상호명</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid rgba(49, 51, 63, 0.2)' }}>상세 업종</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStores.map((s, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(49, 51, 63, 0.1)' }}>{s.bizesNm || '알수없음'}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(49, 51, 63, 0.1)' }}>{s.indsSclsNm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SEO를 위한 정적 예시 및 체크리스트 */}
      <section style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '0.5rem', marginTop: '3rem', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>💡 상권 분석 가이드 및 체크리스트</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#334155', marginBottom: '0.75rem' }}>가상 상권 분석 결과 예시</h4>
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
              <div style={{ fontSize: '0.8rem', color: '#dc2626', marginBottom: '1rem', fontWeight: 'bold' }}>※ 아래 내용은 결과 화면 이해를 위한 가상 예시이며 실제 상권 분석값이 아닙니다.</div>
              <p style={{ margin: '0 0 0.5rem 0' }}><b>[가상 분석 설정]</b></p>
              <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.2rem' }}>
                <li>지역: 역세권 중심 반경 500m</li>
                <li>업종 필터: 카페/커피숍</li>
              </ul>
              <p style={{ margin: '0 0 0.5rem 0' }}><b>[결과 항목 해석 방법]</b></p>
              <ul style={{ margin: '0', paddingLeft: '1.2rem' }}>
                <li>경쟁점포 수: 주변에 동일 업종이 얼마나 밀집해 있는지 판단하는 지표</li>
                <li>유동인구 특성: 우리 매장의 주력 고객층(예: 2030 여성)이 많이 지나다니는지 확인</li>
                <li>피크 타임: 언제 방문객이 가장 많은지 파악하여 인력 배치 계획 수립</li>
                <li><b>전략 수립: 데이터 해석 결과를 바탕으로 영업시간, 타겟 마케팅 등 수립</b></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#334155', marginBottom: '0.75rem' }}>✅ 입지 선정 시 필수 체크리스트</h4>
            <ul style={{ margin: '0', paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#475569', lineHeight: '1.8' }}>
              <li>상권의 메인 동선과 매장의 접근성이 뛰어난가? (가시성 포함)</li>
              <li>예상되는 평균 매출액 대비 월 임대료가 타당한 수준(보통 10~15% 이하)인가?</li>
              <li>출점하려는 업종과 주변 상가의 주요 소비 연령층이 일치하는가?</li>
              <li>경쟁 점포 대비 우리 매장만의 확실한 차별화 포인트가 있는가?</li>
              <li>유동인구가 평일(오피스 상권)과 주말(주거/번화가 상권) 중 언제 집중되는가?</li>
            </ul>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <b>※ 참고 및 면책 조항:</b> 본 상권 분석 데이터는 소상공인시장진흥공단 API 등 공공데이터 상권 정보를 바탕으로 제공됩니다. 분석된 점포 수 및 상권 정보는 최근 개/폐업 변동이나 API 갱신 주기에 따라 실제 상권과 다소 오차가 발생할 수 있으므로, 입지 선정 전 반드시 현장 실사(임장)를 병행하시기 바랍니다.
        </div>
      </section>

      <AdSlot style={{ marginTop: '3rem' }} />
    </div>
  );
}
