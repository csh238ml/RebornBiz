import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = url.hostname;

  // 1. Force www
  if (hostname === 'rebornbiz.co.kr') {
    url.hostname = 'www.rebornbiz.co.kr';
    url.port = '443';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // 2. QueryString check for legacy ?post_id=X or ?id=X
  const postId = url.searchParams.get('post_id');
  const id = url.searchParams.get('id');

  if (url.pathname === '/magazine' || url.pathname === '/magazine/') {
    if (postId) {
      url.pathname = `/magazine/${postId}`;
      url.search = '';
      return NextResponse.redirect(url, 301);
    }
    if (id) {
      url.pathname = `/magazine/${id}`;
      url.search = '';
      return NextResponse.redirect(url, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
