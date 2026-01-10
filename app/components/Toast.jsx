// app/components/Toast.jsx
"use client";
import React, { useEffect } from 'react';
import styles from './toast.module.css';

export default function Toast({ message, type = 'success', onClose, duration = 2500 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // 지정된 시간 뒤에 부모의 상태를 false로 변경
    }, duration);

    return () => clearTimeout(timer); // 컴포넌트가 사라질 때 타이머 청소
  }, [onClose, duration]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      {type === 'success' ? '✅' : '❌'} {message}
    </div>
  );
}