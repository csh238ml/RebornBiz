import { NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // FastAPI 백엔드로 요청 포워딩
    const response = await fetch(`${FASTAPI_URL}/api/market_analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Market Analysis API Error:', error);
    return NextResponse.json(
      { success: false, message: 'FastAPI 서버 연동 중 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
