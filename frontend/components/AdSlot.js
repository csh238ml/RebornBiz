'use client'; // 클라이언트 사이드에서만 실행되도록 보장 (렌더링 에러 방지)

import { useEffect, useRef } from 'react';

export default function AdSlot({ position = 'default' }) {
  const adRef = useRef(null);

  useEffect(() => {
    // 광고 스크립트 초기화 로직 (예: 구글 애드센스 push)
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div 
      ref={adRef} 
      className={`ad-container ad-pos-${position}`} 
      style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '90px', width: '100%', margin: '20px 0', overflow: 'hidden',
        border: '2px dashed #cccccc', borderRadius: '10px',
        backgroundColor: '#f8f9fa', color: '#adb5bd'
      }}
    >
      <div style={{position: 'absolute', fontSize: '0.875rem', fontWeight: 'bold'}}>AD Space</div>
      {/* 실제 애드센스 ins 태그 등이 위치할 곳 (기본 UI 뼈대) */}
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', height: '100%' }}
           data-ad-client="ca-pub-4577150400116930"
           data-ad-slot="1234567890"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}
