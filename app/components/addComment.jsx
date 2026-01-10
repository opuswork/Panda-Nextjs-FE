// app/components/addComment.jsx

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { IMAGES } from '../constants/images';
import styles from './addComment.module.css';
// ✅ Auth 커스텀 훅 임포트
import { useAuth } from '@/app/contexts/AuthProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function AddComment({ 
  targetId,           // 게시글 ID 또는 상품 ID
  onCommentAdded,     // 등록 후 목록 새로고침 함수
  setToast,           // 토스트 메시지 함수
  title = "댓글달기",   // 섹션 제목
  apiType = "articles" // API 경로 구분 (articles 또는 products)
}) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ 로그인한 사용자 정보 가져오기
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 유효성 검사
    if (!content.trim() || isSubmitting) return;

    // 2. 로그인 여부 확인
    if (!user) {
      setToast({ 
        visible: true, 
        message: '로그인이 필요한 서비스입니다. 🔒', 
        type: 'error' 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ 동적 API 주소 생성
      const res = await fetch(`${API_BASE_URL}/api/${apiType}/${targetId}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        // ✅ [핵심] 쿠키(auth_token)를 서버로 전달하기 위해 필수 설정
        credentials: 'include', 
        // ✅ 이제 작성자 정보는 서버가 토큰에서 직접 추출하므로 content만 전송
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        // 401(인증 에러) 발생 시 처리
        if (res.status === 401) {
          throw new Error('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        const errorData = await res.json();
        throw new Error(errorData.error || '등록에 실패했습니다.');
      }

      setContent(''); // 입력창 초기화
      if (onCommentAdded) onCommentAdded(); // 부모 컴포넌트에 목록 새로고침 요청
      setToast({ visible: true, message: '댓글이 성공적으로 등록되었습니다! ✨', type: 'success' });

    } catch (err) {
      setToast({ visible: true, message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.commentInputSection}>
      <h2 className={styles.commentSectionTitle}>{title}</h2>
      <form className={styles.commentForm} onSubmit={handleSubmit}>
        <div className={styles.textareaWrapper}>
          <textarea
            className={styles.commentTextarea}
            placeholder={
              user 
                ? "따뜻한 댓글은 게시자에게 큰 힘이 됩니다. (명예 훼손 등은 제재 대상이 될 수 있습니다.)" 
                : "댓글을 작성하려면 먼저 로그인해주세요."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting || !user} // 로그인 안 했을 시 입력 차단
          />
          <button 
            type="submit" 
            className={styles.commentSubmitButton}
            disabled={!content.trim() || isSubmitting || !user}
          >
            {isSubmitting ? '등록 중...' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
}