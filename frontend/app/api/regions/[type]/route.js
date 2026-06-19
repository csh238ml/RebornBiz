import { NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function GET(request, { params }) {
  try {
    const { type } = await params;
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${FASTAPI_URL}/api/regions/${type}${queryString ? '?' + queryString : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error(`Regions API Error:`, error);
    return NextResponse.json(
      { success: false, message: 'FastAPI 서버 연동 중 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
