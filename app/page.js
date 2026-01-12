"use client";

import { useState, useEffect } from "react";
import Landing from "@/app/components/Landing";
import LandingSkeleton from "@/app/components/LandingSkeleton";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ 핵심: 이미 로그인된 유저가 있는지 즉시 확인
    const savedUser = localStorage.getItem('user');
    const isLoggedOut = localStorage.getItem('isLoggedOut');

    if (savedUser && !isLoggedOut) {
      // 로그인된 상태라면 3초를 기다리지 않고 바로 컨텐츠를 보여줍니다.
      // 0.3초 정도의 아주 짧은 지연만 주어 부드럽게 전환합니다.
      const fastTimer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(fastTimer);
    } else {
      // 로그인 정보가 없다면 기존처럼 3초간 스켈레톤을 보여줍니다.
      const timer = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <main 
      className={isLoading ? "" : "fade-in-content"} 
      style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}
    >
      {isLoading ? <LandingSkeleton /> : <Landing />}

      <style jsx global>{`
        .fade-in-content {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
}