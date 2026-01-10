// app/products/[id]/page.js
import ProductDetail from "@/app/components/ProductDetail";
import { getProduct } from "@/app/lib/api";
import { notFound } from "next/navigation";

// app/products/[id]/page.js

export default async function ProductPage({ params }) {
  const { id } = await params;

  // 💡 Docker 내부(서버사이드)에서 접근할 때는 서비스 이름인 panda-be를 사용합니다.
  // 클라이언트(브라우저)에서 접근할 때는 기존 환경변수를 사용합니다.
  const API_URL = "http://panda-be:4000"; 

  try {
    // 1. 상품 정보 가져오기
    const productRes = await fetch(`${API_URL}/api/products/${id}`, { cache: 'no-store' });
    if (!productRes.ok) throw new Error('상품을 찾을 수 없습니다.');
    const product = await productRes.json();

    // 2. 상품 문의 가져오기 (필터링 문제 해결의 핵심!)
    const qnaRes = await fetch(`${API_URL}/api/products/${id}/comments`, { cache: 'no-store' });
    if (!qnaRes.ok) throw new Error('문의 내역을 가져올 수 없습니다.');
    const initialQnas = await qnaRes.json();

    return (
      <ProductDetail 
        product={product} 
        initialQnas={initialQnas} 
      />
    );
  } catch (error) {
    console.error("데이터 페칭 에러:", error);
    return <div>에러 발생: {error.message}</div>;
  }
}