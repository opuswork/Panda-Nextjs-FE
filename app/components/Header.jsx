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
  
  // AuthContext에서 인증 상태 및 함수 가져오기
  const { user, isPending, isLoggingOut, isLoggingIn, logout } = useAuth(); 
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // ✅ 1. 강제 스켈레톤 유지를 위한 마스터 타이머 (3초)
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // 페이지 진입 후 3초간은 유저 정보가 있어도 '로딩 중'으로 간주합니다.
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // ✅ 2. 초기 렌더링 시 localStorage에서 유저 정보 로드
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
  
  // AuthProvider의 user 상태가 변경되면 localUser도 업데이트
  useEffect(() => {
    if (user) {
      setLocalUser(user);
    } else if (!isPending) {
      setLocalUser(null);
    }
  }, [user, isPending]);
  
  const displayUser = user || localUser;

  // ✅ 3. 핵심 로직: 3초 타이머(isInitialLoading)가 우선권을 가집니다.
  // 이 조건이 true인 동안은 유저 정보가 있어도 스켈레톤이 표시되어 깜빡임을 원천 차단합니다.
  const showSkeleton = isInitialLoading || isPending || isLoggingIn || isLoggingOut;

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // 드롭다운 외부 클릭 시 닫기 로직
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
        {/* 왼쪽 로고 영역 */}
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

        {/* 오른쪽 인증/사용자 영역 */}
        <div className="headerAuthSection">
          {showSkeleton ? (
            /* ✅ 3초 타이머가 끝날 때까지 유저 정보를 절대 보여주지 않고 스켈레톤 유지 */
            <div className="headerLoadingPlaceholder skeleton-pulse" 
                 style={{ width: '80px', height: '40px' }}>
            </div>
          ) : displayUser ? (
            /* ✅ 3초 뒤, 유저가 확인되었을 때만 등장 */
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
            /* ✅ 3초 뒤, 유저가 없다면 로그인 버튼 등장 */
            <Link href="/auth" id="loginLinkButton" className="loginButton">로그인</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;