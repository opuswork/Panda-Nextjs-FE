"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthProvider";

export default function KakaoCallback() {
  const router = useRouter();
  const { getMe } = useAuth(false);
  
  // ✅ 중복 실행 방지를 위한 변수
  const isProcessed = useRef(false);

  useEffect(() => {
    // 1. 이미 처리한 경우 중단
    if (isProcessed.current) return;

    // 2. 요청 시작 전 즉시 깃발을 올림 (중복 실행 방지)
    isProcessed.current = true;

    console.log("카카오 로그인 콜백 처리 중...");

    // 3. 백엔드에서 이미 쿠키를 설정했으므로, getMe를 호출하여 인증 상태 확인
    getMe()
      .then(() => {
        console.log("카카오 로그인 성공! 사용자 정보를 가져왔습니다.");
        // 페이지 새로고침으로 AuthProvider가 자동으로 getMe를 호출하도록 함
        window.location.href = "/profile"; // ✅ 전체 페이지 리로드로 쿠키와 상태 동기화
      })
      .catch((err) => {
        console.error("카카오 로그인 실패:", err);
        router.push("/auth?error=kakao_login_failed");
      });
  }, [router, getMe]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
      {/* 사용자 경험을 위해 로딩 애니메이션 추가 */}
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mb-4"></div>
      <p className="text-gray-600 font-medium">카카오 계정 인증 중입니다...</p>
    </div>
  );
}
