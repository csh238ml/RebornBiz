'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function MagazineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const FASTAPI_URL = 'http://localhost:8000';
        const res = await fetch(`${FASTAPI_URL}/api/magazine/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (data.success) {
          setPost(data.data);
        } else {
          setError('게시글을 찾을 수 없거나 삭제되었습니다.');
        }
      } catch (err) {
        setError('서버에 연결할 수 없습니다.');
      }
      setLoading(false);
    };

    fetchPost();
  }, [params.id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('링크가 복사되었습니다!'))
      .catch(() => alert('링크 복사에 실패했습니다.'));
  };

  if (loading) return <div style={{padding: '3rem', textAlign: 'center'}}>로딩 중...</div>;
  if (error || !post) return (
    <div style={{padding: '3rem', textAlign: 'center'}}>
      <div style={{color: '#ef4444', marginBottom: '1rem'}}>{error || '게시글을 찾을 수 없습니다.'}</div>
      <button onClick={() => router.push('/magazine')} style={{padding: '0.5rem 1rem', cursor: 'pointer'}}>⬅️ 목록으로 돌아가기</button>
    </div>
  );

  return (
    <div style={{maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', color: '#31333F'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
        <button onClick={() => router.push('/magazine')} style={{padding: '0.5rem 1rem', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
          ⬅️ 목록으로
        </button>
        <button onClick={copyToClipboard} style={{padding: '0.5rem 1rem', backgroundColor: '#FF8C42', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
          🔗 링크 복사
        </button>
      </div>

      <hr style={{borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1rem 0 2rem 0'}} />

      <h1 style={{color: '#1E3A8A', marginBottom: '10px', fontSize: '2rem'}}>{post.title}</h1>
      
      <div style={{color: '#888', fontSize: '0.95rem', marginBottom: '30px'}}>
        <span>📅 작성일: {post.created_at}</span>
        <span style={{marginLeft: '15px'}}>👁️ 조회수: {post.views}</span>
      </div>

      <div style={{lineHeight: '1.8', fontSize: '1.1rem'}} dangerouslySetInnerHTML={{__html: post.content_html}} />

      <hr style={{borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '2rem 0'}} />

      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
        <button onClick={() => router.push('/magazine')} style={{padding: '0.5rem 1rem', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
          ⬅️ 목록으로
        </button>
        <button onClick={copyToClipboard} style={{padding: '0.5rem 1rem', backgroundColor: '#FF8C42', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
          🔗 링크 복사
        </button>
      </div>
    </div>
  );
}
