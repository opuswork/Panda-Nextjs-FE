"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      // 백엔드로 code를 보내서 로그인을 완료합니다.
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';
      
      fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      .then(async (res) => {
        if (res.ok) {
          router.push("/"); // 로그인 성공 시 메인으로
        } else {
          router.push("/auth?error=failed");
        }
      })
      .catch(() => router.push("/auth?error=server_error"));
    }
  }, [code, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p>로그인 처리 중입니다. 잠시만 기다려 주세요...</p>
    </div>
  );
}