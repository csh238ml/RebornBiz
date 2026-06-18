import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request) {
  try {
    // API KEY 가져오기 (환경변수)
    const apiKey = process.env.BIZINFO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'BIZINFO_API_KEY is not set in environment variables.' }, { status: 500 });
    }

    const url = `https://apis.data.go.kr/1421000/bizinfo/pblancBsnsService?serviceKey=${apiKey}&_type=json&numOfRows=100&pageNo=1`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, application/xml, text/plain, */*'
      }
    });

    if (!res.ok) {
      throw new Error(`API Request Failed with status ${res.status}`);
    }

    const textData = await res.text();
    
    // 정규표현식을 이용한 간단한 XML 파싱 (외부 의존성 제거 목적)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = [];
    let match;

    while ((match = itemRegex.exec(textData)) !== null) {
      items.push(match[1]);
    }

    if (items.length === 0) {
      return NextResponse.json({ success: true, message: 'No items found in the API response.', count: 0 });
    }

    // 각 필드를 추출하는 헬퍼 함수
    const extractText = (xmlString, tag) => {
      // CDATA가 있을 경우와 없을 경우 모두 매칭
      const regex = new RegExp(`<${tag}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`);
      const m = xmlString.match(regex);
      if (m) {
        return m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : null);
      }
      return null;
    };

    const extractInt = (xmlString, tag) => {
      const val = extractText(xmlString, tag);
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    let successCount = 0;

    // 트랜잭션과 비슷하게 처리하기 위해 개별 커넥션 대신 pool을 그대로 사용
    for (const itemXml of items) {
      const pblanc_id = extractText(itemXml, 'pblancId');
      const pblanc_nm = extractText(itemXml, 'pblancNm');

      if (!pblanc_id || !pblanc_nm) continue;

      let creat_pnttm = extractText(itemXml, 'creatPnttm');
      if (!creat_pnttm || creat_pnttm.trim() === '') creat_pnttm = null;

      let updt_pnttm = extractText(itemXml, 'updtPnttm');
      if (!updt_pnttm || updt_pnttm.trim() === '') updt_pnttm = null;

      const params = {
        pblanc_id,
        pblanc_nm,
        pblanc_url: extractText(itemXml, 'pblancUrl'),
        jrsd_instt_nm: extractText(itemXml, 'jrsdInsttNm'),
        exc_instt_nm: extractText(itemXml, 'excInsttNm'),
        bsns_sumry_cn: extractText(itemXml, 'bsnsSumryCn'),
        pldir_sport_realm_lclas_code_nm: extractText(itemXml, 'pldirSportRealmLclasCodeNm'),
        creat_pnttm,
        reqst_begin_end_de: extractText(itemXml, 'reqstBeginEndDe'),
        updt_pnttm,
        trget_nm: extractText(itemXml, 'trgetNm'),
        inqire_co: extractInt(itemXml, 'inqireCo'),
        flpth_nm: extractText(itemXml, 'flpthNm'),
        file_nm: extractText(itemXml, 'fileNm'),
        print_flpth_nm: extractText(itemXml, 'printFlpthNm'),
        print_file_nm: extractText(itemXml, 'printFileNm'),
        hashtags: extractText(itemXml, 'hashtags'),
        reqst_mth_papers_cn: extractText(itemXml, 'reqstMthPapersCn'),
        refrnc_nm: extractText(itemXml, 'refrncNm'),
        rcept_engn_hmpg_url: extractText(itemXml, 'rceptEngnHmpgUrl')
      };

      const query = `
        INSERT INTO gov_policy_guides (
            pblanc_id, pblanc_nm, pblanc_url, jrsd_instt_nm, exc_instt_nm,
            bsns_sumry_cn, pldir_sport_realm_lclas_code_nm, creat_pnttm,
            reqst_begin_end_de, updt_pnttm, trget_nm, inqire_co, flpth_nm,
            file_nm, print_flpth_nm, print_file_nm, hashtags,
            reqst_mth_papers_cn, refrnc_nm, rcept_engn_hmpg_url, fetched_at
        ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, NOW()
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
      `;

      const values = [
        params.pblanc_id, params.pblanc_nm, params.pblanc_url, params.jrsd_instt_nm, params.exc_instt_nm,
        params.bsns_sumry_cn, params.pldir_sport_realm_lclas_code_nm, params.creat_pnttm,
        params.reqst_begin_end_de, params.updt_pnttm, params.trget_nm, params.inqire_co, params.flpth_nm,
        params.file_nm, params.print_flpth_nm, params.print_file_nm, params.hashtags,
        params.reqst_mth_papers_cn, params.refrnc_nm, params.rcept_engn_hmpg_url
      ];

      try {
        await pool.query(query, values);
        successCount++;
      } catch (err) {
        console.error(`[DB Error] Failed to upsert pblancId ${params.pblanc_id}:`, err);
      }
    }

    return NextResponse.json({ success: true, message: `Successfully processed and upserted ${successCount} records.`, count: successCount });

  } catch (error) {
    console.error('[API Error] Fetch policies failed:', error);
    return NextResponse.json({ success: false, message: error.toString() }, { status: 500 });
  }
}
