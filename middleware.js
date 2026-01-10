// Panda-Nextjs-FE/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. 브라우저 쿠키에서 'auth_token' 가져오기
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 2. 로그인이 반드시 필요한 경로 정의
  const isProtectedRoute = pathname.startsWith('/profile') || pathname.startsWith('/edit-profile');

  // 3. 토큰이 없는데 보호된 경로에 접근하려 한다면
  if (!token && isProtectedRoute) {
    // 로그인 페이지(/auth)로 리다이렉트
    const url = new URL('/auth', request.url);
    // 원래 가려던 주소를 쿼리 스트링으로 담아주면 나중에 편리합니다 (선택사항)
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 4. 로그인이 되어 있는데 로그인/회원가입 페이지로 가려 한다면
  if (token && pathname === '/auth') {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

// 5. 미들웨어가 실행될 범위 설정
export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에서 미들웨어 실행:
     * - api (API 라우트)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};