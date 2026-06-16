import { logPageAccess } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { menu_name } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    
    await logPageAccess(menu_name, ip, ua);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
