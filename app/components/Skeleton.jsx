// app/components/Skeleton.jsx
"use client";

import React from "react";
import styles from "./Skeleton.module.css";

// ✅ 기존 상품 스켈레톤
export function ProductSkeleton({ count = 10 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonInfo}>
            <div className={styles.skeletonName}></div>
            <div className={styles.skeletonPrice}></div>
          </div>
        </div>
      ))}
    </>
  );
}

// ✅ 마이페이지 전용 스켈레톤 추가
export function MyPageSkeleton() {
  return (
    <div className={styles.skeletonMyPageContainer}>
      <div className={styles.skeletonContent}>
        {/* 왼쪽 이미지 섹션 */}
        <div className={styles.skeletonAvatarWrapper}>
          <div className={styles.skeletonAvatar}></div>
        </div>
        {/* 오른쪽 정보 섹션 */}
        <div className={styles.skeletonInfoSection}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonActivity}></div>
        </div>
      </div>
    </div>
  );
}


export function AccountSettingsSkeleton() {
  // 반복되는 공통 클래스를 변수에 담아두면 코드가 깔끔해집니다.
  const base = styles.baseSkeleton;

  return (
    <div className={styles.settingsSkeletonContainer}>
      {/* 왼쪽 섹션 */}
      <div className={styles.leftSection}>
        <div className={`${base} ${styles.skeletonAvatar}`}></div>
        <div className={`${base} ${styles.skeletonBtnSmall}`}></div>
      </div>

      {/* 오른쪽 섹션 */}
      <div className={styles.rightSection}>
        <div className={`${base} ${styles.skeletonTitle}`}></div>
        
        <div className={styles.skeletonTabs}>
          <div className={`${base} ${styles.skeletonTabItem}`}></div>
          <div className={`${base} ${styles.skeletonTabItem}`}></div>
        </div>

        {/* 폼 입력창 스켈레톤 3개 생성 */}
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonFormItem}>
            <div className={`${base} ${styles.skeletonLabel}`}></div>
            <div className={`${base} ${styles.skeletonInput}`}></div>
          </div>
        ))}

        <div className={styles.skeletonActionBtns}>
          <div className={`${base} ${styles.skeletonBtnSmall}`}></div>
          <div className={`${base} ${styles.skeletonBtnSmall}`}></div>
        </div>
      </div>
    </div>
  );
}


// 기본 바 형태의 스켈레톤 (범용)
export default function Skeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${styles.baseSkeleton} ${styles.skeletonBar}`}></div>
      ))}
    </>
  );
}

