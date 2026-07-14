'use client';
import { useState, useEffect, useRef } from 'react';
import StickyHeader from '@/components/StickyHeader';
import AdSlot from '@/components/AdSlot';

export default function SimulationPage() {
  const [tab, setTab] = useState('CHANGE'); // 'NEW' or 'CHANGE'
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

  // ----------------------------------------------------
  // 공통 폼 State
  // ----------------------------------------------------
  const [investment, setInvestment] = useState(5000); // 가용 예산 / 추가 투자 가능 금액 (만원)
  
  // ----------------------------------------------------
  // NEW 탭 전용 State
  // ----------------------------------------------------
  const [area, setArea] = useState(15); 
  const [rent, setRent] = useState(150); 
  const [adminFee, setAdminFee] = useState(15); 
  const [employees, setEmployees] = useState(1); 
  const [isOwnerWorking, setIsOwnerWorking] = useState(true); 
  const [isNewDetailOpen, setIsNewDetailOpen] = useState(false);
  
  const [deposit, setDeposit] = useState(''); 
  const [detailLabor, setDetailLabor] = useState(''); 
  const [detailLoan, setDetailLoan] = useState(''); 
  const [detailDeliveryRate, setDetailDeliveryRate] = useState(''); 
  const [detailEquipmentSale, setDetailEquipmentSale] = useState(''); 
  const [detailDemolition, setDetailDemolition] = useState(''); 
  const [detailOpFund, setDetailOpFund] = useState(''); 
  const [detailMarketing, setDetailMarketing] = useState(''); 

  // ----------------------------------------------------
  // CHANGE 탭 전용 State
  // ----------------------------------------------------
  const [isChangeCurrentDetailOpen, setIsChangeCurrentDetailOpen] = useState(false);
  const [isChangeTargetDetailOpen, setIsChangeTargetDetailOpen] = useState(false);
  
  const [cArea, setCArea] = useState(15); // 현재 매장 평수
  const [cRent, setCRent] = useState(150); // 현재 월 임대료
  const [cEmployees, setCEmployees] = useState(1); // 현재 직원 수
  const [cSales, setCSales] = useState(''); // 현재 월 매출 (빈값이면 평균대체)
  const [cLaborCost, setCLaborCost] = useState(''); // 현재 월 인건비 (빈값이면 평균대체)
  
  const [tRemodeling, setTRemodeling] = useState(''); // 예상 리모델링 비용
  const [tReuseEquipment, setTReuseEquipment] = useState(true); // 기존 집기 활용 여부

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

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          }, () => { }, { enableHighAccuracy: true, timeout: 5000, maximumAge: Infinity });
        }
      });
    };
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const fetchStores = async () => {
      try {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(position.lon, position.lat, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            let addr = result[0].address_name;
            for (let i = 0; i < result.length; i++) {
              if (result[i].region_type === 'H') { 
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

  const getNumberOrNull = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    return Number(val);
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
      const payload = {
        tab,
        region: addressStr,
        target_biz: tSmall,
        investment: Number(investment)
      };

      if (tab === 'CHANGE') {
        payload.current_biz = cSmall;
        payload.c_area = Number(cArea);
        payload.c_rent = Number(cRent);
        payload.c_employees = Number(cEmployees);
        payload.c_sales = getNumberOrNull(cSales);
        payload.c_labor_cost = getNumberOrNull(cLaborCost);
        payload.t_remodeling = getNumberOrNull(tRemodeling);
        payload.t_reuse_equipment = tReuseEquipment;

      } else if (tab === 'NEW') {
        payload.area = Number(area);
        payload.rent = Number(rent);
        payload.admin_fee = Number(adminFee);
        payload.employees = Number(employees);
        payload.is_owner_working = isOwnerWorking;
        
        payload.deposit = getNumberOrNull(deposit);
        payload.detail_labor = getNumberOrNull(detailLabor);
        payload.detail_loan = getNumberOrNull(detailLoan);
        payload.detail_delivery_rate = getNumberOrNull(detailDeliveryRate);
        payload.detail_demolition = getNumberOrNull(detailDemolition);
        payload.detail_equipment_sale = getNumberOrNull(detailEquipmentSale);
        payload.detail_op_fund = getNumberOrNull(detailOpFund);
        payload.detail_marketing = getNumberOrNull(detailMarketing);
      }

      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

  const selectStyle = { width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '1rem', backgroundColor: '#FAFAFA', marginBottom: '0.5rem', outline: 'none', transition: 'border-color 0.2s' };
  const inputContainerStyle = { display: 'flex', alignItems: 'center', marginBottom: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', backgroundColor: '#FAFAFA', overflow: 'hidden' };
  const inputStyle = { flex: 1, padding: '0.6rem 0.75rem', border: 'none', fontSize: '1rem', backgroundColor: 'transparent', outline: 'none', minWidth: 0 };
  const unitStyle = { padding: '0.6rem 0.75rem', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.9rem', borderLeft: '1px solid #cbd5e1', fontWeight: '500', whiteSpace: 'nowrap' };
  const labelStyle = { display: 'block', fontSize: '0.875rem', marginBottom: '0.3rem', fontWeight: '600', color: '#334155' };
  
  // ==========================================
  // NEW 탭 결과 렌더링
  // ==========================================
  const renderNewStartupResult = () => {
    if (!result || !result.isNewStartup) return null;
    const { scenarios, bep_sales, actual_startup_capital, remaining_funds, runway_months, risk, meta } = result;
    const { min, base, max } = scenarios;

    return (
      <div>
        <hr style={{borderTop: '1px solid #e2e8f0', margin: '2rem 0'}} />
        <h3 style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b'}}>
          📊 신규 창업 분석 결과
        </h3>

        {/* 6개 메인 핵심 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>예상 월매출 범위</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {min.sales.toLocaleString()} ~ {max.sales.toLocaleString()} <span style={{fontSize:'1rem', fontWeight:'500'}}>만원</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>기준 매출: {base.sales.toLocaleString()}만원</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>월 손익분기 매출 (BEP)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {bep_sales === null || bep_sales === Infinity ? '계산 불가' : `${bep_sales.toLocaleString()} 만원`}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>고정비 커버를 위한 최소 매출</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>기준 월 영업이익</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: base.profit > 0 ? '#16a34a' : '#dc2626' }}>
              {base.profit > 0 ? `+${base.profit.toLocaleString()}` : base.profit.toLocaleString()} <span style={{fontSize:'1rem', fontWeight:'500'}}>만원</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              {!meta.is_owner_working ? '사장님 직접 근무 미적용' : '사장님 목표 급여 반영 전'}
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>실제 필요 창업자금</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>{actual_startup_capital.toLocaleString()} <span style={{fontSize:'1rem', fontWeight:'500'}}>만원</span></div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>초기비용, 보증금, 예비비 등 포함</div>
          </div>

          <div style={{ backgroundColor: remaining_funds >= 0 ? '#f0fdf4' : '#fef2f2', padding: '1.5rem', borderRadius: '0.75rem', border: `1px solid ${remaining_funds >= 0 ? '#bbf7d0' : '#fecaca'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{ fontSize: '0.875rem', color: remaining_funds >= 0 ? '#166534' : '#991b1b', marginBottom: '0.5rem', fontWeight: '600' }}>
              {remaining_funds >= 0 ? '남는 운영자금' : '예산 부족 금액'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: remaining_funds >= 0 ? '#15803d' : '#dc2626' }}>
              {Math.abs(remaining_funds).toLocaleString()} <span style={{fontSize:'1rem', fontWeight:'500'}}>만원</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: remaining_funds >= 0 ? '#166534' : '#991b1b', marginTop: '0.25rem' }}>
              {remaining_funds >= 0 ? '예산 여유 상태' : '자금 조달 추가 필요'}
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>예상 투자금 회수기간</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {base.paybackMonths === null || base.paybackMonths === Infinity || base.paybackMonths <= 0 ? '회수 계산 불가' : 
                base.paybackMonths > 24 ? '24개월 이상' : `약 ${base.paybackMonths}개월`}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>기준 시나리오 영업이익 적용</div>
          </div>

        </div>

        {/* 종합 해석 및 위험도 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ flex: '2 1 400px', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>🤖 시뮬레이션 해석 가이드</h4>
            <p style={{ color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: 0, fontSize: '0.95rem' }}>
              {meta.interpretation}
            </p>
          </div>

          <div style={{ flex: '1 1 250px', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>⚠️ 종합 위험도</h4>
            <div style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '2rem', fontWeight: '700', marginBottom: '1rem',
              backgroundColor: risk.level === '높음' ? '#fee2e2' : risk.level === '보통' ? '#fef3c7' : '#dcfce3',
              color: risk.level === '높음' ? '#991b1b' : risk.level === '보통' ? '#92400e' : '#166534' }}>
              위험도: {risk.level}
            </div>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#475569', fontSize: '0.85rem', lineHeight: '1.6' }}>
              {risk.reasons.length === 0 ? <li>현재 조건에서 두드러진 위험 요소가 발견되지 않았습니다.</li> : risk.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem', marginBottom: 0 }}>※ 입력 조건을 기준으로 한 참고용 위험도입니다.</p>
          </div>
        </div>

        {/* 시나리오 비교 테이블 */}
        <h4 style={{fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b'}}>📊 시나리오 비교 표</h4>
        <div style={{ overflowX: 'auto', marginBottom: '2.5rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: '600' }}>구분</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>최소 (-20%)</th>
                <th style={{ padding: '1rem', color: '#1e40af', fontWeight: '700' }}>기준 시나리오</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>최대 (+20%)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#334155' }}>예상 월매출</td>
                <td style={{ padding: '1rem' }}>{min.sales.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#1e40af' }}>{base.sales.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem' }}>{max.sales.toLocaleString()} 만원</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>월 변동비</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{min.variableCost.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{base.variableCost.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{max.variableCost.toLocaleString()} 만원</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>월 고정비</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{min.fixedCost.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{base.fixedCost.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{max.fixedCost.toLocaleString()} 만원</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <td style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', color: '#0f172a' }}>월 영업이익</td>
                <td style={{ padding: '1rem', fontWeight: '700', color: min.profit > 0 ? '#16a34a' : '#dc2626' }}>
                  {min.profit.toLocaleString()} 만원 <span style={{fontSize:'0.8rem'}}>({min.profit > 0 ? '흑자' : '적자'})</span>
                </td>
                <td style={{ padding: '1rem', fontWeight: '800', color: base.profit > 0 ? '#16a34a' : '#dc2626' }}>
                  {base.profit.toLocaleString()} 만원 <span style={{fontSize:'0.8rem'}}>({base.profit > 0 ? '흑자' : '적자'})</span>
                </td>
                <td style={{ padding: '1rem', fontWeight: '700', color: max.profit > 0 ? '#16a34a' : '#dc2626' }}>
                  {max.profit.toLocaleString()} 만원 <span style={{fontSize:'0.8rem'}}>({max.profit > 0 ? '흑자' : '적자'})</span>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>영업이익률</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{min.margin}%</td>
                <td style={{ padding: '1rem', color: '#1e40af', fontWeight: '600' }}>{base.margin}%</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{max.margin}%</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>운영자금 생존기간</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>
                  {min.profit >= 0 ? <span style={{color: '#16a34a'}}>적자 없음</span> : (runway_months > 0 ? `약 ${runway_months}개월` : <span style={{color: '#dc2626'}}>방어 불가</span>)}
                </td>
                <td colSpan="2" style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>* 최소 시나리오(적자) 기준 산출</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 분석 기준 (데이터 신뢰도) */}
        <div style={{ padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}>
          <h5 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '700', color: '#334155' }}>📌 분석 기준 및 신뢰도</h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.9rem', color: '#475569' }}>
            <div>
              <div style={{ marginBottom: '0.5rem' }}><b>선택 상권:</b> {addressStr}</div>
              <div style={{ marginBottom: '0.5rem' }}><b>공공데이터 출처:</b> {meta.api_source || '데이터 없음 (업종 평균 대체)'}</div>
              <div style={{ marginBottom: '0.5rem' }}><b>반경 내 점포 수:</b> {meta.store_count !== null ? `${meta.store_count}개` : '확인 불가'} (경쟁수준: {meta.competition_level})</div>
            </div>
            <div>
              <div style={{ marginBottom: '0.5rem' }}><b>데이터 신뢰도:</b> 
                <span style={{ color: meta.confidence_level === '높음' ? '#16a34a' : meta.confidence_level === '보통' ? '#ca8a04' : '#dc2626', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                  {meta.confidence_level}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '0.5rem' }}>(입력 데이터 완성도 기준)</span>
              </div>
              <div><b>업종 평균값 자동 적용 항목:</b> {meta.applied_defaults.length > 0 ? meta.applied_defaults.join(', ') : '없음 (직접 입력값 위주 적용)'}</div>
            </div>
          </div>
        </div>

      </div>
    );
  };

  // ==========================================
  // CHANGE 탭 결과 렌더링
  // ==========================================
  const renderChangeSimulationResult = () => {
    if (!result || result.isNewStartup) return null;
    const { currentBiz, targetBiz, scenarios, diff, upgradeCost, risk, score, meta } = result;
    const cBase = scenarios.current.base;
    const tBase = scenarios.target.base;

    const renderStars = (starCount) => {
      const stars = [];
      for(let i=1; i<=5; i++) {
        stars.push(<span key={i} style={{color: i<=starCount ? '#f59e0b' : '#e2e8f0', fontSize: '1.25rem'}}>★</span>);
      }
      return stars;
    };

    return (
      <div>
        <hr style={{borderTop: '1px solid #e2e8f0', margin: '2rem 0'}} />
        <h3 style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b'}}>
          🔄 업종 변경 비교 분석 결과
        </h3>

        {/* 1. 핵심 6개 결과 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0'}}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>현재 ({currentBiz}) 영업이익</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#475569' }}>
              {cBase.profit.toLocaleString()} <span style={{fontSize:'1rem', fontWeight:'500'}}>만원</span>
            </div>
          </div>
          
          <div style={{ backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #bfdbfe'}}>
            <div style={{ fontSize: '0.875rem', color: '#1d4ed8', marginBottom: '0.5rem', fontWeight: '600' }}>변경 후 ({targetBiz}) 영업이익</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
              {tBase.profit.toLocaleString()} <span style={{fontSize:'1rem', fontWeight:'500'}}>만원</span>
            </div>
          </div>

          <div style={{ backgroundColor: diff.profit > 0 ? '#f0fdf4' : '#fef2f2', padding: '1.5rem', borderRadius: '0.75rem', border: `1px solid ${diff.profit > 0 ? '#bbf7d0' : '#fecaca'}`}}>
            <div style={{ fontSize: '0.875rem', color: diff.profit > 0 ? '#166534' : '#991b1b', marginBottom: '0.5rem', fontWeight: '600' }}>월 순이익 증감액</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: diff.profit > 0 ? '#15803d' : '#dc2626' }}>
              {diff.profit > 0 ? '+' : ''}{diff.profit.toLocaleString()} <span style={{fontSize:'1rem', fontWeight:'500'}}>만원</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0'}}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>업종 변경 필요 투자금</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {upgradeCost.finalInvest.toLocaleString()} <span style={{fontSize:'1rem', fontWeight:'500'}}>만원</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: meta.tExtraInvestment >= upgradeCost.finalInvest ? '#16a34a' : '#dc2626', marginTop: '0.25rem' }}>
              {meta.tExtraInvestment >= upgradeCost.finalInvest ? '✅ 예산 내 진행 가능' : '❌ 추가 투자금 확보 필요'}
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0'}}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>투자금 회수 예상기간</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {diff.paybackMonths === null || diff.paybackMonths === Infinity || diff.paybackMonths <= 0 ? '불가' : diff.paybackMonths > 36 ? '36개월 이상' : `약 ${diff.paybackMonths}개월`}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>* 순이익 증가분 기준</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0'}}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>종합 추천도</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {renderStars(score.stars)}
            </div>
            <div style={{ fontSize: '0.8rem', color: score.stars >= 4 ? '#16a34a' : score.stars === 3 ? '#ca8a04' : '#dc2626', marginTop: '0.25rem', fontWeight: 'bold' }}>
              {score.stars >= 4 ? '추천' : score.stars === 3 ? '보통' : '신중'}
            </div>
          </div>
        </div>

        {/* 2. Before / After 비교표 */}
        <h4 style={{fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b'}}>⚖️ 현재 업종 VS 변경 업종 비교표</h4>
        <div style={{ overflowX: 'auto', marginBottom: '2.5rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#475569', fontWeight: '600' }}>항목 (월 기준)</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>현재 ({currentBiz})</th>
                <th style={{ padding: '1rem', color: '#1e40af', fontWeight: '700' }}>변경 후 ({targetBiz})</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>증감 추이</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#334155' }}>예상 월매출</td>
                <td style={{ padding: '1rem' }}>{cBase.sales.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#1e40af' }}>{tBase.sales.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', color: diff.sales > 0 ? '#16a34a' : '#dc2626' }}>{diff.sales > 0 ? '+' : ''}{diff.sales.toLocaleString()} 만원</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>월 변동비</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{cBase.variableCost.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{tBase.variableCost.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{(tBase.variableCost - cBase.variableCost).toLocaleString()} 만원</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>월 고정비</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{cBase.fixedCost.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{tBase.fixedCost.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{diff.fixed.toLocaleString()} 만원</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>손익분기 매출</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{cBase.bepSales === null || cBase.bepSales === Infinity ? '-' : cBase.bepSales.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{tBase.bepSales === null || tBase.bepSales === Infinity ? '-' : tBase.bepSales.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <td style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', color: '#0f172a' }}>월 순이익 (영업이익)</td>
                <td style={{ padding: '1rem', fontWeight: '700', color: cBase.profit > 0 ? '#16a34a' : '#dc2626' }}>{cBase.profit.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', fontWeight: '800', color: tBase.profit > 0 ? '#16a34a' : '#dc2626' }}>{tBase.profit.toLocaleString()} 만원</td>
                <td style={{ padding: '1rem', fontWeight: '700', color: diff.profit > 0 ? '#16a34a' : '#dc2626' }}>{diff.profit > 0 ? '+' : ''}{diff.profit.toLocaleString()} 만원</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>영업이익률</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{cBase.margin}%</td>
                <td style={{ padding: '1rem', color: '#1e40af', fontWeight: '600' }}>{tBase.margin}%</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{(tBase.margin - cBase.margin).toFixed(1)}%p</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. 투자비용 상세 & 4. 시나리오 & 5. 위험도 (3-Column Layout) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          {/* 투자비용 상세 */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>💸 업종 변경 비용 상세</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#475569' }}>철거비</span><span>{upgradeCost.demolition.toLocaleString()} 만원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#475569' }}>리모델링</span><span>{upgradeCost.remodeling.toLocaleString()} 만원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#475569' }}>간판</span><span>{upgradeCost.sign.toLocaleString()} 만원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#475569' }}>집기 교체</span><span>{upgradeCost.equipment.toLocaleString()} 만원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#475569' }}>인허가/기타</span><span>{(upgradeCost.license + upgradeCost.misc).toLocaleString()} 만원</span>
            </div>
            <hr style={{ margin: '0.75rem 0', borderColor: '#e2e8f0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: '600' }}>
              <span style={{ color: '#334155' }}>총 변경 비용</span><span>{upgradeCost.total.toLocaleString()} 만원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#16a34a' }}>
              <span>기존 집기 활용 절감액</span><span>- {upgradeCost.equipmentReuseSave.toLocaleString()} 만원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '1.1rem', fontWeight: '700', color: '#1e3a8a' }}>
              <span>최종 추가 투자금</span><span>{upgradeCost.finalInvest.toLocaleString()} 만원</span>
            </div>
          </div>

          {/* 시나리오 비교 */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>📉 수익 시나리오 분석</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>예상 월매출 변동(±20%)에 따른 영업이익 시나리오입니다.</p>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>현재 업종 시나리오</div>
              <div style={{ display: 'flex', gap: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '0.25rem' }}>최소<br/><b>{scenarios.current.min.profit.toLocaleString()}</b></div>
                <div style={{ flex: 1, backgroundColor: '#e2e8f0', padding: '0.5rem', borderRadius: '0.25rem' }}>평균<br/><b>{scenarios.current.base.profit.toLocaleString()}</b></div>
                <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '0.25rem' }}>최대<br/><b>{scenarios.current.max.profit.toLocaleString()}</b></div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1d4ed8', marginBottom: '0.5rem' }}>변경 업종 시나리오</div>
              <div style={{ display: 'flex', gap: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                <div style={{ flex: 1, backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '0.25rem', color: '#1e40af' }}>최소<br/><b>{scenarios.target.min.profit.toLocaleString()}</b></div>
                <div style={{ flex: 1, backgroundColor: '#dbeafe', padding: '0.5rem', borderRadius: '0.25rem', color: '#1e40af' }}>평균<br/><b>{scenarios.target.base.profit.toLocaleString()}</b></div>
                <div style={{ flex: 1, backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '0.25rem', color: '#1e40af' }}>최대<br/><b>{scenarios.target.max.profit.toLocaleString()}</b></div>
              </div>
            </div>
          </div>

          {/* 위험도 및 종합점수 */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>⚠️ 업종 변경 리스크</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#475569' }}>상권 경쟁도</span>
              <span style={{ fontWeight: '600', color: risk.competition === '높음' ? '#dc2626' : risk.competition === '보통' ? '#ca8a04' : '#16a34a' }}>{risk.competition}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#475569' }}>임대료 부담</span>
              <span style={{ fontWeight: '600', color: risk.rentBurden === '높음' ? '#dc2626' : risk.rentBurden === '보통' ? '#ca8a04' : '#16a34a' }}>{risk.rentBurden}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#475569' }}>회수기간 리스크</span>
              <span style={{ fontWeight: '600', color: risk.payback === '높음' ? '#dc2626' : risk.payback === '보통' ? '#ca8a04' : '#16a34a' }}>{risk.payback}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#475569' }}>운영 난이도</span>
              <span style={{ fontWeight: '600', color: risk.operation === '높음' ? '#dc2626' : risk.operation === '보통' ? '#ca8a04' : '#16a34a' }}>{risk.operation}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#475569' }}>배달 의존도</span>
              <span style={{ fontWeight: '600', color: risk.delivery === '높음' ? '#dc2626' : risk.delivery === '보통' ? '#ca8a04' : '#16a34a' }}>{risk.delivery}</span>
            </div>
            
            <hr style={{ margin: '1rem 0', borderColor: '#e2e8f0' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>종합 평가 점수</span>
              <div style={{ 
                width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: score.total >= 80 ? '#16a34a' : score.total >= 60 ? '#2563eb' : score.total >= 40 ? '#f59e0b' : '#dc2626',
                color: '#fff', fontWeight: 'bold', fontSize: '1.2rem'
              }}>
                {score.total}
              </div>
            </div>
          </div>

        </div>

        {/* 6. 추천 사유 및 데이터 기준 (2-Column) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ flex: '2 1 400px', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>🤖 데이터 기반 추천 사유</h4>
            <p style={{ color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: 0, fontSize: '0.95rem' }}>
              {meta.interpretation}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1.5rem', marginBottom: 0 }}>※ 입력 조건을 기반으로 계산된 참고용 결과이며 성공을 보장하지 않습니다.</p>
          </div>

          <div style={{ flex: '1 1 300px', backgroundColor: '#f1f5f9', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}>
            <h5 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '700', color: '#334155' }}>📌 분석 기준</h5>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
              <div><b>선택 상권:</b> {addressStr}</div>
              <div><b>비교 업종:</b> {currentBiz} ➡️ {targetBiz}</div>
              <div><b>공공데이터 출처:</b> {meta.api_source || '데이터 없음 (업종 평균 대체)'}</div>
              <div><b>상권 내 경쟁 점포 수:</b> {meta.store_count !== null ? `${meta.store_count}개` : '확인 불가'}</div>
              <div style={{ marginTop: '0.5rem' }}><b>자동 적용된 평균값:</b> {meta.applied_defaults.length > 0 ? meta.applied_defaults.join(', ') : '없음 (직접 입력값 위주 적용)'}</div>
              <div style={{ marginTop: '0.5rem' }}>
                <b>데이터 신뢰도:</b> 
                <span style={{ color: meta.confidence_level === '높음' ? '#16a34a' : meta.confidence_level === '보통' ? '#ca8a04' : '#dc2626', fontWeight: 'bold', marginLeft: '0.5rem' }}>{meta.confidence_level}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  };

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
          onClick={() => { setTab('NEW'); setResult(null); setError(null); }}
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
          onClick={() => { setTab('CHANGE'); setResult(null); setError(null); }}
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
        
        {/* 좌측 폼 */}
        <div style={{flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          
          {/* ========================================================
              NEW 탭 전용 입력 폼 
             ======================================================== */}
          {tab === 'NEW' && (
            <>
              {/* 희망 업종 선택 */}
              <div style={{border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff'}}>
                <h4 style={{marginBottom: '1rem', color: '#1E3A8A', fontWeight: 'bold'}}>🚀 희망 업종 선택</h4>
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

              {/* 기본 입력 조건 */}
              <div style={{border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff'}}>
                <h4 style={{marginBottom: '1rem', color: '#1E3A8A', fontWeight: 'bold'}}>💰 기본 입력 조건</h4>
                <label style={labelStyle}>가용 투자 예산</label>
                <div style={inputContainerStyle}>
                  <input type="number" min="0" value={investment} onChange={e => setInvestment(e.target.value)} style={inputStyle} />
                  <div style={unitStyle}>만원</div>
                </div>
                <label style={labelStyle}>예상 보증금</label>
                <div style={inputContainerStyle}>
                  <input type="number" min="0" value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="0" style={inputStyle} />
                  <div style={unitStyle}>만원</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>월 임대료</label>
                    <div style={inputContainerStyle}>
                      <input type="number" min="0" value={rent} onChange={e => setRent(e.target.value)} style={inputStyle} />
                      <div style={unitStyle}>만원</div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>월 관리비</label>
                    <div style={inputContainerStyle}>
                      <input type="number" min="0" value={adminFee} onChange={e => setAdminFee(e.target.value)} style={inputStyle} />
                      <div style={unitStyle}>만원</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>매장 전용면적</label>
                    <div style={inputContainerStyle}>
                      <input type="number" min="1" value={area} onChange={e => setArea(e.target.value)} style={inputStyle} />
                      <div style={unitStyle}>평</div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>예상 직원 수</label>
                    <div style={inputContainerStyle}>
                      <input type="number" min="0" value={employees} onChange={e => setEmployees(e.target.value)} style={inputStyle} />
                      <div style={unitStyle}>명</div>
                    </div>
                  </div>
                </div>

                <label style={labelStyle}>사장님 직접 근무 여부</label>
                <select value={isOwnerWorking ? 'Y' : 'N'} onChange={e => setIsOwnerWorking(e.target.value === 'Y')} style={selectStyle}>
                  <option value="Y">직접 근무 (인건비 절감)</option>
                  <option value="N">직원 중심 운영 (오토매장)</option>
                </select>
              </div>

              {/* 상세 조건 아코디언 */}
              <div style={{border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: '#ffffff', overflow: 'hidden'}}>
                <button 
                  onClick={() => setIsNewDetailOpen(!isNewDetailOpen)}
                  style={{ width: '100%', padding: '1rem 1.5rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold', color: '#1E3A8A' }}>
                  <span>⚙️ 상세 조건 설정 (선택)</span>
                  <span>{isNewDetailOpen ? '▲' : '▼'}</span>
                </button>
                {isNewDetailOpen && (
                  <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', marginTop: 0 }}>입력하지 않은 항목은 시스템 기본값으로 자동 계산됩니다.</p>
                    <label style={labelStyle}>배달 매출 비중 (%)</label>
                    <div style={inputContainerStyle}>
                      <input type="number" min="0" max="100" placeholder="업종 평균 사용" value={detailDeliveryRate} onChange={e => setDetailDeliveryRate(e.target.value)} style={inputStyle} />
                    </div>
                    {/* ... (생략된 기타 상세항목은 위에서 정의한 state를 사용) ... */}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================================
              CHANGE 탭 전용 입력 폼 
             ======================================================== */}
          {tab === 'CHANGE' && (
            <>
              {/* 현재 업종 정보 */}
              <div style={{border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff'}}>
                <h4 style={{marginBottom: '1rem', color: '#1E3A8A', fontWeight: 'bold'}}>🏢 현재 업종 정보</h4>
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
                
                {/* 현재 업종 상세 입력 아코디언 */}
                <div style={{marginTop: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden'}}>
                  <button 
                    onClick={() => setIsChangeCurrentDetailOpen(!isChangeCurrentDetailOpen)}
                    style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '600', color: '#475569', fontSize: '0.95rem' }}>
                    <span>현재 매장 운영 현황 입력</span>
                    <span>{isChangeCurrentDetailOpen ? '▲' : '▼'}</span>
                  </button>
                  {isChangeCurrentDetailOpen && (
                    <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', marginTop: 0 }}>* 비워둘 경우 상권 및 업종 평균값으로 추정합니다.</p>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>현재 매장 평수</label>
                          <div style={inputContainerStyle}>
                            <input type="number" min="1" value={cArea} onChange={e => setCArea(e.target.value)} style={inputStyle} />
                            <div style={unitStyle}>평</div>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>현재 직원 수</label>
                          <div style={inputContainerStyle}>
                            <input type="number" min="0" value={cEmployees} onChange={e => setCEmployees(e.target.value)} style={inputStyle} />
                            <div style={unitStyle}>명</div>
                          </div>
                        </div>
                      </div>

                      <label style={labelStyle}>현재 월 매출액</label>
                      <div style={inputContainerStyle}>
                        <input type="number" min="0" placeholder="상권 평균 추정" value={cSales} onChange={e => setCSales(e.target.value)} style={inputStyle} />
                        <div style={unitStyle}>만원</div>
                      </div>

                      <label style={labelStyle}>현재 월 임대료</label>
                      <div style={inputContainerStyle}>
                        <input type="number" min="0" value={cRent} onChange={e => setCRent(e.target.value)} style={inputStyle} />
                        <div style={unitStyle}>만원</div>
                      </div>

                      <label style={labelStyle}>현재 월 인건비</label>
                      <div style={inputContainerStyle}>
                        <input type="number" min="0" placeholder="직원 수 기반 추정" value={cLaborCost} onChange={e => setCLaborCost(e.target.value)} style={inputStyle} />
                        <div style={unitStyle}>만원</div>
                      </div>

                    </div>
                  )}
                </div>
              </div>

              {/* 희망 업종 정보 */}
              <div style={{border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff'}}>
                <h4 style={{marginBottom: '1rem', color: '#1E3A8A', fontWeight: 'bold'}}>🚀 변경 희망 업종</h4>
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

                {/* 전환 시 상세 조건 아코디언 */}
                <div style={{marginTop: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden'}}>
                  <button 
                    onClick={() => setIsChangeTargetDetailOpen(!isChangeTargetDetailOpen)}
                    style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '600', color: '#475569', fontSize: '0.95rem' }}>
                    <span>업종 전환 조건 입력</span>
                    <span>{isChangeTargetDetailOpen ? '▲' : '▼'}</span>
                  </button>
                  {isChangeTargetDetailOpen && (
                    <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                      <label style={labelStyle}>추가 투자 가능 금액 (가용 예산)</label>
                      <div style={inputContainerStyle}>
                        <input type="number" min="0" value={investment} onChange={e => setInvestment(e.target.value)} style={inputStyle} />
                        <div style={unitStyle}>만원</div>
                      </div>

                      <label style={labelStyle}>예상 리모델링 비용</label>
                      <div style={inputContainerStyle}>
                        <input type="number" min="0" placeholder="기본 평당 150만원 추정" value={tRemodeling} onChange={e => setTRemodeling(e.target.value)} style={inputStyle} />
                        <div style={unitStyle}>만원</div>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#334155', marginTop: '1rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={tReuseEquipment} 
                          onChange={e => setTReuseEquipment(e.target.checked)} 
                          style={{ width: '1.2rem', height: '1.2rem' }}
                        />
                        기존 집기 및 인테리어 최대한 재활용 (비용 절감)
                      </label>

                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>

        {/* 우측 지도 및 실행 버튼 */}
        <div style={{flex: '1.5 1 400px', display: 'flex', flexDirection: 'column'}}>
          <div style={{border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', flex: 1, display: 'flex', flexDirection: 'column'}}>
            <h3 style={{fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b'}}>📍 상권 위치 선택 (마커 정보: {tSmall || '전체 업종'})</h3>
            <div style={{ fontSize: '0.9rem', color: '#1E3A8A', marginBottom: '1rem', fontWeight: 'bold' }}>현재 위치: {addressStr}</div>
            
            <div ref={mapContainer} style={{ width: '100%', minHeight: '320px', height: '100%', maxHeight: '500px', borderRadius: '0.5rem', position: 'relative' }}>
              {!mapLoaded && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>지도 로딩중...</div>}
            </div>
            
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem', marginBottom: '1.5rem' }}>지도를 드래그하여 분석할 상권의 중심을 이동하세요. 이동된 위치의 상권 정보가 반영됩니다.</p>
            
            {error && (
              <div role="alert" aria-live="assertive" style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontWeight: '600', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}

            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              style={{ 
                padding: '1rem', 
                backgroundColor: tab === 'NEW' ? '#1E3A8A' : '#1d4ed8', 
                color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', 
                fontSize: '1.1rem', fontWeight: 'bold', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                width: '100%', transition: 'background-color 0.2s',
                minHeight: '44px'
              }}>
              {loading ? '분석 중...' : tab === 'NEW' ? '신규 창업 분석하기 ➡️' : '업종 변경 비교 분석하기 ➡️'}
            </button>
          </div>
        </div>

      </div>

      {result && (
        <div style={{ scrollMarginTop: '2rem' }} id="result-area">
          {tab === 'NEW' ? renderNewStartupResult() : renderChangeSimulationResult()}
          <AdSlot position="bottom" style={{ marginTop: '2rem' }} />
        </div>
      )}
      
      {!result && (
        <AdSlot position="middle" style={{ marginTop: '2rem', marginBottom: '2rem' }} />
      )}
    </div>
  );
}
