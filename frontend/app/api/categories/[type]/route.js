import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const type = params.type;
    const { searchParams } = new URL(request.url);
    
    let query = '';
    let values = [];
    
    if (type === 'large') {
      query = 'SELECT DISTINCT large_cat_name FROM industry_master WHERE large_cat_name IS NOT NULL ORDER BY large_cat_name ASC';
    } else if (type === 'medium') {
      const large = searchParams.get('large');
      if (!large) return NextResponse.json({ success: true, data: [] });
      query = 'SELECT DISTINCT medium_cat_name FROM industry_master WHERE large_cat_name = ? AND medium_cat_name IS NOT NULL ORDER BY medium_cat_name ASC';
      values = [large];
    } else if (type === 'small') {
      const medium = searchParams.get('medium');
      if (!medium) return NextResponse.json({ success: true, data: [] });
      query = 'SELECT DISTINCT small_cat_name FROM industry_master WHERE medium_cat_name = ? AND small_cat_name IS NOT NULL ORDER BY small_cat_name ASC';
      values = [medium];
    } else {
      return NextResponse.json({ success: false, message: 'Invalid category type' }, { status: 400 });
    }

    const [rows] = await pool.query(query, values);
    
    let data = [];
    if (type === 'large') data = rows.map(r => r.large_cat_name).filter(Boolean);
    else if (type === 'medium') data = rows.map(r => r.medium_cat_name).filter(Boolean);
    else if (type === 'small') data = rows.map(r => r.small_cat_name).filter(Boolean);
    
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error(`Categories API Error:`, error);
    return NextResponse.json(
      { success: false, message: 'DB 연동 에러가 발생했습니다.', error: error.toString() },
      { status: 500 }
    );
  }
}
