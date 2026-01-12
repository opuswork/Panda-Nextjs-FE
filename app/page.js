// app/page.js
"use client";

import { useState, useEffect } from "react";
import Landing from "@/app/components/Landing";
import LandingSkeleton from "@/app/components/LandingSkeleton";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ Header의 3초와 동기화하여 깜빡임과 화이트아웃을 동시에 해결합니다.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className={isLoading ? "" : "fade-in-content"}>
      {isLoading ? (
        <LandingSkeleton />
      ) : (
        <Landing />
      )}

      <style jsx global>{`
        .fade-in-content {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>
    </main>
  );
}