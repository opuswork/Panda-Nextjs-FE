// app/page.js
"use client";
import { useState, useEffect } from "react";
import Landing from "@/app/components/Landing";
import LandingSkeleton from "@/app/LandingSkeleton";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    // main 태그에 배경색을 직접 주어 화이트아웃 2중 차단
    <main style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {isLoading ? (
        <LandingSkeleton />
      ) : (
        <div className="fade-in">
          <Landing />
        </div>
      )}
    </main>
  );
}