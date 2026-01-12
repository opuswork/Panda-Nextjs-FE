// app/profile/page.js
'use client';

import Header from "@/app/components/Header";
import MyPage from "@/app/components/MyPage";
import { useAuth } from "@/app/contexts/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 프로필 페이지 - AuthProvider의 getMe()로 가져온 사용자 정보를 표시
 * ✅ 클라이언트 컴포넌트로 변경하여 AuthProvider의 인증 상태를 확인
 */
export default function ProfilePage() {
  const { user, isPending } = useAuth(true); // ✅ required: true로 설정하여 인증 필수
  const router = useRouter();

  // ✅ 로딩 중이 아니고 사용자가 없으면 AuthProvider의 useAuth가 자동으로 리다이렉트 처리
  // 하지만 추가 안전장치로 여기서도 확인
  useEffect(() => {
    if (!isPending && !user) {
      router.push('/auth?returnTo=/profile');
    }
  }, [user, isPending, router]);

  // ✅ 로딩 중일 때는 MyPage 컴포넌트가 스켈레톤을 표시합니다
  return (
    <>
      <MyPage />
    </>
  );
}

