// app/components/ProductsAuthWrapper.jsx
"use client";

import { useAuth } from "@/app/contexts/AuthProvider";
import { useEffect, useState } from "react";

/**
 * 인증이 필요한 페이지를 감싸는 래퍼 컴포넌트
 * 쿠키가 없으면 /auth로 리다이렉트합니다.
 */
export default function ProductsAuthWrapper({ children }) {
  const { user, isPending } = useAuth(true); // required = true로 설정
  const [isChecking, setIsChecking] = useState(true);

  // 로그인 직후 user가 설정될 때까지 기다림
  useEffect(() => {
    if (!isPending) {
      // isPending이 false가 되면 체크 완료
      // user가 있으면 즉시 표시, 없으면 useAuth가 리다이렉트 처리
      setIsChecking(false);
    }
  }, [isPending, user]);

  // 로딩 중이거나 체크 중일 때는 로딩 표시
  if (isPending || isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  // user가 없으면 useAuth(true)가 자동으로 /auth로 리다이렉트하므로
  // 여기 도달했다는 것은 user가 있다는 의미
  // 하지만 안전을 위해 한 번 더 체크
  if (!user) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  // user가 있으면 children을 렌더링
  return <>{children}</>;
}

