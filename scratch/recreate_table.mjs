import mysql from 'mysql2/promise';

async function setup() {
  const pool = mysql.createPool({
    host: 'reborn-biz-db.cf08ake2amg0.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'sukhyunE!23',
    database: 'rebornbiz',
    port: 3306,
  });

  try {
    await pool.query(`DROP TABLE IF EXISTS nts_closure_stats`);
    await pool.query(`
      CREATE TABLE nts_closure_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        target_year VARCHAR(4) NOT NULL,
        industry_name VARCHAR(100) NOT NULL,
        active_count INT DEFAULT 0,
        closed_count INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_year_industry (target_year, industry_name)
      )
    `);
    console.log('Table nts_closure_stats recreated successfully.');
  } catch (error) {
    console.error('Error recreating table:', error);
  } finally {
    process.exit(0);
  }
}

setup();
