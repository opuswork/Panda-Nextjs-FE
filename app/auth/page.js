// app/auth/page.jsx

import SignIn from "@/app/components/authentication/SignIn";
import { Suspense } from "react";
import Spinner from "@/app/components/Loading";

// 시간을 지연시키는 헬퍼 함수 (개발용 로딩 테스트)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * ✅ 서버 컴포넌트: searchParams는 Next.js 15에서 Promise입니다.
 */
export default async function AuthPage({ searchParams }) {
  
  // 1. Next.js 15 관례에 따라 searchParams를 비동기적으로 기다립니다(unwrap).
  // 비록 SignIn 내부에서 useSearchParams를 쓰더라도, 
  // 서버에서 미리 받아 props로 넘겨주면 하이드레이션이 더 안정적입니다.
  const { returnTo } = await searchParams;

  // 2. 💡 2초 동안 서버에서 대기 (loading.js 작동 테스트용)
  await delay(2000);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ✅ Suspense가 중요한 이유: 
         SignIn 내부에서 'useSearchParams'를 사용하면, 
         Next.js는 빌드 시 이 컴포넌트를 클라이언트 사이드 렌더링으로 분류하며 
         반드시 상위에 Suspense 경계가 있어야 에러를 던지지 않습니다.
      */}
      <Suspense fallback={<Spinner />}>
        {/* ✅ 읽어온 returnTo 값을 props로 확실하게 전달합니다. */}
        <SignIn returnTo={returnTo || null} />
      </Suspense>
      
    </main>
  );
}