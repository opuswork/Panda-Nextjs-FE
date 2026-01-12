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
  
  // AuthContext 상태
  const { user, isPending, isLoggingOut, isLoggingIn, logout } = useAuth(); 
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // ✅ 1. 하이드레이션 가드: 브라우저가 완전히 준비될 때까지 기다림
  const [mounted, setMounted] = useState(false);
  // ✅ 2. 강제 로딩 타이머: 3초간 스켈레톤 고정
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  // ✅ 3. 로컬 유저 정보: 마운트 전에는 무조건 null
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 실행
    setMounted(true);

    // ✅ 핵심: 브라우저가 준비된 "후에야" localStorage를 읽습니다. (정보 유출 차단)
    const savedUser = localStorage.getItem('user');
    const isLoggedOut = localStorage.getItem('isLoggedOut');
    if (!isLoggedOut && savedUser) {
      try {
        setLocalUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Local user data error");
      }
    }

    // 3초 강제 대기 타이머
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  
  // AuthProvider의 실시간 user 상태와 동기화
  useEffect(() => {
    if (user) {
      setLocalUser(user);
    } else if (!isPending && mounted) {
      setLocalUser(null);
    }
  }, [user, isPending, mounted]);
  
  const displayUser = user || localUser;

  // ✅ 4. 최종 로딩 조건: 마운트 전이거나 타이머 중이면 유저가 있어도 무조건 스켈레톤!
  const showSkeleton = !mounted || isInitialLoading || isPending || isLoggingIn || isLoggingOut;

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

        <div className="headerAuthSection">
          {showSkeleton ? (
            /* ✅ 3초가 지나기 전엔 어떠한 사용자 정보도 이곳에 그리지 않습니다 */
            <div className="headerLoadingPlaceholder skeleton-pulse" 
                 style={{ width: '80px', height: '40px', background: '#f2f2f2', borderRadius: '8px' }}>
            </div>
          ) : displayUser ? (
            /* ✅ 3초 타이머가 끝난 정교한 시점에만 사용자 정보 노출 */
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
            /* ✅ 유저가 없는 것이 확실해진 3초 뒤에 로그인 버튼 노출 */
            <Link href="/auth" id="loginLinkButton" className="loginButton">로그인</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;