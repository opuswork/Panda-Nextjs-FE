// Panda-Nextjs-FE/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // ✅ 크로스 도메인 쿠키 문제로 인해 middleware에서 쿠키 확인 불가
  // 대신 클라이언트 컴포넌트에서 AuthProvider를 통해 인증 확인
  // /profile과 /edit-profile은 AuthProvider의 useAuth(true)로 보호됨

  // 로그인/회원가입 페이지는 클라이언트에서 처리
  // (AuthProvider가 이미 로그인 상태를 확인하고 리다이렉트 처리)

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