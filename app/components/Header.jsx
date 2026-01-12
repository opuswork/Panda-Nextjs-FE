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
  // ✅ isLoggingOut 추가
  const { user, isPending, isLoggingOut, logout } = useAuth(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setIsDropdownOpen(false); // 드롭다운 먼저 닫기
    await logout(); // AuthProvider에서 페이지 이동까지 처리함
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

  const userDisplayName = user?.nickname || 
    (user?.firstName && user?.lastName ? `${user.firstName}${user.lastName}` : "사용자");

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

        <div className={`headerAuthSection ${(user && !isPending && !isLoggingOut) ? "isLoggedIn" : ""}`}>
          {/* ✅ 수정된 로직: 로딩 중이거나 로그아웃 중일 때 Placeholder를 보여줌 */}
          {(isPending || isLoggingOut) ? (
            // 로그인 버튼이나 프로필 아이콘과 비슷한 크기의 빈 박스
            <div className="headerLoadingPlaceholder" style={{ width: '70px', height: '40px' }}></div>
          ) : user ? (
                <div className="headerAuthButtonsContainer" ref={dropdownRef}>
                  <div className="userInfoWrapper" onClick={toggleDropdown} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="userNickname">{userDisplayName}님</span>
                    <Image
                      src={user.image || IMAGES.ICON_PROFILE}
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
              )
            }
        </div>

      </div>
    </header>
  );
}

export default Header;