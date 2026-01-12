"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { IMAGES } from "@/app/constants/images";
import { useAuth } from "@/app/contexts/AuthProvider";

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isLandingPage = pathname === "/";
  const { user, isPending, isLoggingOut, isLoggingIn, logout } = useAuth(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // ✅ 강제 스켈레톤 유지를 위한 상태 추가 (기본값 true)
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // ✅ 컴포넌트 마운트 시 3초 타이머 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000); // 3초간 스켈레톤 유지

    return () => clearTimeout(timer);
  }, []);

  const [localUser, setLocalUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const isLoggedOut = localStorage.getItem('isLoggedOut');
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
  
  useEffect(() => {
    if (user) {
      setLocalUser(user);
    } else if (!isPending) {
      setLocalUser(null);
    }
  }, [user, isPending]);
  
  const displayUser = user || localUser;

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const userDisplayName = displayUser?.nickname || 
    (displayUser?.firstName && displayUser?.lastName ? `${displayUser.firstName}${displayUser.lastName}` : "사용자");

  // ✅ 로딩 조건 통합 (강제 3초 + 인증 펜딩 + 로그인/로그아웃 진행중)
  const showSkeleton = isInitialLoading || isPending || isLoggingOut || isLoggingIn;

  return (
    <header className="header">
      <div className="headerWrapper">
        <div className="headerLeft">
          <Link href="/">
            <Image src={IMAGES.LOGO_DESKTOP} alt="Logo" width={153} height={51} priority className="desktopLogo" />
            <Image src={IMAGES.LOGO_MOBILE} alt="Logo" width={81} height={40} priority className="mobileLogo" />
          </Link>

          {!isLandingPage && (
            <div className="headerRight">
              <Link href="/articles" className={`navLink ${pathname.startsWith('/articles') ? 'active' : ''}`}>자유게시판</Link>
              <Link href="/products" className={`navLink ${pathname.startsWith('/products') ? 'active' : ''}`}>중고마켓</Link>
            </div>
          )}
        </div>

        <div className={`headerAuthSection ${(displayUser && !showSkeleton) ? "isLoggedIn" : ""}`}>
          {showSkeleton ? (
            // ✅ 스켈레톤 로딩 UI (CSS 애니메이션이 적용된 클래스 권장)
            <div className="headerLoadingPlaceholder skeleton-pulse" 
                 style={{ 
                   width: '80px', 
                   height: '40px', 
                   background: '#f0f0f0', 
                   borderRadius: '8px' 
                 }}>
            </div>
          ) : displayUser ? (
            <div className="headerAuthButtonsContainer" ref={dropdownRef}>
              <div className="userInfoWrapper" onClick={toggleDropdown} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="userNickname">{userDisplayName}님</span>
                <Image
                  src={displayUser.image || IMAGES.ICON_PROFILE}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="profileIcon"
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                  unoptimized
                />
              </div>

              {isDropdownOpen && (
                <div className="profileDropdown">
                  <button type="button" className="profileDropdownOption" onClick={() => { router.push("/profile"); setIsDropdownOpen(false); }}>내프로필</button>
                  <button type="button" className="profileDropdownOption" onClick={() => { router.push("/settings/account"); setIsDropdownOpen(false); }}>계정설정</button>
                  <hr className="dropdownDivider" />
                  <button type="button" className="profileDropdownOption logoutOption" onClick={handleLogout}>로그아웃</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" id="loginLinkButton" className="loginButton">로그인</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;