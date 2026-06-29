'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* 모바일용 배경 오버레이 (사이드바 열릴 때 클릭 시 닫기) */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
      )}

      {/* 사이드바 영역 */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <Link href="/" className="sidebar-title" onClick={() => setIsOpen(false)}>RebornBiz</Link>
        <nav>
          <Link href="/" onClick={() => setIsOpen(false)}>🏠 홈</Link>
          <Link href="/calculator" onClick={() => setIsOpen(false)}>🧮 폐업 비용 계산기</Link>
          <Link href="/tax_cal" onClick={() => setIsOpen(false)}>🧾 폐업 세금 계산기</Link>
          <Link href="/simulation" onClick={() => setIsOpen(false)}>📈 업종 변경 시뮬레이션</Link>
          <Link href="/market_analysis" onClick={() => setIsOpen(false)}>📍 내 주변 상권 분석</Link>
          <Link href="/statistics" onClick={() => setIsOpen(false)}>📊 창업·폐업 트렌드</Link>
          <Link href="/magazine" onClick={() => setIsOpen(false)}>📰 Reborn 매거진</Link>
        </nav>
      </aside>
    </>
  );
}
