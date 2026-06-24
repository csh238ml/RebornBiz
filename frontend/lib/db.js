import mysql from 'mysql2/promise';

// RebornBiz 프로젝트의 실제 DB 접속 환경 변수를 참조하여 Connection Pool 구성
// Next.js 환경 특성상 .env 로드가 누락될 경우를 대비해 기존 파이썬 백엔드의 실제 값을 Fallback으로 지정
export const pool = mysql.createPool({
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
 * 접속 로그를 access_logs 테이블에 기록합니다.
 */
export async function logPageAccess(menu_name, ip_address = 'unknown', user_agent = 'unknown') {
  try {
    // KST(한국 시간)로 현재 시간 계산
    const now = new Date();
    const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const kstString = kstDate.toISOString().slice(0, 19).replace('T', ' ');

    await pool.query(
      'INSERT INTO access_logs (access_time, ip_address, user_agent, accessed_menu) VALUES (?, ?, ?, ?)',
      [kstString, ip_address, user_agent, menu_name]
    );
  } catch (error) {
    console.error(`[DB Error] logPageAccess failed:`, error);
  }
}

/**
 * 특정 ID의 매거진(게시판) 글을 조회합니다.
 * @param {string|number} id - 게시글 ID
 * @returns {Promise<Object|null>} - 게시글 객체 또는 null
 */
export async function getBoardDetail(id) {
  try {
    // 파이썬 SQLAlchemy 모델(RebornBoard)에 매핑된 실제 DB 테이블명 'reborn_board' 사용
    // 진짜 컬럼 명세: id, title, content_html, views, created_at
    const [rows] = await pool.query(
      'SELECT id, title, content_html, views, created_at FROM reborn_board WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const post = rows[0];

    // 조회수 증가 업데이트 (기존 백엔드 로직 유지)
    await pool.query('UPDATE reborn_board SET views = views + 1 WHERE id = ?', [id]);

    return {
      id: post.id,
      title: post.title,
      content_html: post.content_html,
      views: post.views + 1, // 방금 업데이트된 조회수
      created_at: post.created_at,
      thumbnail_url: null // 현재 스키마에 존재하지 않으므로 null
    };
  } catch (error) {
    console.error(`[DB Error] getBoardDetail failed for id ${id}:`, error);
    throw error;
  }
}

/**
 * 최신 매거진(게시판) 글 목록을 조회합니다. (RSS 피드용)
 * @param {number} limit - 가져올 글의 개수
 * @returns {Promise<Array>} - 게시글 목록
 */
export async function getLatestPosts(limit = 20) {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, content_html, created_at FROM reborn_board ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows;
  } catch (error) {
    console.error(`[DB Error] getLatestPosts failed:`, error);
    throw error;
  }
}
