'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Modal from './modal/modal';
import { IMAGES } from '../constants/images';
import styles from './comments.module.css';
import { useAuth } from '@/app/contexts/AuthProvider';
import { getFullImageUrl } from '@/app/constants/images';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function Comments({ 
  targetId, 
  comments, 
  onRefresh, 
  setToast, 
  emptyMessage = "등록된 내용이 없습니다.", 
  apiType = "articles" 
}) {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const { user: authUser } = useAuth();
  // ✅ 1. 절대 날짜 + 상대 시간 조합 함수
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const past = new Date(dateString);
    
    // 절대 날짜 (2026. 01. 03.)
    const absoluteDate = `${past.getFullYear()}. ${String(past.getMonth() + 1).padStart(2, '0')}. ${String(past.getDate()).padStart(2, '0')}`;
    
    // 상대 시간 계산
    const diffInMs = now - past;
    const diffInSec = Math.floor(diffInMs / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHrs = Math.floor(diffInMin / 60);
    const diffInDays = Math.floor(diffInHrs / 24);

    let relativeTime = '';
    if (diffInSec < 60) relativeTime = '방금 전';
    else if (diffInMin < 60) relativeTime = `${diffInMin}분 전`;
    else if (diffInHrs < 24) relativeTime = `${diffInHrs}시간 전`;
    else if (diffInDays < 7) relativeTime = `${diffInDays}일 전`;

    // 결과 조합: 2026. 01. 03. (방금 전)
    return relativeTime ? `${absoluteDate} (${relativeTime})` : absoluteDate;
  };

  // ✅ 2. 외부 클릭 시 케밥 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ 3. 수정/삭제 핸들러
  const handleEditClick = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setActiveDropdownId(null);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/${apiType}/${targetId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
        credentials: 'include', // 상대 경로에서도 이 옵션은 필요합니다.
      });
      if (!res.ok) throw new Error('수정에 실패했습니다.');
      setEditingCommentId(null);
      onRefresh();
      setToast({ visible: true, message: '수정되었습니다.', type: 'success' });
    } catch (err) {
      setToast({ visible: true, message: err.message, type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/${apiType}/${targetId}/comments/${deletingCommentId}`, {
        method: 'DELETE',
        credentials: 'include', // 상대 경로에서도 이 옵션은 필요합니다.
      });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      setDeletingCommentId(null);
      onRefresh();
      setToast({ visible: true, message: '삭제되었습니다.', type: 'success' });
    } catch (err) {
      setToast({ visible: true, message: err.message, type: 'error' });
    }
  };

  return (
    <div className={styles.commentsSection}>
      {comments.length === 0 ? (
        <p className={styles.noComments}>{emptyMessage}</p>
      ) : (
        <ul className={styles.commentList}>
          {comments.map((comment) => (
            <li key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <div className={styles.authorInfo}>
                <Image 
                    src={getFullImageUrl(comment.author?.image, 'profile')} 
                    alt="프로필"
                    width={32}
                    height={32}
                    className={styles.profileIcon}
                />
                  <div className={styles.authorMeta}>
                    <span className={styles.authorName}>
                    {comment.authorUser?.nickname || '익명 사용자'}
                    </span>
                    <span className={styles.commentDate}>{formatDateTime(comment.createdAt)}</span>
                  </div>
                </div>
                
                {editingCommentId !== comment.id && (
                  <div className={styles.commentActionsMenu} ref={activeDropdownId === comment.id ? dropdownRef : null}>
                    {authUser && authUser.id === comment.authorId && (
                        <button className={styles.kebabButton} onClick={() => setActiveDropdownId(activeDropdownId === comment.id ? null : comment.id)}>
                        <Image 
                            src={IMAGES.ICON_KEBAB} 
                            alt="메뉴" 
                            width={24} 
                            height={24} 
                        />
                        </button>
                    )}
                    {activeDropdownId === comment.id && (
                      <div className={styles.commentDropdown}>
                        <button className={styles.dropdownItem} onClick={() => handleEditClick(comment)}>수정하기</button>
                        <button className={styles.dropdownItem} onClick={() => { setDeletingCommentId(comment.id); setActiveDropdownId(null); }}>삭제하기</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {editingCommentId === comment.id ? (
                <div className={styles.editForm}>
                  <textarea className={styles.editTextarea} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  <div className={styles.editButtons}>
                    <button onClick={() => setEditingCommentId(null)} className={styles.cancelButton}>취소</button>
                    <button onClick={() => handleUpdateComment(comment.id)} className={styles.saveButton}>저장</button>
                  </div>
                </div>
              ) : (
                <p className={styles.commentContent}>{comment.content}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {deletingCommentId && (
        <Modal onClose={() => setDeletingCommentId(null)}>
          <div className={styles.deleteModalContent}>
            <h3>삭제 확인</h3>
            <p>정말 삭제하시겠습니까?</p>
            <div className={styles.deleteModalButtons}>
              <button onClick={() => setDeletingCommentId(null)} className={styles.modalCancelBtn}>취소</button>
              <button onClick={handleDeleteConfirm} className={styles.modalDeleteBtn}>삭제</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}