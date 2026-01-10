// app/components/SecondHandMarket.jsx
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IMAGES } from "@/app/constants/images";
import SearchProduct from "./SearchProduct";
import Pagination from "./pagination";
import styles from "./SecondHandMarket.module.css";

// 💡 이미지 절대 경로 변환 함수
const getFullImageUrl = (path) => {
  if (!path) return IMAGES.PRODUCT_DEFAULT;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// 💡 Props로 initialData와 initialParams를 받습니다.
function SecondHandMarket({ initialData, initialParams }) {
  const router = useRouter();

  // 데이터 추출
  const products = initialData?.items || [];
  const totalCount = initialData?.pagination?.total || 0;
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  /**
   * 💡 핵심 로직: URL을 업데이트하여 서버 컴포넌트를 다시 실행시킵니다.
   * 이렇게 하면 Next.js가 자동으로 loading.js(Skeleton)를 보여줍니다.
   */
  const updateQuery = (newParams) => {
    const params = new URLSearchParams({
      page: initialParams.page || "1",
      orderBy: initialParams.orderBy || "recent",
      keyword: initialParams.keyword || "",
      ...newParams // 새롭게 변경될 값 (예: page: 2)
    });

    // 주소창을 변경합니다. (예: /products?page=2&orderBy=recent)
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>판매 중인 상품</h1>
          <div className={styles.mobileRegisterButton}>
            {/* 등록 버튼 클릭 시 등록 페이지로 이동하도록 설정되어 있다고 가정 */}
            <SearchProduct showRegisterButtonOnly={true} />
          </div>
        </div>
        <span className={styles.totalCount}>전체상품수: [{totalCount}]</span>
        <div className={styles.searchSection}>
          <SearchProduct
            // 검색 시 keyword 업데이트 및 페이지 1로 리셋
            onSearch={(k) => updateQuery({ keyword: k, page: "1" })}
            // 검색어 지울 때
            onClear={() => updateQuery({ keyword: "", page: "1" })}
            // 정렬 변경 시
            onSortChange={(sortValue) => updateQuery({ orderBy: sortValue, page: "1" })}
            initialSort={initialParams.orderBy === "recent" ? "최신순" : "좋아요순"}
          />
        </div>
      </div>

      <div className={styles.productsGrid}>
        {products.length === 0 ? (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>
              <Image 
                src={IMAGES.NO_RESULT} 
                alt="No Results" 
                width={100} 
                height={100} 
              />
            </span>
            {initialParams.keyword ? 
              "검색 결과가 없습니다." : 
              "등록된 상품이 없습니다."
            }
          </div>
        ) : (
          <>
            {products.map((product) => (
              <div
                key={product.id}
                className={styles.productCard}
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <div className={styles.productImage}>
                  <Image
                    src={getFullImageUrl(product.image)}
                    alt={product.name || "Product"}
                    width={240}
                    height={240}
                    className={styles.image}
                    unoptimized={true}
                    priority
                    onError={(e) => { e.target.src = IMAGES.PRODUCT_DEFAULT; }}
                  />
                </div>

                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productPrice}>
                    {Number(product.price).toLocaleString()}원
                  </p>

                  <div className={styles.productLikes}>
                    <span className={styles.heartIcon}>♡</span>
                    <span>{product.favoriteCount || 0}</span>
                  </div>
                  
                  <div className={styles.productTags}>
                    {product.tags && product.tags.length > 0 && (
                      <div className={styles.tagsList}>
                        {product.tags.map((item, index) => (
                          <span key={item.tag?.id || item.id || index} className={styles.tagItem}>
                            {item.tag?.name || item.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Pagination
        currentPage={Number(initialParams.page || 1)}
        totalPages={totalPages}
        // 페이지 변경 시 URL 업데이트
        onPageChange={(page) => updateQuery({ page: String(page) })}
      />
    </div>
  );
}

export default SecondHandMarket;