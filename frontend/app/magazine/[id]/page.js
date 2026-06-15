import { notFound } from 'next/navigation';
import { getBoardDetail } from '@/lib/db'; 
import AdSlot from '@/components/AdSlot';

// 1. 동적 메타데이터 생성 (SEO 및 공유 썸네일 최적화)
export async function generateMetadata({ params }) {
  const { id } = params;
  const post = await getBoardDetail(id);

  if (!post) {
    return { title: '게시글을 찾을 수 없습니다 | Reborn 매거진' };
  }

  // HTML 태그 제거 및 150자 추출 로직 적용
  const plainText = post.content_html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const description = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;

  // DB에 썸네일이 없다면 기본 이미지 사용
  const imageUrl = post.thumbnail_url || '/images/default-magazine.jpg';

  return {
    title: `${post.title} | Reborn 매거진`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      url: `https://rebornbiz.co.kr/magazine/${id}`,
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

// 2. 서버 사이드 데이터 패칭 (Server Component)
export default async function MagazineDetailPage({ params }) {
  const { id } = params;
  const post = await getBoardDetail(id);

  if (!post) {
    notFound(); // 404 페이지로 라우팅
  }

  return (
    <article className="magazine-detail">
      {/* 시맨틱 태그 준수 */}
      <header>
        <h1>{post.title}</h1>
        <div className="meta-info">
          <span>📅 {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
          <span>👁️ 조회수: {post.views}</span>
        </div>
      </header>

      {/* 썸네일 이미지가 있을 경우 alt 속성 필수 적용 */}
      {post.thumbnail_url && (
        <figure>
          <img 
            src={post.thumbnail_url} 
            alt={`매거진 이미지: ${post.title}`} 
            width="100%" 
            loading="lazy"
          />
        </figure>
      )}

      {/* 본문 콘텐츠: HTML 통째로 주입 (보안 유의, sanitize 등 필요) */}
      <section 
        className="content-body" 
        dangerouslySetInnerHTML={{ __html: post.content_html }} 
      />

      {/* 본문 하단 광고 */}
      <AdSlot position="content_bottom" />
    </article>
  );
}
