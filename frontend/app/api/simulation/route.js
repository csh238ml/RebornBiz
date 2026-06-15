import { NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // FastAPI 백엔드로 요청 포워딩
    const response = await fetch(`${FASTAPI_URL}/api/simulate`, {
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

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Simulation API Error:', error);
    return NextResponse.json(
      { success: false, message: 'FastAPI 서버 연동 중 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
