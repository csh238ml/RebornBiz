'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Sidebar.css';

// SVGs mapped to Lucide icons
const Icons = {
  Home: () => <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Calculator: () => <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>,
  ReceiptText: () => <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>,
  ArrowRightLeft: () => <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>,
  MapPin: () => <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Chart: () => <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16v5"/><path d="M16 14v7"/><path d="M20 10v11"/><path d="M4 18v3"/><path d="M8 14v7"/><path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"/></svg>,
  BookOpen: () => <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Menu: () => <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  Close: () => <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef(null);

  // 현재 경로가 메뉴 링크와 일치하는지 확인 (홈("/") 예외 처리 포함)
  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  // Drawer 닫기 핸들러
  const closeDrawer = () => setIsOpen(false);

  // 모바일에서 Drawer 열림/닫힘에 따른 Body Scroll Lock 적용
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 모바일 메뉴가 열렸을 때 첫번째 포커스 이동 (접근성)
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      // 메뉴의 첫 번째 링크에 포커스 (약간의 지연 시간 후 실행하여 애니메이션 대응)
      const firstLink = sidebarRef.current.querySelector('a');
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 50);
      }
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile Sticky Header */}
      <div className="mobile-header">
        <Link href="/" className="mobile-logo" onClick={closeDrawer}>RebornBiz</Link>
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isOpen}
          aria-controls="main-sidebar"
        >
          {isOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={closeDrawer}
        aria-hidden="true"
      ></div>

      {/* Sidebar Wrapper */}
      <aside 
        id="main-sidebar"
        ref={sidebarRef}
        className={`sidebar-wrapper ${isOpen ? 'open' : ''}`}
      >
        <Link href="/" className="sidebar-logo" onClick={closeDrawer}>
          RebornBiz
        </Link>

        <nav aria-label="주요 메뉴" className="sidebar-nav">
          <Link 
            href="/" 
            className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeDrawer}
            aria-current={isActive('/') ? "page" : undefined}
          >
            <Icons.Home /> 홈
          </Link>

          <div className="sidebar-group-title">도구</div>
          <Link 
            href="/calculator" 
            className={`sidebar-link ${isActive('/calculator') ? 'active' : ''}`}
            onClick={closeDrawer}
            aria-current={isActive('/calculator') ? "page" : undefined}
          >
            <Icons.Calculator /> 폐업 비용 계산기
          </Link>
          <Link 
            href="/tax_cal" 
            className={`sidebar-link ${isActive('/tax_cal') ? 'active' : ''}`}
            onClick={closeDrawer}
            aria-current={isActive('/tax_cal') ? "page" : undefined}
          >
            <Icons.ReceiptText /> 폐업 세금 계산기
          </Link>
          <Link 
            href="/simulation" 
            className={`sidebar-link ${isActive('/simulation') ? 'active' : ''}`}
            onClick={closeDrawer}
            aria-current={isActive('/simulation') ? "page" : undefined}
          >
            <Icons.ArrowRightLeft /> 업종 변경 시뮬레이션
          </Link>
          <Link 
            href="/market_analysis" 
            className={`sidebar-link ${isActive('/market_analysis') ? 'active' : ''}`}
            onClick={closeDrawer}
            aria-current={isActive('/market_analysis') ? "page" : undefined}
          >
            <Icons.MapPin /> 내 주변 상권 분석
          </Link>

          <div className="sidebar-group-title">콘텐츠</div>
          <Link 
            href="/statistics" 
            className={`sidebar-link ${isActive('/statistics') ? 'active' : ''}`}
            onClick={closeDrawer}
            aria-current={isActive('/statistics') ? "page" : undefined}
          >
            <Icons.Chart /> 창업·폐업 트렌드
          </Link>
          <Link 
            href="/magazine" 
            className={`sidebar-link ${isActive('/magazine') ? 'active' : ''}`}
            onClick={closeDrawer}
            aria-current={isActive('/magazine') ? "page" : undefined}
          >
            <Icons.BookOpen /> Reborn 매거진
          </Link>
        </nav>
      </aside>
    </>
  );
}
