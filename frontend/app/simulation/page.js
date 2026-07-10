'use client';
import { useState, useEffect, useRef } from 'react';
import StickyHeader from '@/components/StickyHeader';
import AdSlot from '@/components/AdSlot';

export default function SimulationPage() {
  const [tab, setTab] = useState('NEW'); // 'NEW' or 'CHANGE'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Map State
  const [position, setPosition] = useState({ lat: 37.498, lon: 127.027 });
  const [addressStr, setAddressStr] = useState("주소를 불러오는 중...");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [stores, setStores] = useState([]);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const clustererRef = useRef(null);

  // Industry State
  const [largeList, setLargeList] = useState([]);
  const [cMediumList, setCMediumList] = useState([]);
  const [cSmallList, setCSmallList] = useState([]);
  const [tMediumList, setTMediumList] = useState([]);
  const [tSmallList, setTSmallList] = useState([]);

  const [cLarge, setCLarge] = useState('');
  const [cMedium, setCMedium] = useState('');
  const [cSmall, setCSmall] = useState('');

  const [tLarge, setTLarge] = useState('');
  const [tMedium, setTMedium] = useState('');
  const [tSmall, setTSmall] = useState('');

  const [investment, setInvestment] = useState(5000);

  // Fetch initial lists
  useEffect(() => {
    fetch('/api/categories/large').then(res => res.json()).then(data => data.success && setLargeList(data.data));
  }, []);

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

        window.kakao.maps.event.addListener(map, 'dragend', function () {
          const latlng = map.getCenter();
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

  // Fetch Stores when position changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const fetchStores = async () => {
      try {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(position.lon, position.lat, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            let addr = result[0].address_name;
            for (let i = 0; i < result.length; i++) {
              if (result[i].region_type === 'H') { // 행정동 기준
                const r2 = result[i].region_2depth_name;
                const r3 = result[i].region_3depth_name;
                const r4 = result[i].region_4depth_name;
                addr = `${result[i].region_1depth_name} ${r2} ${r3}${r4 ? ' ' + r4 : ''}`;
                break;
              }
            }
            setAddressStr(addr);
          }
        });

        mapRef.current.setCenter(new window.kakao.maps.LatLng(position.lat, position.lon));

        const res = await fetch(`/api/market_analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: position.lat, lon: position.lon, radius: 500, address: addressStr })
        });
        const data = await res.json();
        if (data.success) {
          setStores(data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStores();
  }, [position.lat, position.lon, mapLoaded]);

  const drawMarkers = () => {
    if (!clustererRef.current || !window.kakao) return;
    clustererRef.current.clear();

    const currentTarget = tSmall;
    const filteredData = currentTarget ? stores.filter(s => s.indsSclsNm && s.indsSclsNm.includes(currentTarget)) : stores;

    const markers = filteredData.map(store => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(store.lat, store.lon)
      });
      const iwContent = `<div style="padding:5px;font-size:12px;max-width:200px;white-space:normal;word-break:keep-all;">${store.bizesNm || '알수없음'}<br>(${store.indsSclsNm || store.indsMclsNm})</div>`;
      const infowindow = new window.kakao.maps.InfoWindow({ content: iwContent });

      window.kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(mapRef.current, marker));
      window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
      return marker;
    });

    clustererRef.current.addMarkers(markers);
  };

  useEffect(() => {
    drawMarkers();
  }, [stores, tSmall]);

  // Current Industry cascades
  useEffect(() => {
    if (cLarge) {
      fetch(`/api/categories/medium?large=${encodeURIComponent(cLarge)}`).then(res => res.json()).then(data => {
        setCMediumList(data.success ? data.data : []);
        setCMedium(''); setCSmall(''); setCSmallList([]);
      });
    }
  }, [cLarge]);

  useEffect(() => {
    if (cMedium) {
      fetch(`/api/categories/small?medium=${encodeURIComponent(cMedium)}`).then(res => res.json()).then(data => {
        setCSmallList(data.success ? data.data : []);
        setCSmall('');
      });
    }
  }, [cMedium]);

  // Target Industry cascades
  useEffect(() => {
    if (tLarge) {
      fetch(`/api/categories/medium?large=${encodeURIComponent(tLarge)}`).then(res => res.json()).then(data => {
        setTMediumList(data.success ? data.data : []);
        setTMedium(''); setTSmall(''); setTSmallList([]);
      });
    }
  }, [tLarge]);

  useEffect(() => {
    if (tMedium) {
      fetch(`/api/categories/small?medium=${encodeURIComponent(tMedium)}`).then(res => res.json()).then(data => {
        setTSmallList(data.success ? data.data : []);
        setTSmall('');
      });
    }
  }, [tMedium]);

  const handleCSmallChange = (val) => {
    setCSmall(val);
    if (val && val !== '') {
      setTLarge(cLarge);
      setTMedium(cMedium);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tab === 'CHANGE' && !cSmall) {
      setError('현재 업종 소분류를 선택해주세요.');
      return;
    }
    if (!tSmall) {
      setError('희망 업종 소분류를 선택해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: addressStr,
          current_biz: tab === 'NEW' ? "없음" : cSmall,
          target_biz: tSmall,
          investment: Number(investment)
        })
      });
      const data = await res.json();
      if(data.success) {
        setResult(data.data);
      } else {
        setError(data.message || '오류가 발생했습니다.');
      }
    } catch(err) {
      setError('서버 연동에 실패했습니다.');
    }
    setLoading(false);
  }

  const selectStyle = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA', marginBottom: '0.5rem' };
  const labelStyle = { display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 'bold' };

  return (
    <div className="custom-main">
      <StickyHeader>
        <div className="pc-only" style={{ alignItems: 'center', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '1rem' }}>
          <div style={{ flexShrink: 0, marginRight: '2rem' }}>
            <img src="/rebornBiz_logo.png" alt="RebornBiz Logo" style={{ width: '200px', height: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#31333F' }}>업종 변경 시뮬레이션</h1>
            <p style={{ fontSize: '1rem', marginBottom: '0', lineHeight: '1.6', color: '#555' }}>새로운 업종 전환 시의 예상 리스크와 수익성을 분석합니다.</p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#31333F' }}>업종 변경 시뮬레이션</h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>새로운 업종 전환 시의 예상 리스크와 수익성을 분석합니다.</p>
        </div>
      </StickyHeader>

      <hr style={{borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0'}} />

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setTab('NEW'); setResult(null); }}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600',
            backgroundColor: tab === 'NEW' ? '#1E3A8A' : '#F1F5F9',
            color: tab === 'NEW' ? '#FFFFFF' : '#475569',
            border: `1px solid ${tab === 'NEW' ? '#1E3A8A' : '#E2E8F0'}`,
            cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.05rem'
          }}
        >
          신규 창업
        </button>
        <button
          onClick={() => { setTab('CHANGE'); setResult(null); }}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600',
            backgroundColor: tab === 'CHANGE' ? '#1E3A8A' : '#F1F5F9',
            color: tab === 'CHANGE' ? '#FFFFFF' : '#475569',
            border: `1px solid ${tab === 'CHANGE' ? '#1E3A8A' : '#E2E8F0'}`,
            cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.05rem'
          }}
        >
          업종 변경
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{flex: '1 1 300px'}}>
          <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>
            {tab === 'NEW' ? '1. 희망 업종 선택' : '1. 업종 전환 정보'}
          </h3>

          {tab === 'CHANGE' && (
            <div style={{border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '1rem'}}>
              <h4 style={{marginBottom: '1rem', color: '#1E3A8A', fontWeight: 'bold'}}>🏢 현재 업종</h4>
              <label style={labelStyle}>대분류 (현재)</label>
              <select value={cLarge} onChange={e => setCLarge(e.target.value)} style={selectStyle}>
                <option value="">선택하세요</option>
                {largeList.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <label style={labelStyle}>중분류 (현재)</label>
              <select value={cMedium} onChange={e => setCMedium(e.target.value)} style={selectStyle} disabled={!cLarge}>
                <option value="">선택하세요</option>
                {cMediumList.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <label style={labelStyle}>소분류 (현재)</label>
              <select value={cSmall} onChange={e => handleCSmallChange(e.target.value)} style={selectStyle} disabled={!cMedium}>
                <option value="">선택하세요</option>
                {cSmallList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div style={{border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff'}}>
            <h4 style={{marginBottom: '1rem', color: '#1E3A8A', fontWeight: 'bold'}}>🚀 {tab === 'NEW' ? '희망 업종' : '전환 희망 업종'}</h4>
            <label style={labelStyle}>대분류 (희망)</label>
            <select value={tLarge} onChange={e => setTLarge(e.target.value)} style={selectStyle}>
              <option value="">선택하세요</option>
              {largeList.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <label style={labelStyle}>중분류 (희망)</label>
            <select value={tMedium} onChange={e => setTMedium(e.target.value)} style={selectStyle} disabled={!tLarge}>
              <option value="">선택하세요</option>
              {tMediumList.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <label style={labelStyle}>소분류 (희망)</label>
            <select value={tSmall} onChange={e => setTSmall(e.target.value)} style={selectStyle} disabled={!tMedium}>
              <option value="">선택하세요</option>
              {tSmallList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>2. 가용 투자 예산</h3>
            <div style={{border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff'}}>
              <label style={labelStyle}>💰 가용 투자 예산 (만원)</label>
              <input type="number" value={investment} onChange={e => setInvestment(e.target.value)} style={selectStyle} />
            </div>
          </div>
        </div>

        <div style={{flex: '1.5 1 400px'}}>
          <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>📍 지역 선택 (마커 정보: {tSmall || '전체 업종'})</h3>
          <div style={{border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#ffffff'}}>
            <div style={{ fontSize: '0.9rem', color: '#1E3A8A', marginBottom: '0.5rem', fontWeight: 'bold' }}>현재 위치: {addressStr}</div>
            <div ref={mapContainer} style={{ width: '100%', height: '500px', borderRadius: '0.5rem', position: 'relative' }}>
              {!mapLoaded && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>지도 로딩중...</div>}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', marginBottom: 0 }}>지도를 드래그하여 분석할 상권의 중심을 이동하세요. 이동된 위치의 주소가 자동으로 반영됩니다.</p>
          </div>
        </div>
      </div>

      <div style={{marginBottom: '2rem'}}>
        <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.75rem 2rem', backgroundColor: '#FF4B4B', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
          {loading ? '분석 중...' : '시뮬레이션 실행 ➡️'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#ffbd45', color: '#31333F', borderRadius: '0.25rem', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div>
          <hr style={{borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0'}} />
          <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem'}}>
            {tab === 'NEW' ? '📊 신규 창업 분석 결과' : '📊 업종 변경 시뮬레이션 결과'}
          </h3>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div style={{flex: '1 1 200px', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.5rem' }}>예상 초기 세팅 비용</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#31333F' }}>{result.target_setup_cost.toLocaleString()} 만원</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: result.investment >= result.target_setup_cost ? '#09AB3B' : '#FF4B4B' }}>
                {result.investment >= result.target_setup_cost ? '✅ 예산 내 가능' : '❌ 예산 초과'}
              </div>
            </div>
            <div style={{flex: '1 1 200px', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.5rem' }}>예상 투자금 회수(BEP)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#31333F' }}>
                {result.bep_months === Infinity ? '불가' : `${result.bep_months} 개월`}
              </div>
            </div>
            <div style={{flex: '1 1 200px', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.5rem' }}>
                {tab === 'NEW' ? '월별 예상 순수익' : '월별 예상 추가 수익'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: result.additional_profit > 0 ? '#09AB3B' : '#FF4B4B' }}>
                {result.additional_profit > 0 && tab === 'CHANGE' ? '+' : ''}{result.additional_profit.toLocaleString()} 만원
              </div>
            </div>
            <div style={{flex: '1 1 200px', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
              <div style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.5rem' }}>예상 ROI (연간)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#31333F' }}>{result.roi} %</div>
            </div>
          </div>

          <div style={{ padding: '1rem 1.5rem', backgroundColor: '#eff6ff', color: '#1e3a8a', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid #bfdbfe' }}>
            💡 <b>상권 실데이터 연동:</b> {addressStr} 내 기존 동일 업종({tSmall}) 평균 데이터를 분석한 결과입니다. 
            {result.store_count !== undefined && ` (현재 운영 중 점포 수: 총 ${result.store_count}개, 출처: ${result.api_source || '공공데이터 API'})`}
          </div>
          
          <h4 style={{fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem'}}>📈 상세 분석 내용</h4>
          <ul style={{ lineHeight: '1.8', fontSize: '1rem', color: '#444' }}>
            {tab === 'CHANGE' && <li><b>현재 업종 ({cSmall || "없음"}) 예상 월 순이익:</b> {result.current_profit.toLocaleString()} 만원</li>}
            <li><b>{tab === 'NEW' ? '신규 업종' : '타겟 업종'} ({tSmall}) 예상 월 순이익:</b> {result.target_profit.toLocaleString()} 만원</li>
            <li><b>분석 기준 가용 예산:</b> {result.investment.toLocaleString()} 만원</li>
          </ul>

            <AdSlot position="bottom" style={{ marginTop: '2rem' }} />
        </div>
      )}
      
      {!result && (
        <AdSlot position="middle" style={{ marginTop: '2rem', marginBottom: '2rem' }} />
      )}
    </div>
  );
}
