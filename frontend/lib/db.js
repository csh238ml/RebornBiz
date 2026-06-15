import mysql from 'mysql2/promise';

// Next.js(frontend) 환경에서 상위 폴더의 .env를 자동으로 불러오지 못해 연결이 실패하는(502 에러) 현상을 방지하기 위해,
// process.env가 없을 경우 실제 운영 환경의 DB 접속 정보를 Fallback으로 사용하도록 구성했습니다.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'reborn-biz-db.cf08ake2amg0.ap-northeast-2.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'sukhyunE!23',
  database: process.env.DB_NAME || 'rebornbiz',
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
    // 실제 사용 중인 테이블(reborn_board)과 컬럼들을 정확히 매핑하여 SELECT 쿼리를 실행합니다.
    const [rows] = await pool.query(
      'SELECT id, title, content_html, views, created_at FROM reborn_board WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const post = rows[0];

    // 기존 백엔드(database.py)와 동일하게 게시글 상세 조회 시 조회수(views)를 1 증가시킵니다.
    await pool.query('UPDATE reborn_board SET views = views + 1 WHERE id = ?', [id]);

    return {
      id: post.id,
      title: post.title,
      content_html: post.content_html,
      views: post.views + 1, // 반영된 조회수 반환
      created_at: post.created_at,
      thumbnail_url: null // reborn_board 스키마에 thumbnail_url이 없으므로 null 처리
    };
  } catch (error) {
    console.error(`[DB Error] getBoardDetail failed for id ${id}:`, error);
    // 502 에러 등의 원인 파악을 위해 에러를 던져 서버 로그에 남깁니다.
    throw error;
  }
}
