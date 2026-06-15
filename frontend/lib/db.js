import mysql from 'mysql2/promise';

// MySQL(RDS) Connection Pool 생성
// DB 접속 정보는 기존 환경 변수(.env) 정보를 활용하여 하드코딩을 방지합니다.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * 특정 ID의 매거진(게시판) 글을 조회합니다.
 * @param {string|number} id - 게시글 ID
 * @returns {Promise<Object|null>} - 게시글 객체 또는 null
 */
export async function getBoardDetail(id) {
  try {
    // 요건에는 posts 테이블로 언급되었으나, 기존 Python 코드의 스키마 구조(reborn_board)와 맞추기 위해 reborn_board를 조회합니다.
    // 만약 실제 Next.js 마이그레이션 중 테이블명이 posts로 변경되었다면 'reborn_board'를 'posts'로 변경하시면 됩니다.
    const [rows] = await pool.query(
      'SELECT id, title, content_html, views, created_at FROM reborn_board WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const post = rows[0];

    // SEO 최적화 및 기존 기능 보존을 위해 조회수(views) 증가 처리
    await pool.query('UPDATE reborn_board SET views = views + 1 WHERE id = ?', [id]);

    return {
      id: post.id,
      title: post.title,
      content_html: post.content_html,
      views: post.views + 1, // 반영된 조회수
      created_at: post.created_at,
      thumbnail_url: post.thumbnail_url || '/images/default-thumbnail.jpg' // 스키마에 없을 경우 기본값 폴백
    };
  } catch (error) {
    console.error(`[DB Error] getBoardDetail failed for id ${id}:`, error);
    return null;
  }
}
