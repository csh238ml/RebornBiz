import { NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    // FastAPI 백엔드로 요청 포워딩
    const url = search ? `${FASTAPI_URL}/api/policies?search=${encodeURIComponent(search)}` : `${FASTAPI_URL}/api/policies`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Policies API Error:', error);
    return NextResponse.json(
      { success: false, message: 'FastAPI 서버 연동 중 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
