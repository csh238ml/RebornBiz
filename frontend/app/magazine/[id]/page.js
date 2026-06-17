import Link from 'next/link';
import StickyHeader from '@/components/StickyHeader';
import CopyLinkButton from './CopyLinkButton';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

async function getPost(id) {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/magazine/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch post: ${res.status}`);
    }
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.id);
  
  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다 | RebornBiz 매거진',
      description: '존재하지 않거나 삭제된 게시글입니다.'
    };
  }

  // 간단한 정규식으로 HTML 태그를 제거하여 description 생성
  const plainTextDescription = post.content_html
    ? post.content_html.replace(/<[^>]+>/g, '').substring(0, 150) + '...'
    : 'RebornBiz 매거진에서 소상공인 재창업과 폐업에 대한 유용한 정보를 확인하세요.';

  return {
    title: `${post.title} | RebornBiz 매거진`,
    description: plainTextDescription,
    openGraph: {
      title: post.title,
      description: plainTextDescription,
      type: 'article',
      publishedTime: post.created_at,
    }
  };
}

export default async function MagazineDetailPage({ params }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.id);

  if (!post) {
    return (
      <div style={{padding: '3rem', textAlign: 'center'}}>
        <div style={{color: '#ef4444', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold'}}>
          게시글을 찾을 수 없거나 삭제되었습니다.
        </div>
        <Link href="/magazine" style={{
          display: 'inline-block',
          padding: '0.5rem 1rem', 
          backgroundColor: '#fff', 
          color: '#333', 
          border: '1px solid #ccc', 
          borderRadius: '6px', 
          textDecoration: 'none',
          fontWeight: 'bold'
        }}>
          ⬅️ 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div style={{maxWidth: '900px', margin: '0 auto', padding: '0 2rem 2rem 2rem', fontFamily: 'sans-serif', color: '#31333F'}}>
      <StickyHeader>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
          <Link href="/magazine" style={{
            padding: '0.5rem 1rem', 
            backgroundColor: '#fff', 
            color: '#333', 
            border: '1px solid #ccc', 
            borderRadius: '6px', 
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            ⬅️ 목록으로
          </Link>
          <CopyLinkButton />
        </div>

        <h1 style={{color: '#1E3A8A', marginBottom: '10px', fontSize: '2rem'}}>{post.title}</h1>
        
        <div style={{color: '#888', fontSize: '0.95rem', marginBottom: '10px'}}>
          <span>📅 작성일: {post.created_at}</span>
          <span style={{marginLeft: '15px'}}>👁️ 조회수: {post.views}</span>
        </div>
      </StickyHeader>

      <div style={{lineHeight: '1.8', fontSize: '1.1rem'}} dangerouslySetInnerHTML={{__html: post.content_html}} />

      <hr style={{borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '2rem 0'}} />

      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
        <Link href="/magazine" style={{
          padding: '0.5rem 1rem', 
          backgroundColor: '#fff', 
          color: '#333', 
          border: '1px solid #ccc', 
          borderRadius: '6px', 
          textDecoration: 'none',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center'
        }}>
          ⬅️ 목록으로
        </Link>
        <CopyLinkButton />
      </div>
    </div>
  );
}
