import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const type = params.type;
    const { searchParams } = new URL(request.url);
    
    let query = '';
    let values = [];
    
    if (type === 'sido') {
      // sort_order 기준 ASC 정렬 후 중복 제거를 위해 GROUP BY를 쓰거나, Node.js 단에서 정렬을 보장합니다.
      query = 'SELECT sido_name, MIN(sort_order) as min_sort FROM region_master WHERE sido_name IS NOT NULL GROUP BY sido_name ORDER BY min_sort ASC';
    } else if (type === 'sigungu') {
      const sido = searchParams.get('sido');
      query = 'SELECT sigungu_name, MIN(sort_order) as min_sort FROM region_master WHERE sido_name = ? AND sigungu_name IS NOT NULL GROUP BY sigungu_name ORDER BY min_sort ASC';
      values = [sido];
    } else if (type === 'dong') {
      const sido = searchParams.get('sido');
      const sigungu = searchParams.get('sigungu');
      query = 'SELECT DISTINCT dong_name FROM region_master WHERE sido_name = ? AND sigungu_name = ? AND dong_name IS NOT NULL ORDER BY dong_name ASC';
      values = [sido, sigungu];
    } else {
      return NextResponse.json({ success: false, message: 'Invalid region type' }, { status: 400 });
    }

    const [rows] = await pool.query(query, values);
    
    let data = [];
    if (type === 'sido') data = rows.map(r => r.sido_name).filter(Boolean);
    else if (type === 'sigungu') data = rows.map(r => r.sigungu_name).filter(Boolean);
    else if (type === 'dong') data = rows.map(r => r.dong_name).filter(Boolean);
    
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error(`Regions API Error:`, error);
    return NextResponse.json(
      { success: false, message: 'DB 연동 에러가 발생했습니다.', error: error.toString() },
      { status: 500 }
    );
  }
}
