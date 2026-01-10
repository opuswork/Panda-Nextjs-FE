// app/components/SearchProduct.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthProvider";
import styles from "./SearchProduct.module.css";
import { IMAGES } from "@/app/constants/images";
import Loading from "./Loading";

function SearchProduct({
  showRegisterButtonOnly = false,
  onSearch,
  onClear,
  onSortChange,
  initialSort = "최신순",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isPending } = useAuth(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const dropdownRef = useRef(null);

  // Sort options mapping: Korean display -> API value
  const sortOptions = useMemo(
    () => [
      { label: "최신순", value: "recent" },
      { label: "좋아요순", value: "likes" },
    ],
    []
  );

  // Sync selectedSort if parent changes initialSort
  useEffect(() => {
    setSelectedSort(initialSort);
  }, [initialSort]);

  // user 상태를 기반으로 로그인 여부 확인
  const isLoggedIn = !!user && !isPending;

  // Reset redirecting state when pathname changes
  useEffect(() => {
    if (pathname === "/auth") {
      setIsRedirecting(false);
    }
  }, [pathname]);

  const handleRegisterClick = () => {
    // 로딩 중이면 아무것도 하지 않음
    if (isPending) {
      return;
    }

    // 로그인되어 있으면 등록 페이지로 이동
    if (isLoggedIn) {
      router.push("/registration");
    } else {
      // 로그인되지 않았으면 로그인 페이지로 리다이렉트
      setIsRedirecting(true);
      const returnUrl = encodeURIComponent("/registration");
      router.push(`/auth?returnUrl=${returnUrl}`);
    }
  };

  const submitSearch = (keyword) => {
    const trimmed = (keyword ?? "").trim();
    setSearchKeyword(trimmed);
    onSearch?.(trimmed);
  };

  const clearSearch = () => {
    setSearchKeyword("");
    onClear?.();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((v) => !v);
  };

  const selectSort = (option) => {
    setSelectedSort(option.label);
    setIsDropdownOpen(false);
    onSortChange?.(option.value);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  if (showRegisterButtonOnly) {
    return (
      <>
        {isRedirecting && <Loading />}
        <button
          type="button"
          className={styles.registerButton}
          onClick={handleRegisterClick}
        >
          상품 등록하기
        </button>
      </>
    );
  }

  return (
    <>
      {isRedirecting && <Loading />}
      <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <button
          type="button"
          className={styles.searchIconButton}
          onClick={() => submitSearch(searchKeyword)}
          aria-label="검색"
        >
          <Image
            src={IMAGES.ICON_SEARCH}
            alt="Search"
            width={20}
            height={20}
            className={styles.searchIcon}
            priority
          />
        </button>

        <input
          type="text"
          placeholder="검색할 상품을 입력해주세요"
          className={styles.searchInput}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitSearch(searchKeyword);
          }}
        />

        {searchKeyword && (
          <button
            type="button"
            className={styles.searchClearButton}
            onClick={clearSearch}
            aria-label="검색어 지우기"
          >
            ×
          </button>
        )}

        {/* Mobile Sort Button */}
        <div className={styles.mobileSortWrapper} ref={dropdownRef}>
          <button
            type="button"
            className={styles.sortButton}
            onClick={toggleDropdown}
            aria-label="정렬"
          >
            <Image
              src={IMAGES.ICON_SORT}
              alt="정렬"
              width={48}
              height={48}
              className={styles.sortIcon}
              priority
            />
          </button>

          {isDropdownOpen && (
            <div className={styles.sortDropdown}>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.sortOption} ${
                    selectedSort === option.label ? styles.active : ""
                  }`}
                  onClick={() => selectSort(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className={styles.desktopRegisterButton}
        onClick={handleRegisterClick}
      >
        상품 등록하기
      </button>

      {/* Desktop Sort Select */}
      <div className={styles.desktopSortWrapper} ref={dropdownRef}>
        <button
          type="button"
          className={styles.sortSelect}
          onClick={toggleDropdown}
        >
          {selectedSort}
        </button>

        {isDropdownOpen && (
          <div className={styles.sortDropdown}>
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.sortOption} ${
                  selectedSort === option.label ? styles.active : ""
                }`}
                onClick={() => selectSort(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default SearchProduct;
