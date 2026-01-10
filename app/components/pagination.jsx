// app/components/pagination.jsx
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import styles from "./pagination.module.css";
import { IMAGES } from "@/app/constants/images";

function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const visiblePages = useMemo(() => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (start === 1) {
      end = maxVisible;
    } else if (end === totalPages) {
      start = totalPages - maxVisible + 1;
    }

    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    if (!onPageChange) return;
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        className={styles.arrowButton}
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        aria-label="Previous page"
      >
        <Image
          src={IMAGES.ICON_ARROW_LEFT}
          alt="Previous page"
          width={20}
          height={20}
          priority
        />
      </button>

      <div className={styles.pageNumbers}>
        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            className={`${styles.pageButton} ${
              page === currentPage ? styles.active : ""
            }`}
            onClick={() => goToPage(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={styles.arrowButton}
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        aria-label="Next page"
      >
        <Image
          src={IMAGES.ICON_ARROW_RIGHT}
          alt="Next page"
          width={20}
          height={20}
          priority
        />
      </button>
    </div>
  );
}

export default Pagination;
