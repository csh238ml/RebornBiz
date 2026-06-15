import { NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // FastAPI 백엔드로 요청 포워딩
    const response = await fetch(`${FASTAPI_URL}/api/magazine/${id}`);

    if (response.status === 404) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }

    if (!response.ok) {
      throw new Error(`FastAPI responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Magazine Detail API Error:', error);
    return NextResponse.json(
      { success: false, message: 'FastAPI 서버 연동 중 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
