import Link from 'next/link';

export default function MagazineListPage() {
  return (
    <div className="custom-main">
      <div className="custom-header">
        <h1>Reborn 매거진</h1>
        <p>빠르게 변화하는 소상공인 트렌드, 성공적인 비즈니스를 위한 인사이트와 가이드를 만나보세요.</p>
      </div>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <p>매거진 게시글 리스트가 이식될 화면입니다.</p>
        <p style={{ marginTop: '1rem' }}>
          {/* 테스트용 링크 */}
          <Link href="/magazine/1" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            👉 임시 매거진 상세 글(ID: 1) 보기 테스트
          </Link>
        </p>
      </div>
    </div>
  );
}
