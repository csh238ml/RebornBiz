import Link from 'next/link';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

async function fetchLatestPosts() {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/magazine`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data.slice(0, 6) : [];
  } catch (err) {
    console.error('Failed to fetch magazine posts:', err);
    return [];
  }
}

export default async function LatestMagazine() {
  let posts = [];
  try {
    posts = await fetchLatestPosts();
  } catch (err) {
    console.error(err);
  }

  return (
    <section className="home-section bg-white guideSection">
      <div className="section-header">
        <h2 style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          소상공인 실전 가이드
        </h2>
        <p style={{ textAlign: 'left' }}>폐업 준비, 세금, 창업, 상권 분석에 필요한 정보를 확인하세요.</p>
      </div>
      
      {posts.length === 0 ? (
        <div className="guideCardFallback">
          <h3>소상공인 실전 가이드</h3>
          <p>폐업 준비, 세금, 창업, 상권 분석에 필요한 정보를 확인하세요.</p>
          <Link href="/magazine" className="cta-button cta-primary">
            매거진 전체 보기
          </Link>
        </div>
      ) : (
        <div className="grid-3">
          {posts.map(post => (
            <Link href={`/magazine/${post.id}`} key={post.id} className="card magazine-card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h3 className="line-clamp-2" style={{ color: '#1E3A8A', fontSize: '1.125rem' }}>{post.title}</h3>
              {post.summary && <p className="line-clamp-3" style={{ fontSize: '0.95rem', color: '#475569', marginTop: '0.5rem', flex: 1 }}>{post.summary}</p>}
              <div className="magazine-meta">
                {post.created_at && <span>📅 {post.created_at}</span>}
                {post.views !== undefined && <span>👁️ {post.views}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {posts.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <Link href="/magazine" className="cta-button cta-secondary">
            매거진 전체 보기
          </Link>
        </div>
      )}
    </section>
  );
}
