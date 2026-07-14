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
        cursor.execute("""
            CREATE TABLE nts_closure_stats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                target_year VARCHAR(4) NOT NULL,
                industry_name VARCHAR(100) NOT NULL,
                active_count INT DEFAULT 0,
                closed_count INT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_year_industry (target_year, industry_name)
            )
        """)
    connection.commit()
    print("Table recreated successfully.")
finally:
    connection.close()
