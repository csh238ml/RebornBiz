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
        INSERT INTO gov_policy_guides (
            pblanc_id, pblanc_nm, pblanc_url, jrsd_instt_nm, exc_instt_nm,
            bsns_sumry_cn, pldir_sport_realm_lclas_code_nm, creat_pnttm,
            reqst_begin_end_de, updt_pnttm, trget_nm, inqire_co, flpth_nm,
            file_nm, print_flpth_nm, print_file_nm, hashtags,
            reqst_mth_papers_cn, refrnc_nm, rcept_engn_hmpg_url, fetched_at
        ) VALUES (
            :pblanc_id, :pblanc_nm, :pblanc_url, :jrsd_instt_nm, :exc_instt_nm,
            :bsns_sumry_cn, :pldir_sport_realm_lclas_code_nm, :creat_pnttm,
            :reqst_begin_end_de, :updt_pnttm, :trget_nm, :inqire_co, :flpth_nm,
            :file_nm, :print_flpth_nm, :print_file_nm, :hashtags,
            :reqst_mth_papers_cn, :refrnc_nm, :rcept_engn_hmpg_url, NOW()
        )
        ON DUPLICATE KEY UPDATE
            pblanc_nm = VALUES(pblanc_nm),
            pblanc_url = VALUES(pblanc_url),
            jrsd_instt_nm = VALUES(jrsd_instt_nm),
            exc_instt_nm = VALUES(exc_instt_nm),
            bsns_sumry_cn = VALUES(bsns_sumry_cn),
            pldir_sport_realm_lclas_code_nm = VALUES(pldir_sport_realm_lclas_code_nm),
            creat_pnttm = VALUES(creat_pnttm),
            reqst_begin_end_de = VALUES(reqst_begin_end_de),
            updt_pnttm = VALUES(updt_pnttm),
            trget_nm = VALUES(trget_nm),
            inqire_co = VALUES(inqire_co),
            flpth_nm = VALUES(flpth_nm),
            file_nm = VALUES(file_nm),
            print_flpth_nm = VALUES(print_flpth_nm),
            print_file_nm = VALUES(print_file_nm),
            hashtags = VALUES(hashtags),
            reqst_mth_papers_cn = VALUES(reqst_mth_papers_cn),
            refrnc_nm = VALUES(refrnc_nm),
            rcept_engn_hmpg_url = VALUES(rcept_engn_hmpg_url),
            fetched_at = NOW()
    """)

    success_count = 0
    
    with engine.begin() as conn:
        for item in items:
            def get_text(tag):
                elem = item.find(tag)
                return elem.text if elem is not None and elem.text else None

            def get_int(tag):
                val = get_text(tag)
                try:
                    return int(val) if val else 0
                except:
                    return 0

            # creat_pnttm, updt_pnttm 이 빈 값이면 None 삽입 (MySQL Datetime에서 빈문자열 오류 방지)
            creat_pnttm = get_text('creatPnttm')
            if not creat_pnttm or creat_pnttm.strip() == "":
                creat_pnttm = None
                
            updt_pnttm = get_text('updtPnttm')
            if not updt_pnttm or updt_pnttm.strip() == "":
                updt_pnttm = None

            params_dict = {
                'pblanc_id': get_text('pblancId'),
                'pblanc_nm': get_text('pblancNm'),
                'pblanc_url': get_text('pblancUrl'),
                'jrsd_instt_nm': get_text('jrsdInsttNm'),
                'exc_instt_nm': get_text('excInsttNm'),
                'bsns_sumry_cn': get_text('bsnsSumryCn'),
                'pldir_sport_realm_lclas_code_nm': get_text('pldirSportRealmLclasCodeNm'),
                'creat_pnttm': creat_pnttm,
                'reqst_begin_end_de': get_text('reqstBeginEndDe'),
                'updt_pnttm': updt_pnttm,
                'trget_nm': get_text('trgetNm'),
                'inqire_co': get_int('inqireCo'),
                'flpth_nm': get_text('flpthNm'),
                'file_nm': get_text('fileNm'),
                'print_flpth_nm': get_text('printFlpthNm'),
                'print_file_nm': get_text('printFileNm'),
                'hashtags': get_text('hashtags'),
                'reqst_mth_papers_cn': get_text('reqstMthPapersCn'),
                'refrnc_nm': get_text('refrncNm'),
                'rcept_engn_hmpg_url': get_text('rceptEngnHmpgUrl')
            }
            
            if not params_dict['pblanc_id'] or not params_dict['pblanc_nm']:
                continue
                
            try:
                conn.execute(upsert_query, params_dict)
                success_count += 1
            except Exception as e:
                logging.error(f"Failed to upsert pblancId {params_dict['pblanc_id']}: {e}")

    logging.info(f"Successfully processed and upserted {success_count} records.")

if __name__ == "__main__":
    fetch_and_update_policies()
