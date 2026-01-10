// app/products/[id]/edit/page.js
import Header from "@/app/components/Header";
import EditProductInfo from "@/app/components/editProductInfo";
import { getProduct } from "@/app/lib/api";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }) {
  // Next.js 15+ 규격: params를 await 합니다.
  const { id } = await params;

  try {
    // 💡 서버에서 데이터를 미리 가져옵니다. 
    // 이 작업이 끝날 때까지 loading.js의 Skeleton이 화면에 보입니다.
    const product = await getProduct(id);

    if (!product) return notFound();

    return (
      <>
        <Header />
        {/* 💡 불러온 데이터를 props로 전달합니다. */}
        <EditProductInfo initialProduct={product} productId={id} />
      </>
    );
  } catch (error) {
    console.error("수정 페이지 데이터 로드 실패:", error);
    throw error;
  }
}