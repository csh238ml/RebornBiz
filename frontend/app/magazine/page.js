import Link from 'next/link';
import StickyHeader from '@/components/StickyHeader';
import Pagination from '@/components/Pagination';
import AdSlot from '@/components/AdSlot';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

async function fetchPosts(search = '') {
  try {
    const url = search
      ? `${FASTAPI_URL}/api/magazine?search=${encodeURIComponent(search)}`
      : `${FASTAPI_URL}/api/magazine`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error('Failed to fetch magazine posts:', err);
    return [];
  }
}

export async function generateMetadata({ searchParams }) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';
  const page = resolvedParams?.page || '';

  const title = search
    ? `'${search}' 검색 결과 | Reborn 매거진`
    : 'Reborn 매거진 | 성공적인 재창업과 상권 분석 인사이트';

  const hasQueryParams = Boolean(search || page);

  return {
    title,
    description: '소상공인을 위한 최신 정책, 창업 가이드, 그리고 상권 분석 인사이트를 만나보세요.',
    alternates: {
      canonical: '/magazine',
    },
    robots: {
      index: !hasQueryParams,
    },
    openGraph: {
      title,
      description: '빠르게 변화하는 트렌드를 확인하고 성공적인 비즈니스를 준비하세요!',
      type: 'website',
      url: 'https://www.rebornbiz.co.kr/magazine',
    }
  };
}

export default async function MagazineListPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';
  const page = parseInt(resolvedParams?.page || '1', 10);

  const posts = await fetchPosts(search);
  
  const totalPages = Math.ceil(posts.length / 10);
  const currentPosts = posts.slice((page - 1) * 10, page * 10);

  return (
    <div className="custom-main">
      <StickyHeader>
        <div className="pc-only" style={{ alignItems: 'center', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '1rem' }}>
          <div style={{ flexShrink: 0, marginRight: '2rem' }}>
            <img src="/rebornBiz_logo.png" alt="RebornBiz Logo" style={{ width: '200px', height: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#31333F' }}>Reborn 매거진</h1>
            <p style={{ fontSize: '1rem', marginBottom: '0', lineHeight: '1.6', color: '#555' }}>
              소상공인을 위한 최신 정책, 창업 가이드, 그리고 상권 분석 인사이트를 만나보세요.<br />
              빠르게 변화하는 트렌드를 확인하고 성공적인 비즈니스를 준비하세요!
            </p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <img src="/images/rebornbiz_main_mobile.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#31333F' }}>Reborn 매거진</h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>
            소상공인을 위한 최신 정책, 창업 가이드, 그리고 상권 분석 인사이트를 만나보세요.<br />
            빠르게 변화하는 트렌드를 확인하고 성공적인 비즈니스를 준비하세요!
          </p>
        </div>
      </StickyHeader>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />

      <form action="/magazine" method="GET" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="검색어를 입력하세요 (예: 지원금, 상권 분석 등)"
          style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA' }}
        />
        <button type="submit" style={{ padding: '0 1.5rem', backgroundColor: '#FFFFFF', color: '#31333F', border: '1px solid rgba(49, 51, 63, 0.2)', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
          🔍 검색
        </button>
      </form>

      <div>
        {posts.length === 0 ? (
          <div style={{ padding: '2rem', backgroundColor: '#F8F9FA', textAlign: 'center', borderRadius: '0.5rem' }}>검색 결과가 없습니다.</div>
        ) : (
          currentPosts.map((post, idx) => (
            <div key={post.id}>
              <div style={{ marginBottom: '1rem', padding: '1.5rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                <Link href={`/magazine/${post.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <h3 style={{ color: '#1E3A8A', marginTop: 0, fontSize: '1.3rem' }}>{post.title}</h3>
                  <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '10px' }}>
                    <span>📅 {post.created_at}</span>
                    <span style={{ marginLeft: '15px' }}>👁️ 조회수 {post.views}</span>
                  </div>
                </Link>
              </div>
              {/* 5번째 아이템 뒤에 광고 삽입 (인덱스 4) */}
              {idx === 4 && <AdSlot position="middle" style={{ margin: '1rem 0' }} />}
            </div>
          ))
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} basePath="/magazine" search={search} />

      <AdSlot style={{ marginTop: '3rem' }} />
    </div>
  );
}
