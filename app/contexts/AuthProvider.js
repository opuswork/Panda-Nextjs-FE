'use client';

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext({
  user: null,
  isPending: true,
  isLoggingOut: false,
  login: () => {},
  loginWithGoogle: () => {},
  logout: () => {},
  register: () => {},
});

export function AuthProvider({ children }) {
  // ✅ 페이지 리로드 시 이전 로그인 상태를 확인하여 깜빡임 방지
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const isLoggedOut = localStorage.getItem('isLoggedOut');
      // 로그아웃 힌트가 없고 저장된 사용자 정보가 있으면 초기 상태로 설정
      if (!isLoggedOut && savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const [isPending, setIsPending] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // 로그아웃 상태
  const router = useRouter();

  // 1. 내 정보 가져오기
  const getMe = useCallback(async () => {
    try {
      setIsPending(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ 크로스 도메인 쿠키를 위해 필수
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // ✅ 로그인 성공 시 로그아웃 힌트 제거 및 사용자 정보 저장
        localStorage.removeItem('isLoggedOut');
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        // ✅ 로그인 실패 시 로그아웃 힌트 저장 및 사용자 정보 제거
        localStorage.setItem('isLoggedOut', 'true');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error("[AuthProvider] getMe failed:", error);
      setUser(null);
    } finally {
      setIsPending(false);
    }
  }, []);

  // 2. 로그인
  async function login({ email, password, redirectTo }) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // ✅ 크로스 도메인 쿠키를 위해 필수
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "로그인 실패");
    }

    await getMe();
    router.push(redirectTo || "/products"); 
  }

  // 2-1. 구글 로그인
  async function loginWithGoogle({ accessToken, redirectTo }) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';
    const response = await fetch(`${baseUrl}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "구글 로그인 실패");
    }

    await getMe();
    router.push(redirectTo || "/products");
  }

  // ✅ 3. 로그아웃 (시차 해결 로직 포함)
  const logout = async () => {
    try {
      setIsLoggingOut(true); // 즉시 화면 가리기 활성화
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';
      const res = await fetch(`${API_BASE_URL}/api/auth/logout`, { 
        method: 'POST',
        credentials: "include", // ✅ 크로스 도메인 쿠키를 위해 필수
      });
      
      if (res.ok) {
        // ✅ 로그아웃 성공 시 로컬스토리지에 힌트 저장 및 사용자 정보 제거
        localStorage.setItem('isLoggedOut', 'true');
        localStorage.removeItem('user');
        setUser(null);
        // 모든 메모리 상태를 초기화하며 메인으로 이동
        window.location.href = '/'; 
      } else {
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('로그아웃 중 에러 발생:', error);
      setIsLoggingOut(false);
    }
  };

  // 4. 회원가입
  async function register({ email, password, firstName, lastName, nickname }) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName, nickname }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "회원가입 실패");
    }

    await login({ email, password });
  }

  useEffect(() => {
    getMe();
  }, [getMe]);

  return (
    <AuthContext.Provider value={{ user, isPending, isLoggingOut, login, loginWithGoogle, logout, register, getMe }}>
      {children}

      {/* ✅ 로그아웃 시 헤더와 본문의 시차를 가려주는 오버레이 */}
      {isLoggingOut && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: '#ffffff', zIndex: 9999, display: 'flex',
          flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '20px', color: '#666', fontWeight: '500' }}>안전하게 로그아웃 중입니다...</p>
          <style jsx>{` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `}</style>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(required) {
  const context = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (required && !context.isPending && !context.user) {
      const returnPath = encodeURIComponent(pathname);
      router.push(`/auth?returnTo=${returnPath}`);
    }
  }, [required, context.user, context.isPending, router, pathname]);

  return context;
}