import { NextResponse } from 'next/server';
import { fetchKosisData } from '@/app/actions/kosisActions';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // 1. 보안 처리 (임시 비밀번호 검증)
    if (secret !== 'RebornBatch123!') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. KOSIS 데이터 가져오기 및 DB 적재 로직 실행
    const result = await fetchKosisData();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // 3. 작업 완료 응답 반환
    return NextResponse.json({
      success: true,
      message: result.message,
      affectedRows: result.affectedRows
    });
    
  } catch (error) {
    console.error('[Batch Error] KOSIS API Route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
