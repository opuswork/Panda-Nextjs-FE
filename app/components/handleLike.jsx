// app/components/handleLike.jsx

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IMAGES } from "../constants/images";
import styles from "./handleLike.module.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://panda-nextjs-be.vercel.app";

export default function LikeButton({ id, type, initialCount, setToast }) {
  const [count, setCount] = useState(initialCount);
  const [isAnimate, setIsAnimate] = useState(false);

  // 초기값이 변경될 때(서버에서 새로 받아올 때) 상태 업데이트
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const handleLikeClick = async () => {
    // 💡 아이템별 + 타입별 고유 키 생성 (예: likes_articles_123)
    const STORAGE_KEY = `likes_${type}_${id}`;
    const today = new Date().toLocaleDateString();

    // 1. 로컬 스토리지 체크
    const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    if (storedData.date === today && storedData.count >= 3) {
      setToast({
        visible: true,
        message: "하루에 최대 3번까지만 응원할 수 있습니다! ✨",
        type: "error",
      });
      return;
    }

    try {
      // 2. API 호출 (타입에 따라 경로 동적 변경)
      const res = await fetch(`${API_BASE_URL}/api/${type}/${id}/favorite`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("좋아요 처리에 실패했습니다.");

      const data = await res.json();

      // 3. 로컬 스토리지 업데이트
      const newCount = storedData.date === today ? storedData.count + 1 : 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: newCount }));

      // 4. UI 업데이트 및 애니메이션 실행
      setCount(data.favoriteCount);
      setIsAnimate(true);
      setTimeout(() => setIsAnimate(false), 100); // 0.1초 후 애니메이션 종료

      setToast({
        visible: true,
        message: `좋아요 완료! (오늘 ${newCount}/3회) ❤️`,
        type: "success",
      });
    } catch (err) {
      setToast({ visible: true, message: err.message, type: "error" });
    }
  };

  return (
    <div className={styles.likeContainer} onClick={handleLikeClick}>
      <div className={`${styles.heartWrapper} ${isAnimate ? styles.pumping : ""}`}>
        <Image
          src={IMAGES.ICON_HEART}
          alt="좋아요"
          width={24}
          height={24}
          className={styles.heartIcon}
        />
      </div>
      <span className={styles.likeCount}>{count || 0}</span>
    </div>
  );
}