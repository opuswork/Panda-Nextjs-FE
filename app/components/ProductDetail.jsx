'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// ✅ Auth 커스텀 훅 임포트
import { useAuth } from '@/app/contexts/AuthProvider';

// 공통 컴포넌트
import Modal from './modal/modal';
import Toast from './Toast';
import LikeButton from './handleLike';
import AddComment from './addComment'; 
import Comments from './comments';      

import { IMAGES } from '@/app/constants/images'; 
import styles from './ProductDetail.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const getFullImageUrl = (path) => {
  if (!path) return IMAGES.PRODUCT_DEFAULT;
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

function ProductDetail({ product: initialProduct, initialQnas = [] }) {
  const router = useRouter();
  
  // 1. 상태 관리
  const [product] = useState(initialProduct);
  const [qnas, setQnas] = useState(initialQnas); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  const actionsDropdownRef = useRef(null);

  // 2. 인증 정보 및 권한 체크
  const { user: authUser } = useAuth();
  
  // ✅ [핵심 로직] 로그인 유저 ID와 상품 판매자(sellerId) 비교
  // 두 값이 모두 존재할 때만 비교를 수행합니다.
  const isOwner = authUser?.id && product?.sellerId && authUser.id === product.sellerId;

  // 문의 내역 새로고침
  const refreshQnas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${product.id}/comments`);
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.comments || []);
      setQnas(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("문의 내역 로드 실패:", err);
    }
  }, [product.id]);

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
    setToast((prev) => ({ ...prev, visible: false }));
    if (toast.type === 'success' && isDeleting) {
      router.push('/products');
      router.refresh();
    }
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${product.id}`, { 
        method: 'DELETE',
        credentials: 'include' // ✅ 쿠키(토큰) 포함 필수
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || '상품 삭제에 실패했습니다.');
      }

      setToast({ 
        visible: true, 
        message: '상품이 삭제되었습니다. ✨', 
        type: 'success' 
      });
    } catch (err) {
      setToast({ visible: true, message: err.message, type: 'error' });
      setIsDeleting(false);
    }
  };

  const categoryLabels = {
    FASHION: '패션', 
    BEAUTY: '뷰티', 
    SPORTS: '스포츠',
    ELECTRONICS: '전자제품', 
    HOME_INTERIOR: '홈인테리어',
    HOUSEHOLD_SUPPLIES: '생활용품', 
    KITCHENWARE: '주방용품',
    BOOKS: '도서',
    DIGITAL_PRODUCTS: '디지털 제품/음반',
  };

  return (
    <div className={styles.productDetailContainer}>
      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      <div className={styles.productDetailHeader}>
        <button onClick={() => router.push('/products')} className={styles.backButton}>
          <Image src={IMAGES.ICON_BACK} alt="back" width={20} height={20} />
          목록으로 돌아가기
        </button>
      </div>

      <div className={styles.productDetailContent}>
        <div className={styles.productDetailImageSection}>
          <Image
            src={getFullImageUrl(product.image)} 
            alt={product.name}
            className={styles.productDetailImage}
            width={500} height={500}
            priority unoptimized
            onError={(e) => { e.target.src = IMAGES.PRODUCT_DEFAULT; }}
          />
        </div>

        <div className={styles.productDetailInfoSection}>
          <div className={styles.productTitleRow}>
            <h1 className={styles.productDetailName}>{product.name}</h1>
            
            {/* ✅ [핵심] 본인 상품일 때만 케밥 메뉴 노출 */}
            {isOwner && (
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
                      onClick={() => { setShowActionsDropdown(false); router.push(`/products/${product.id}/edit`); }}
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

          <div className={styles.productDetailCategory}>
            {categoryLabels[product.category] || product.category}
          </div>

          <div className={styles.priceAndLikeRow}>
            <div className={styles.productDetailPrice}>
              {product.price?.toLocaleString()}원
            </div>
            <LikeButton 
              id={product.id} 
              type="products" 
              initialCount={product.favoriteCount} 
              setToast={setToast} 
            />
          </div>

          <div className={styles.productDetailDescription}>
            <h3>상품 소개</h3>
            <p>{product.description || "등록된 설명이 없습니다."}</p>
          </div>

          <div className={styles.productDetailStock}>
            <strong>재고:</strong> {product.stock}개
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className={styles.productDetailTags}>
              <h3>태그</h3>
              <div className={styles.tagsList}>
                {product.tags.map((item) => (
                  <span key={item.tag?.id || item.id} className={styles.tagItem}>
                    # {item.tag?.name || item.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.qnaSection}>
        <AddComment 
          className={styles.addCommentSection}
          targetId={product.id} 
          apiType="products"
          title="문의하기"
          onCommentAdded={refreshQnas} 
          setToast={setToast}
        />
        
        <Comments 
          className={styles.commentsSection}
          targetId={product.id}
          apiType="products"
          comments={qnas} 
          emptyMessage="등록된 문의가 없습니다."
          onRefresh={refreshQnas} 
          setToast={setToast}
        />

        <button onClick={() => router.push('/products')} className={styles.backToListButton}>
          <Image src={IMAGES.ICON_BACK} alt="back" width={20} height={20} />
          목록으로 돌아가기
        </button>
      </div>

      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className={styles.deleteModalContent}>
            <h3>상품 삭제</h3>
            <p>정말 이 상품을 삭제하시겠습니까?<br/>삭제된 상품은 복구할 수 없습니다.</p>
            <div className={styles.deleteModalButtons}>
              <button onClick={() => setShowDeleteModal(false)} className={styles.modalCancelBtn}>취소</button>
              <button onClick={handleDeleteConfirm} className={styles.modalDeleteBtn}>삭제</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ProductDetail;