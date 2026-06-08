import sys
import os
import requests
import xml.etree.ElementTree as ET
from dotenv import load_dotenv
import urllib3
import logging
from sqlalchemy import text

# SSL 경고 무시
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 프로젝트 루트 경로 추가 및 환경변수 로드
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

from modules.database import engine

def fetch_and_update_policies():
    api_key = os.getenv("BIZINFO_API_KEY")
    if not api_key:
        logging.error("BIZINFO_API_KEY is not set in .env")
        return

    url = 'https://apis.data.go.kr/1421000/bizinfo/pblancBsnsService'
    params = {
        'serviceKey': api_key,
        '_type': 'json',
        'numOfRows': '100',
        'pageNo': '1'
    }

    logging.info("Fetching policies from Bizinfo API...")
    try:
        response = requests.get(url, params=params, verify=False, timeout=30)
        response.raise_for_status()
    except Exception as e:
        logging.error(f"API Request Failed: {e}")
        return

    try:
        root = ET.fromstring(response.text)
    except ET.ParseError as e:
        logging.error(f"XML Parsing Failed: {e}")
        return
        
    items = root.findall('.//item')
    if not items:
        logging.info("No items found in the API response.")
        return

    logging.info(f"Fetched {len(items)} items. Updating database...")

    upsert_query = text("""
        INSERT INTO pblanc_bsns (
            pblanc_id, pblanc_nm, jrsd_instt_nm, exc_instt_nm,
            trget_nm, reqst_begin_end_de, pblanc_url, bsns_sumry_cn, updated_at
        ) VALUES (
            :pblanc_id, :pblanc_nm, :jrsd_instt_nm, :exc_instt_nm,
            :trget_nm, :reqst_begin_end_de, :pblanc_url, :bsns_sumry_cn, NOW()
        )
        ON DUPLICATE KEY UPDATE
            pblanc_nm = VALUES(pblanc_nm),
            jrsd_instt_nm = VALUES(jrsd_instt_nm),
            exc_instt_nm = VALUES(exc_instt_nm),
            trget_nm = VALUES(trget_nm),
            reqst_begin_end_de = VALUES(reqst_begin_end_de),
            pblanc_url = VALUES(pblanc_url),
            bsns_sumry_cn = VALUES(bsns_sumry_cn),
            updated_at = NOW()
    """)

    success_count = 0
    
    with engine.begin() as conn:
        for item in items:
            def get_text(tag):
                elem = item.find(tag)
                return elem.text if elem is not None and elem.text else ""

            params_dict = {
                'pblanc_id': get_text('pblancId'),
                'pblanc_nm': get_text('pblancNm'),
                'jrsd_instt_nm': get_text('jrsdInsttNm'),
                'exc_instt_nm': get_text('excInsttNm'),
                'trget_nm': get_text('trgetNm'),
                'reqst_begin_end_de': get_text('reqstBeginEndDe'),
                'pblanc_url': get_text('pblancUrl'),
                'bsns_sumry_cn': get_text('bsnsSumryCn')
            }
            
            if not params_dict['pblanc_id']:
                continue
                
            try:
                conn.execute(upsert_query, params_dict)
                success_count += 1
            except Exception as e:
                logging.error(f"Failed to upsert pblancId {params_dict['pblanc_id']}: {e}")

    logging.info(f"Successfully processed and upserted {success_count} records.")

if __name__ == "__main__":
    fetch_and_update_policies()
