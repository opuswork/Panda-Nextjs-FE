"use client";

import { useState, useEffect } from "react";
import styles from './registration.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IMAGES } from "@/app/constants/images"; 
import Toast from './Toast';
import { showError, hideError } from './registration_validate';
// ✅ Auth 커스텀 훅 임포트
import { useAuth } from "@/app/contexts/AuthProvider";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`; 

const CATEGORIES = [
  'FASHION', 'BEAUTY', 'SPORTS', 'ELECTRONICS', 'BOOKS', 'DIGITAL_PRODUCTS',
  'HOME_INTERIOR', 'HOUSEHOLD_SUPPLIES', 'KITCHENWARE',
];

export default function Registration() {
  const router = useRouter();
  // ✅ 로그인한 사용자 정보 가져오기
  const { user: authUser } = useAuth();
  
  const [formData, setFormData] = useState({
    sellerName: '', // 판매자 이름 필드 추가
    name: '',
    description: '',
    category: '', 
    price: '',
    stock: '',
    image: null,
    tags: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [updating, setUpdating] = useState(false);
  // ✅ Toast 상태 관리
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // ✅ 사용자가 로그인 상태일 때 판매자 필드 자동 완성
  useEffect(() => {
    if (authUser) {
      const displayNickname = authUser.nickname || '닉네임 없음';
      const fullName = `${authUser.lastName || ''}${authUser.firstName || ''}`;
      
      // 형식: 닉네임 / 성이름
      const combinedSellerName = `${displayNickname} / ${fullName}`;
      
      setFormData(prev => ({
        ...prev,
        sellerName: combinedSellerName
      }));
    }
  }, [authUser]);

  useEffect(() => {
    if (isSubmitted) {
      validateFormData();
    }
  }, [formData, isSubmitted]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files?.[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData(prev => ({ ...prev, image: file }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: (name === 'price' || name === 'stock') 
          ? (value === '' ? '' : value) 
          : value,
      }));
    }
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
    if (toast.type === 'success') {
      router.push('/products');
      router.refresh();
    }
  };

  const validateFormData = () => {
    let isValid = true;
    if (!formData.name.trim()) { showError('itemName', 'productNameVarError', '상품명을 입력해주세요.'); isValid = false; }
    else hideError('itemName', 'productNameVarError');

    if (!formData.description.trim()) { showError('itemIntro', 'productIntroError', '상품 상세 정보를 입력해주세요.'); isValid = false; }
    else hideError('itemIntro', 'productIntroError');

    if (!formData.price || Number(formData.price) <= 0) { showError('itemPrice', 'productPriceError', '0보다 큰 값을 입력해야 합니다.'); isValid = false; }
    else hideError('itemPrice', 'productPriceError');

    if (!formData.stock || Number(formData.stock) <= 0) { showError('stock', 'productStockError', '0보다 큰 값을 입력해야 합니다.'); isValid = false; }
    else hideError('stock', 'productStockError');

    if (!formData.category) { showError('category', 'productCategoryError', '카테고리를 선택해주세요.'); isValid = false; }
    else hideError('category', 'productCategoryError');

    if (!formData.tags.trim()) { showError('itemTag', 'productTagError', '태그를 입력해주세요.'); isValid = false; }
    else hideError('itemTag', 'productTagError');

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    if (!validateFormData()) return;
    
    setLoading(true);
    setError(null);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('description', formData.description);
      dataToSend.append('category', formData.category);
      dataToSend.append('price', formData.price);
      dataToSend.append('stock', formData.stock);
      dataToSend.append('tags', JSON.stringify(tagsArray));

      if (formData.image) {
        dataToSend.append('image', formData.image);
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        body: dataToSend, 
        credentials: 'include',
      });
      
      // ✅ [수정] 응답 본문을 딱 한 번만 변수에 저장합니다.
      const result = await response.json();

      if (response.ok) {
        setToast({ 
          visible: true, 
          message: '상품이 성공적으로 등록되었습니다! 🎁', 
          type: 'success' 
        });
        // 성공 시에는 router.push가 Toast 종료 후 실행되도록 하거나 여기서 즉시 실행
        return; 
      } else {
        // ✅ [수정] 위에서 선언한 result 변수를 재사용합니다.
        setToast({ 
          visible: true, 
          message: result.message || '등록 실패', 
          type: 'error' 
        });
      }
    } catch (err) {
      console.error('등록 에러:', err);
      setToast({ visible: true, message: '서버 오류가 발생했습니다.', type: 'error' });
    } finally {
      // ✅ loading 상태를 해제하여 버튼을 다시 활성화합니다.
      setLoading(false);
    }
  };

  return (
    <div className={styles.registr}>
      {toast.visible && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={handleCloseToast} 
        />
      )}

      <div className={styles.registrTitle}>
        <h1 className={styles.resTitle}>상품 등록 하기</h1>
        <div className={styles.registrTitleButtons}>
          <button className={styles.cancelButton} type="button" onClick={() => router.push('/products')}>
            등록취소
          </button>
          <button className={styles.registrButton} type="submit" form="product-form" disabled={loading}>
            {loading ? '등록 중...' : '상품 등록'}
          </button>
        </div>
      </div>

      <form id="product-form" className={styles.productForm} onSubmit={handleSubmit}>
          {/* ✅ 판매자 이름 (Read Only) */}
          <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="sellerName">판매자</label>
              <input 
                className={`${styles.input} ${styles.readOnlyInput}`} 
                type="text" 
                id="sellerName" 
                name="sellerName" 
                value={formData.sellerName} 
                readOnly 
                placeholder="판매자 정보 불러오는 중..."
              />
          </div>

          <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="itemName">상품 이름</label>
              <input className={styles.input} type="text" id="itemName" name="name" value={formData.name} onChange={handleChange} placeholder="상품 이름을 입력하세요" />
              <div id="productNameVarError" className={styles.errorMessage}></div>
          </div>

          <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="itemIntro">상품 설명</label>
              <textarea className={styles.input} id="itemIntro" name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="상품 설명을 입력하세요" />
              <div id="productIntroError" className={styles.errorMessage}></div>
          </div>

          <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="category">카테고리</label>
              <select className={styles.input} id="category" name="category" value={formData.category} onChange={handleChange}>
                  <option value="">카테고리를 선택하세요</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div id="productCategoryError" className={styles.errorMessage}></div>
          </div>

          <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="itemPrice">가격</label>
              <input className={styles.input} type="number" id="itemPrice" name="price" value={formData.price} onChange={handleChange} min="0" placeholder="가격을 입력하세요" />
              <div id="productPriceError" className={styles.errorMessage}></div>
          </div>

          <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="stock">재고</label>
              <input className={styles.input} type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} min="0" placeholder="재고 수량을 입력하세요" />
              <div id="productStockError" className={styles.errorMessage}></div>
          </div>

          <div className={styles.inputGroup}>
              <label className={styles.label}>상품 이미지</label>
              <input className={styles.input} type="file" name="image" accept="image/*" onChange={handleChange} />
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

          <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="itemTag">태그 (쉼표 구분)</label>
              <input className={styles.input} type="text" id="itemTag" name="tags" value={formData.tags} onChange={handleChange} placeholder="예: 할인, 신상, 겨울옷" />
              <div id="productTagError" className={styles.errorMessage}></div>
          </div>
      </form>
    </div>
  );
}