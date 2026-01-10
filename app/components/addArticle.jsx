"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Toast from './Toast'; 
import styles from './addArticle.module.css';
// ✅ Auth 커스텀 훅 임포트
import { useAuth } from '@/app/contexts/AuthProvider';

function AddArticle() {
  const router = useRouter();
  // ✅ 로그인한 사용자 정보 가져오기
  const { user: authUser } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '', // 여기에 닉네임이나 이름이 들어갑니다.
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // ✅ 1. 로그인한 사용자가 있으면 작성자 필드 자동 완성
  useEffect(() => {
    if (authUser) {
      const displayName = authUser.nickname || `${authUser.lastName}${authUser.firstName}`;
      setFormData(prev => ({ ...prev, author: displayName }));
    }
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files?.[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData(prev => ({ ...prev, image: file }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageClick = () => {
    document.getElementById('image-input').click();
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null }));
    const input = document.getElementById('image-input');
    if (input) input.value = '';
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
    if (toast.type === 'success') {
      router.push('/articles');
      router.refresh();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ 2. 로그인 여부 및 유효성 검사
    if (!authUser) {
      setToast({ visible: true, message: '로그인이 필요합니다.', type: 'error' });
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setToast({ visible: true, message: '제목과 내용을 입력해주세요.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title.trim());
      dataToSend.append('content', formData.content.trim());
      // 💡 백엔드에서 authorId를 쓰므로 author 문자열은 더 이상 필수가 아닐 수 있지만, 
      // 기존 API와의 호환성을 위해 유지하거나 백엔드 로직에 맞춰 삭제해도 됩니다.
      
      if (formData.image) {
        dataToSend.append('image', formData.image);
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';
      
      const response = await fetch(`${API_BASE_URL}/api/articles`, {
        method: 'POST',
        // ✅ [중요] 쿠키(토큰)를 백엔드에 보내기 위해 반드시 포함!
        credentials: 'include', 
        body: dataToSend, 
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '게시글 등록에 실패했습니다.');
      }

      setToast({ 
        visible: true, 
        message: '게시글이 성공적으로 등록되었습니다! 📝', 
        type: 'success' 
      });

    } catch (err) {
      console.error('[AddArticle] Submit Error:', err);
      setToast({ visible: true, message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.addArticleContainer}>
      {toast.visible && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={handleCloseToast} 
        />
      )}

      <div className={styles.addArticleWrapper}>
        <div className={styles.addArticleHeader}>
          <h1 className={styles.addArticleTitle}>게시글 쓰기</h1>
          <div className={styles.addArticleHeaderButtons}>
            <button 
              type="button" 
              className={styles.addArticleCancelBtn} 
              onClick={() => router.push('/articles')}
              disabled={loading}
            >
              취소
            </button>
            <button 
              type="submit" 
              form="article-form" 
              className={styles.addArticleSubmitBtn}
              disabled={loading || !authUser} // 로그인 안 했으면 비활성화
            >
              {loading ? '등록 중...' : '등록'}
            </button>
          </div>
        </div>

        <form id="article-form" onSubmit={handleSubmit} className={styles.addArticleForm}>
          <div className={styles.addArticleField}>
            <label htmlFor="title" className={styles.addArticleLabel}>*제목</label>
            <input
              type="text"
              id="title"
              name="title"
              className={styles.addArticleInput}
              placeholder="제목을 입력해주세요"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* ✅ 3. 작성자 필드 수정 (Read Only) */}
          <div className={styles.addArticleField}>
            <label htmlFor="author" className={styles.addArticleLabel}>작성자</label>
            <input
              type="text"
              id="author"
              name="author"
              className={`${styles.addArticleInput} ${styles.readOnlyInput}`}
              value={formData.author}
              readOnly // ✅ 직접 수정 불가능하게 설정
              placeholder="로그인 정보가 없습니다"
            />
          </div>

          <div className={styles.addArticleField}>
            <label htmlFor="content" className={styles.addArticleLabel}>*내용</label>
            <textarea
              id="content"
              name="content"
              className={styles.addArticleTextarea}
              placeholder="내용을 입력해주세요"
              value={formData.content}
              onChange={handleChange}
              rows={10}
            />
          </div>

          <div className={styles.addArticleField}>
            <label className={styles.addArticleLabel}>이미지</label>
            <div className={styles.addArticleImageUpload}>
              <input
                type="file"
                id="image-input"
                name="image"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              {imagePreview ? (
                <div className={styles.addArticleImagePreview}>
                  <img src={imagePreview} alt="미리보기" />
                  <button
                    type="button"
                    className={styles.addArticleImageRemove}
                    onClick={handleRemoveImage}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div 
                  className={styles.addArticleImagePlaceholder}
                  onClick={handleImageClick}
                >
                  <span className={styles.addArticleImageIcon}>+</span>
                  <span className={styles.addArticleImageText}>이미지 등록</span>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddArticle;