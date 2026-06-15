// lib/db.js (Mock DB module for Next.js SSR)

export async function getBoardDetail(id) {
  // 실제 DB 연결 로직(예: Prisma, TypeORM, node-postgres 등)이 들어갈 자리입니다.
  // 이 예제에서는 테스트용 Mock 데이터를 반환합니다.
  
  if (id === 'not-found') return null;
  
  return {
    id: id,
    title: `테스트 매거진 게시물 ${id}`,
    content_html: `<p>이것은 <b>테스트 매거진 ${id}</b>의 상세 내용입니다.</p><p>SEO 최적화를 위해 이 내용이 서버 사이드에서 완전한 HTML로 렌더링되어 클라이언트에게 전달됩니다.</p>`,
    created_at: new Date().toISOString(),
    views: 1042,
    thumbnail_url: '/images/test-thumbnail.jpg'
  };
}
