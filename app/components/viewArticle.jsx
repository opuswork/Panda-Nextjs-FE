'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

// 분리된 컴포넌트들
import Modal from './modal/modal';
import Toast from './Toast';
import AddComment from './addComment';
import Comments from './comments';
import LikeButton from './handleLike';

// ✅ Auth 정보 가져오기
import { useAuth } from '@/app/contexts/AuthProvider';
import { IMAGES } from '../constants/images';
import styles from './viewArticle.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// 이미지 URL 처리 함수
const getFullImageUrl = (path, defaultType = 'profile') => {
  if (!path) {
    return defaultType === 'profile' 
      ? '/assets/icons/MyPage_avatar.svg' 
      : IMAGES.ICON_PROFILE;
  }
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

function ViewArticle({ initialArticle, initialComments }) {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id || params.articleId;
  
  // ✅ 현재 로그인한 사용자 정보
  const { user: authUser } = useAuth();

  const [article] = useState(initialArticle);
  const [comments, setComments] = useState(initialComments || []);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  
  const actionsDropdownRef = useRef(null);

  // 댓글 목록 새로고침
  const refreshComments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/articles/${articleId}/comments`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("댓글 로드 실패:", err);
    }
  }, [articleId]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target)) {
        setShowActionsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
    if (toast.type === 'success' && isDeleting) {
      router.push('/articles');
      router.refresh();
    }
  };

  // ✅ 게시글 삭제 실행 (인증 포함)
  const handleConfirmDeleteArticle = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/articles/${articleId}`, { 
        method: 'DELETE',
        credentials: 'include' // ✅ 쿠키 전송 필수
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '게시글 삭제에 실패했습니다.');
      }

      setToast({ 
        visible: true, 
        message: '게시글이 성공적으로 삭제되었습니다. ✨', 
        type: 'success' 
      });
    } catch (err) {
      setToast({ visible: true, message: err.message, type: 'error' });
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className={styles.viewArticleContainer}>
      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      <div className={styles.viewArticleContent}>
        <div className={styles.articleHeader}>
          <div className={styles.articleTitleRow}>
            <h1 className={styles.articleTitle}>{article.title}</h1>
            
            {/* ✅ [수정] 본인의 글일 때만 케밥 메뉴 노출 */}
            {authUser && authUser.id === article.authorId && (
              <div className={styles.articleActionsMenu} ref={actionsDropdownRef}>
                <button 
                  className={styles.articleActionsButton} 
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                >
                  <Image src={IMAGES.ICON_KEBAB} alt="메뉴" width={24} height={24} />
                </button>
                {showActionsDropdown && (
                  <div className={styles.articleActionsDropdown}>
                    <button 
                      className={styles.articleActionItem} 
                      onClick={() => { setShowActionsDropdown(false); router.push(`/articles/${articleId}/edit`); }}
                    >
                      수정하기
                    </button>
                    <button 
                      className={styles.articleActionItem} 
                      onClick={() => { setShowActionsDropdown(false); setShowDeleteModal(true); }}
                    >
                      삭제하기
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.articleMetaInfo}>
            <div className={styles.authorInfo}>
                <Image 
                  src={getFullImageUrl(article.author?.image)} 
                  alt="프로필" 
                  width={32} 
                  height={32} 
                  className={styles.profileIcon}
                  unoptimized
                />
              <span className={styles.authorName}>
              {article.author?.nickname || 
                (article.author ? `${article.author.lastName}${article.author.firstName}` : '익명')}
              </span>
              <span className={styles.articleDate}>{formatDate(article.createdAt)}</span>
              <span className={styles.divider}></span>
              
              <LikeButton 
                id={articleId} 
                type="articles" 
                initialCount={article.favoriteCount} 
                setToast={setToast} 
              />
            </div>
          </div>
        </div>

        <div className={styles.articleBody}>
          {article.image && (
            <div className={styles.articleImageContainer}>
              <Image 
                src={getFullImageUrl(article.image, 'product')} 
                alt={article.title} 
                className={styles.articleMainImage} 
                width={800} height={450} 
                priority unoptimized
              />
            </div>
          )}
          <div className={styles.articleTextContent}>{article.content}</div>
        </div>

        <AddComment 
          targetId={articleId} 
          apiType="articles"
          onCommentAdded={refreshComments} 
          setToast={setToast} 
        />
        
        <Comments 
          targetId={articleId}
          apiType="articles"
          comments={comments} 
          onRefresh={refreshComments} 
          setToast={setToast} 
        />

        <button onClick={() => router.push('/articles')} className={styles.backToListButton}>
          <Image src={IMAGES.ICON_BACK} alt="back" width={20} height={20} />
          목록으로 돌아가기
        </button>
      </div>

      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className={styles.deleteModalContent}>
            <h3>게시글 삭제</h3>
            <p>정말 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.</p>
            <div className={styles.deleteModalButtons}>
              <button onClick={() => setShowDeleteModal(false)} className={styles.modalCancelBtn}>취소</button>
              <button onClick={handleConfirmDeleteArticle} className={styles.modalDeleteBtn}>확인</button>
            </div>
          </div>
        </Modal>
      )}

      {isDeleting && <div className={styles.deletingOverlay}><p>삭제 중...</p></div>}
    </div>
  );
}

export default ViewArticle;