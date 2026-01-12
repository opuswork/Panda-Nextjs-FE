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
  
  // AuthContext에서 인증 상태 가져오기
  const { user, isPending, isLoggingOut, isLoggingIn, logout } = useAuth(); 
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // ✅ 1. 강제 스켈레톤 유지를 위한 상태 (3초 타이머)
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // 마운트 후 3초간은 무조건 로딩 상태 유지
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // ✅ 2. localStorage에서 초기 사용자 정보 로드 (깜빡임 방지용)
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
  
  // user 상태 업데이트 시 localUser 동기화
  useEffect(() => {
    if (user) {
      setLocalUser(user);
    } else if (!isPending) {
      setLocalUser(null);
    }
  }, [user, isPending]);
  
  const displayUser = user || localUser;

  // ✅ 3. 로딩 조건 수정 (핵심!)
  // isInitialLoading이 true인 3초 동안은 localUser가 있어도 무조건 스켈레톤을 보여줍니다.
  const showSkeleton = isInitialLoading || isPending || isLoggingIn || isLoggingOut;

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // 드롭다운 외부 클릭 시 닫기
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

        <div className={`headerAuthSection ${(displayUser && !showSkeleton) ? "isLoggedIn" : ""}`}>
          {showSkeleton ? (
            /* ✅ 3초 동안 유저 정보 노출을 물리적으로 차단하는 스켈레톤 */
            <div className="headerLoadingPlaceholder skeleton-pulse" 
                 style={{ 
                   width: '80px', 
                   height: '40px', 
                   background: '#f0f0f0', 
                   borderRadius: '8px' 
                 }}>
            </div>
          ) : displayUser ? (
            /* ✅ 3초가 지난 후에만 사용자 정보가 나타남 */
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
            /* ✅ 3초가 지났는데 유저가 없으면 로그인 버튼 표시 */
            <Link href="/auth" id="loginLinkButton" className="loginButton">로그인</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;