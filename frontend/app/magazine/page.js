'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MagazineListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPosts = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const FASTAPI_URL = 'http://localhost:8000';
      const url = search ? `${FASTAPI_URL}/api/magazine?search=${encodeURIComponent(search)}` : `${FASTAPI_URL}/api/magazine`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없습니다. 백엔드 서버(포트 8000)가 실행 중인지 확인하세요.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(searchTerm);
  };

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', color: '#31333F'}}>
      <h1 style={{fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem'}}>📰 [매거진] Reborn 매거진</h1>
      <p style={{fontSize: '1rem', marginBottom: '2rem', lineHeight: '1.6'}}>소상공인을 위한 최신 정책, 창업 가이드, 그리고 상권 분석 인사이트를 만나보세요.<br/>빠르게 변화하는 트렌드를 확인하고 성공적인 비즈니스를 준비하세요!</p>

      <hr style={{borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0'}} />

      <form onSubmit={handleSearch} style={{display: 'flex', gap: '0.5rem', marginBottom: '2rem'}}>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="검색어를 입력하세요 (예: 지원금, 상권 분석 등)" 
          style={{flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(49, 51, 63, 0.2)', fontSize: '1rem', backgroundColor: '#FAFAFA'}}
        />
        <button type="submit" style={{padding: '0 1.5rem', backgroundColor: '#FFFFFF', color: '#31333F', border: '1px solid rgba(49, 51, 63, 0.2)', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer'}}>🔍 검색</button>
      </form>

      {error && <div style={{ padding: '1rem', backgroundColor: '#ffbd45', color: '#31333F', borderRadius: '0.25rem', marginBottom: '2rem' }}>{error}</div>}

      {loading ? (
        <div style={{textAlign: 'center', padding: '3rem', color: '#666'}}>데이터를 불러오는 중입니다...</div>
      ) : (
        <div>
          {posts.length === 0 ? (
            <div style={{padding: '2rem', backgroundColor: '#F8F9FA', textAlign: 'center', borderRadius: '0.5rem'}}>검색 결과가 없습니다.</div>
          ) : (
            posts.map(post => (
              <div key={post.id} style={{marginBottom: '1rem', padding: '1.5rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s'}}>
                <Link href={`/magazine/${post.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                  <h3 style={{color: '#1E3A8A', marginTop: 0, fontSize: '1.3rem'}}>{post.title}</h3>
                  <div style={{color: '#888', fontSize: '0.9rem', marginTop: '10px'}}>
                    <span>📅 {post.created_at}</span>
                    <span style={{marginLeft: '15px'}}>👁️ 조회수 {post.views}</span>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
