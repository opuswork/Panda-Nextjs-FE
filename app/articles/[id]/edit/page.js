// app/articles/[id]/edit/page.js
import Header from "@/app/components/Header";
import EditArticle from "@/app/components/editArticle";
import { notFound } from "next/navigation";

// 서버 측 데이터 페칭 함수
async function getArticleData(id) {
  // Docker 내부 통신 주소 사용
  const API_BASE = 'https://panda-nextjs-be.vercel.app'; 
  
  try {
    const res = await fetch(`${API_BASE}/api/articles/${id}`, { 
      cache: 'no-store' 
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("[Edit Page] Fetch Error:", error);
    return null;
  }
}

export default async function EditArticlePage({ params }) {
  const { id } = await params;
  
  // 데이터를 가져오는 동안 loading.js가 트리거됩니다.
  const article = await getArticleData(id);

  if (!article) return notFound();

  return (
    <>
      <Header />
      {/* 초기 데이터를 클라이언트 컴포넌트로 전달 */}
      <EditArticle initialData={article} />
    </>
  );
}