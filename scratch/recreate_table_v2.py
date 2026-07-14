import pymysql

connection = pymysql.connect(
    host='reborn-biz-db.cf08ake2amg0.ap-northeast-2.rds.amazonaws.com',
    user='admin',
    password='sukhyunE!23',
    database='rebornbiz',
    port=3306
)

try:
    with connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS nts_closure_stats")
        cursor.execute("DROP TABLE IF EXISTS kosis_life_biz_stats")
        cursor.execute("""
            CREATE TABLE kosis_life_biz_stats (
              id INT AUTO_INCREMENT PRIMARY KEY,
              target_year VARCHAR(4) NOT NULL,
              stat_type VARCHAR(10) NOT NULL,
              category_type VARCHAR(20) NOT NULL,
              category_value VARCHAR(50) NOT NULL,
              industry_name VARCHAR(100) NOT NULL,
              biz_count INT DEFAULT 0,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY unique_biz_stat (target_year, stat_type, category_type, category_value, industry_name)
            )
        """)
    connection.commit()
    print("Table kosis_life_biz_stats recreated successfully.")
finally:
    connection.close()
