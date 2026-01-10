"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import SearchArticle from "./SearchArticle";
import Pagination from "./pagination";
import ProductSkeleton from "./Skeleton";
import styles from "./Articles.module.css";
import { IMAGES } from "@/app/constants/images";
import { useAuth } from "@/app/contexts/AuthProvider"; // ✅ useAuth 추가

// 이미지 경로 정규화 함수
const normalizeImagePath = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("data:") || imagePath.startsWith("http")) return imagePath;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  if (imagePath.startsWith("/assets")) return imagePath;

  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};

function Articles() {
  const router = useRouter();
  const location = usePathname();
  
  // ✅ Context에서 로그인 정보와 로딩 상태 가져오기
  const { user, isPending } = useAuth();

  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PAGE_SIZE = 10;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}`;
  };

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("pageSize", String(PAGE_SIZE));
    params.set("orderBy", sortOrder);
    if (searchKeyword) params.set("keyword", searchKeyword);
    // ✅ rewrites 설정을 사용하므로 상대 경로 "/api" 사용 권장
    return `/api/articles?${params.toString()}`;
  }, [currentPage, sortOrder, searchKeyword]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (data && Array.isArray(data.articles)) {
          setArticles(data.articles);
          const count = Number(data.totalCount ?? data.articles.length);
          setTotalCount(count);
          setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
        }
      } catch (e) {
        setError("서버 연결 실패.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [apiUrl]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleSearch = (keyword) => { setSearchKeyword(keyword); setCurrentPage(1); };
  const handleSearchClear = () => { setSearchKeyword(""); setCurrentPage(1); };
  const handleSortChange = (e) => { setSortOrder(e.target.value); setCurrentPage(1); };

  // ✅ 글쓰기 클릭 핸들러 수정
  const handleWriteClick = () => {
    if (isPending) return; // 로딩 중 클릭 방지

    if (user) {
      // 로그인 된 경우 바로 이동
      router.push("/articles/addArticle");
    } else {
      // ✅ 로그인 안 된 경우: 목적지를 'returnTo' 파라미터로 전달
      // encodeURIComponent를 사용하여 경로를 안전하게 인코딩합니다.
      const destination = encodeURIComponent("/articles/addArticle");
      router.push(`/auth?returnTo=${destination}`);
    }
  };

  return (
    <main className={styles.articlesMain}>
      <section className={styles.articlesSection}>
        <div className={styles.articlesHeader}>
          <h2 className={styles.articlesTitle}>
            게시글 {totalCount > 0 && <span className={styles.articlesCount}>[{totalCount}]</span>}
          </h2>
          <button className={styles.articlesWriteButton} onClick={handleWriteClick}>
            글쓰기
          </button>
        </div>

        <div className={styles.articlesControls}>
          <SearchArticle 
            onSearch={handleSearch} 
            onClear={handleSearchClear}
            onSortChange={handleSortChange}
            sortOrder={sortOrder}
          />
          <select className={`${styles.articlesSortSelect} ${styles.desktopOnly}`} value={sortOrder} onChange={handleSortChange}>
            <option value="recent">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </div>

        <div className={styles.articlesList}>
          {loading ? (
            <ProductSkeleton count={PAGE_SIZE} />
          ) : articles.length === 0 ? (
            <div className={styles.articlesEmptyContainer}>
              <span className={styles.articlesEmptyIcon}>
                <Image 
                  className={styles.articlesEmptyImage}
                  src={IMAGES.ICON_NO_QA} 
                  alt="게시글이 없습니다." 
                  width={100} height={100} 
                />
              </span>
              <p className={styles.articlesEmpty}>등록된 게시글이 없습니다.</p>
            </div>
          ) : (
            articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`} className={styles.articleCard}>
                <div className={styles.articleContent}>
                  <h3 className={styles.articleTitle}>{article.title || "제목 없음"}</h3>
                  <div className={styles.articleRowBottom}>
                    <Image src={IMAGES.ICON_PROFILE} alt="작성자" width={16} height={16} />
                    <span className={styles.articleAuthor}>
                      {article.author?.nickname || `${article.author?.lastName}${article.author?.firstName}`}
                    </span>
                    <span className={styles.articleDate}>{formatDate(article.createdAt)}</span>
                  </div>
                </div>

                <div className={styles.articleMeta}>
                  <div className={styles.articleImageWrapper}>
                    <Image
                      src={normalizeImagePath(article.image) || IMAGES.PRODUCT_DEFAULT}
                      alt={article.title}
                      className={styles.articleImage}
                      width={120} height={80}
                      unoptimized 
                    />
                  </div>
                  <span className={styles.articleLikes}>
                    <Image src={IMAGES.ICON_HEART} alt="좋아요" width={16} height={16} /> {article.favoriteCount || 0}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {totalPages > 0 && (
          <div className={styles.articlesPagination}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </section>
    </main>
  );
}

export default Articles;