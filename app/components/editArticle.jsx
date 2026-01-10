// app/components/editArticle.jsx
'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Toast from './Toast';
import { IMAGES } from '../constants/images';
import styles from './editArticle.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

function EditArticle({ initialData }) {
  const router = useRouter();
  const articleId = initialData.id;

  // 1. 상태 관리: props로 받은 데이터로 즉시 초기화
  // author가 객체인 경우 문자열로 변환 (nickname 또는 lastName+firstName)
  const getAuthorString = (author) => {
    if (!author) return '';
    if (typeof author === 'string') return author;
    if (typeof author === 'object') {
      return author.nickname || `${author.lastName || ''}${author.firstName || ''}` || '';
    }
    return '';
  };

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    content: initialData.content || '',
    author: getAuthorString(initialData.author),
    image: null, 
  });

  const [imagePreview, setImagePreview] = useState(getFullImageUrl(initialData.image));
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // 2. 이벤트 핸들러
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files?.[0]) {
      const file = files[0];
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: file }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: 'delete' }));
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
    if (toast.type === 'success') {
      router.push(`/articles/${articleId}`);
      router.refresh();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title.trim());
      // author는 관계 필드이므로 수정하지 않음 (작성자는 변경 불가)
      dataToSend.append('content', formData.content.trim());
      
      if (formData.image instanceof File) {
        dataToSend.append('image', formData.image);
      } else if (formData.image === 'delete') {
        dataToSend.append('deleteImage', 'true');
      }

      const res = await fetch(`${API_BASE_URL}/api/articles/${articleId}`, {
        method: 'PATCH',
        body: dataToSend,
      });

      if (!res.ok) throw new Error('게시글 수정에 실패했습니다.');

      setToast({ visible: true, message: '게시글이 성공적으로 수정되었습니다! ✨', type: 'success' });
    } catch (err) {
      setToast({ visible: true, message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.editArticleContainer}>
      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      <div className={styles.editArticleWrapper}>
        <div className={styles.editArticleHeader}>
          <h1 className={styles.editArticleTitle}>게시글 수정</h1>
          <div className={styles.editArticleHeaderButtons}>
            <button type="button" className={styles.editArticleCancelBtn} onClick={() => router.back()} disabled={loading}>취소</button>
            <button type="submit" form="edit-form" className={styles.editArticleSubmitBtn} disabled={loading}>수정</button>
          </div>
        </div>

        <form id="edit-form" onSubmit={handleSubmit} className={styles.editArticleForm}>
          <div className={styles.editArticleField}>
            <label htmlFor="title" className={styles.editArticleLabel}>*제목</label>
            <input type="text" id="title" name="title" className={styles.editArticleInput} value={formData.title} onChange={handleChange} required />
          </div>

          <div className={styles.editArticleField}>
            <label htmlFor="author" className={styles.editArticleLabel}>*작성자</label>
            <input type="text" id="author" name="author" className={styles.editArticleInput} value={formData.author} onChange={handleChange} required />
          </div>

          <div className={styles.editArticleField}>
            <label htmlFor="content" className={styles.editArticleLabel}>*내용</label>
            <textarea id="content" name="content" className={styles.editArticleTextarea} value={formData.content} onChange={handleChange} rows={10} required />
          </div>

          <div className={styles.editArticleField}>
            <label className={styles.editArticleLabel}>이미지</label>
            <div className={styles.editArticleImageUpload}>
              <input type="file" id="image-input" name="image" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
              {imagePreview ? (
                <div className={styles.editArticleImagePreview}>
                  <Image src={imagePreview} alt="미리보기" width={300} height={200} unoptimized />
                  <button type="button" className={styles.editArticleImageRemove} onClick={handleRemoveImage}>×</button>
                </div>
              ) : (
                <div className={styles.editArticleImagePlaceholder} onClick={() => document.getElementById('image-input').click()}>
                  <span className={styles.addArticleImageIcon}>+</span>
                  <span className={styles.addArticleImageText}>이미지 변경</span>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditArticle;