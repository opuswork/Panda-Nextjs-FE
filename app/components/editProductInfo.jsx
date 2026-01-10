// app/components/editProductInfo.jsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IMAGES } from '@/app/constants/images';
import Toast from './Toast'; // ✅ 새로 만드신 Toast 컴포넌트
import styles from './registration.module.css';

const CATEGORIES = [
  'FASHION', 'BEAUTY', 'SPORTS', 'ELECTRONICS', 'BOOKS', 'DIGITAL_PRODUCTS',
  'HOME_INTERIOR', 'HOUSEHOLD_SUPPLIES', 'KITCHENWARE',
];

// 💡 이미지 절대 경로 변환 헬퍼 함수
const getFullImageUrl = (path) => {
  if (!path) return IMAGES.PRODUCT_DEFAULT;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

function EditProductInfo({ initialProduct, productId }) {
  const router = useRouter();
  const id = productId;

  // 1. 상태 관리
  const [formData, setFormData] = useState({
    name: initialProduct.name || '',
    description: initialProduct.description || '',
    category: initialProduct.category || CATEGORIES[0],
    price: initialProduct.price || 0,
    stock: initialProduct.stock || 0,
    image: null,
    tags: initialProduct.tags 
      ? initialProduct.tags.map(item => item.tag?.name || item.name).join(', ') 
      : '',
  });

  const [imagePreview, setImagePreview] = useState(
    initialProduct.image ? getFullImageUrl(initialProduct.image) : null
  );

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Toast 상태 관리
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // 2. 이벤트 핸들러
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files?.[0]) {
      const file = files[0];
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: file }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: (name === 'price' || name === 'stock') ? value : value,
      }));
    }
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
    // ✅ 수정이나 삭제 성공 시에만 목록으로 이동
    if (toast.type === 'success') {
      router.push('/products');
      router.refresh(); // 목록 데이터 최신화
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('description', formData.description);
      dataToSend.append('category', formData.category);
      dataToSend.append('price', formData.price);
      dataToSend.append('stock', formData.stock);
      dataToSend.append('tags', JSON.stringify(tagsArray));

      if (formData.image instanceof File) {
        dataToSend.append('image', formData.image);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/api/products/${id}`, {
        method: 'PATCH',
        body: dataToSend,
        credentials: 'include',
        // FormData 전송 시 Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 multipart/form-data로 설정)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '수정 중 오류가 발생했습니다.');
      }

      // ✅ Toast 알림 표시
      setToast({ 
        visible: true, 
        message: '상품 정보가 성공적으로 수정되었습니다! ✨', 
        type: 'success' 
      });

    } catch (err) {
      setToast({ visible: true, message: err.message, type: 'error' });
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.registr}>
      {/* ✅ 커스텀 Toast 컴포넌트 배치 */}
      {toast.visible && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={handleCloseToast} 
        />
      )}

      <div className={styles.registrTitle}>
          <h1 className={styles.resTitle}>상품 수정</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className={styles.registrButton} style={{ background: '#D1D5DB', color: '#374151' }} onClick={() => router.back()} disabled={updating}>수정 취소</button>
              <button type="submit" form="edit-form" className={styles.registrButton} disabled={updating}>{updating ? '저장 중...' : '수정 완료'}</button>
          </div>
      </div>
      
      <form id="edit-form" onSubmit={handleSubmit} className={styles.productForm}>
        <div>
          <label className={styles.label}>상품 이름 (name)</label>
          <input className={styles.input} name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div>
          <label className={styles.label}>상품 설명 (description)</label>
          <textarea className={styles.input} name="description" value={formData.description} onChange={handleChange} rows={4} required />
        </div>

        <div>
          <label className={styles.label}>카테고리 (category)</label>
          <select className={styles.input} name="category" value={formData.category} onChange={handleChange}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <label className={styles.label}>가격 (price)</label>
            <input className={styles.input} type="number" name="price" value={formData.price} onChange={handleChange} min="0" required />
          </div>
          <div style={{ flex: 1 }}>
            <label className={styles.label}>재고 (stock)</label>
            <input className={styles.input} type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" required />
          </div>
        </div>

        <div>
            <label className={styles.label}>상품 이미지 변경 (image)</label>
            <input className={styles.input} type="file" accept="image/*" onChange={handleChange} />
            <div className={styles.imagePreviewWrapper} style={{ marginTop: '10px' }}>
              <Image 
                src={imagePreview || IMAGES.PRODUCT_DEFAULT} 
                alt="미리보기" 
                width={200} height={200} 
                style={{ borderRadius: '8px', border: '1px solid #E5E7EB', objectFit: 'cover' }}
                unoptimized={true}
              />
            </div>
        </div>

        <div>
          <label className={styles.label}>태그 (쉼표로 구분)</label>
          <input className={styles.input} name="tags" value={formData.tags} onChange={handleChange} placeholder="예: 할인, 가을신상" />
        </div>
      </form>
    </div>
  );
}

export default EditProductInfo;