"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthProvider";

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { getMe } = useAuth(false);
  
  // ✅ 중복 요청 방지를 위한 변수
  const isFetched = useRef(false);

  useEffect(() => {
    // 1. 코드가 없거나 이미 요청을 보낸 경우 중단
    if (!code || isFetched.current) return;

    // 2. 요청 시작 전 즉시 깃발을 올림 (중복 실행 방지)
    isFetched.current = true;

    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    console.log("인증 시도 중... code:", code);

    // 3. 백엔드로 code 전달 (credentials: 'include'로 쿠키 수신)
    fetch(`${API_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ 쿠키를 받기 위해 필수
      body: JSON.stringify({ code }),
    })
    .then(async (res) => {
      if (res.ok) {
        console.log("로그인 성공! 사용자 정보를 가져오는 중...");
        // ✅ 인증 상태 업데이트를 위해 getMe 호출 (코드 통일성 유지)
        await getMe();
        // ✅ 2초 대기 후 홈페이지로 리다이렉트 (스피너 표시 시간 확보)
        await new Promise(resolve => setTimeout(resolve, 2000));
        // 페이지 새로고침으로 AuthProvider가 자동으로 getMe를 호출하도록 함
        window.location.href = "/"; // ✅ 전체 페이지 리로드로 쿠키와 상태 동기화
      } else {
        const errorData = await res.json();
        console.error("로그인 실패 상세:", errorData);
        router.push(`/auth?error=failed&details=${encodeURIComponent(errorData.message || '인증 실패')}`);
      }
    })
    .catch((err) => {
      console.error("서버 통신 에러:", err);
      router.push("/auth?error=server_error");
    });
  }, [code, router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
      {/* 사용자 경험을 위해 로딩 애니메이션 추가 */}
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 font-medium">구글 계정 인증 중입니다...</p>
    </div>
  );
}