// app/articles/[id]/page.js

import Header from "@/app/components/Header";
import ViewArticle from "@/app/components/viewArticle";
import { notFound } from "next/navigation";

/**
 * 💡 서버 측 데이터 페칭 함수
 */
async function getArticleData(id) {
  /**
   * 서버 컴포넌트는 Docker 컨테이너 내부에서 실행됩니다.
   * 컨테이너끼리 통신할 때는 서비스 이름인 'panda-be'를 호스트로 사용해야 합니다.
   */
  const API_BASE = 'https://panda-nextjs-be.vercel.app'; 

  console.log(`[Server Fetch] Requesting: ${API_BASE}/api/articles/${id}`);

  try {
    const [resArticle, resComments] = await Promise.all([
      fetch(`${API_BASE}/api/articles/${id}`, { 
        cache: 'no-store', // 실시간 데이터 반영을 위해 캐시 무시
      }),
      fetch(`${API_BASE}/api/articles/${id}/comments`, { 
        cache: 'no-store',
      })
    ]);

    // 게시글이 없으면 null 반환 -> 404 페이지 트리거
    if (!resArticle.ok) {
      console.error(`[Fetch Failed] Status: ${resArticle.status}`);
      return null;
    }

    const article = await resArticle.json();
    const comments = resComments.ok ? await resComments.json() : [];
    
    return { article, comments };
  } catch (error) {
    // 💡 ECONNREFUSED 에러가 발생하면 여기서 로그가 찍힙니다.
    console.error("[getArticleData] Fetch failed:", error.message);
    return null;
  }
}

/**
 * 페이지 컴포넌트 (반드시 export default여야 합니다)
 */
export default async function ViewArticlePage({ params }) {
  // Next.js 15+ 대응: params를 await 합니다.
  const { id } = await params;

  // 서버에서 데이터 로드 (이 동안 loading.js가 화면에 보입니다)
  const data = await getArticleData(id);

  // 데이터를 가져오지 못했다면 Next.js의 404 페이지(notFound)를 보여줍니다.
  if (!data) {
    return notFound();
  }

  return (
    <>
      <Header />
      {/* 클라이언트 컴포넌트인 ViewArticle에 서버에서 받은 데이터를 props로 전달 */}
      <ViewArticle 
        initialArticle={data.article} 
        initialComments={data.comments} 
      />
    </>
  );
}