// app/components/SearchArticle.jsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./SearchArticle.module.css";
import { IMAGES } from "@/app/constants/images";

function SearchArticle({ onSearch, onClear, onSortChange, sortOrder = "recent" }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { label: "최신순", value: "recent" },
    { label: "오래된순", value: "oldest" },
  ];

  const handleSearchInputChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleSearch = (keyword) => {
    const trimmedKeyword = keyword?.trim() ?? "";
    setSearchKeyword(trimmedKeyword);
    onSearch?.(trimmedKeyword);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchKeyword);
    }
  };

  const handleSearchClear = () => {
    setSearchKeyword("");
    onClear?.();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const selectSort = (option) => {
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <button
          type="button"
          className={styles.searchIconButton}
          onClick={() => handleSearch(searchKeyword)}
          aria-label="검색"
        >
          <Image
            src={IMAGES.ICON_SEARCH}
            alt="Search"
            width={20}
            height={20}
            className={styles.searchIcon}
            loading="eager"
          />
        </button>

        <input
          type="text"
          placeholder="검색할 게시글을 입력해주세요"
          className={styles.searchInput}
          onChange={handleSearchInputChange}
          onKeyDown={handleSearchKeyDown}
          value={searchKeyword}
        />

        {searchKeyword && (
          <button
            type="button"
            className={styles.searchClearButton}
            onClick={handleSearchClear}
            aria-label="검색어 지우기"
          >
            ×
          </button>
        )}
      </div>

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
                  sortOrder === option.value ? styles.active : ""
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
  );
}

export default SearchArticle;
