
// app/products/page.js
import Header from "@/app/components/Header";
import SecondHandMarket from "@/app/components/SecondHandMarket";

// 💡 searchParams를 인자로 받아 페이지, 정렬, 검색어를 서버에서 처리합니다.
export default async function Products({ searchParams }) {
  // Next.js 15+ 규격: params와 searchParams는 await해야 합니다.
  const sParams = await searchParams;
  
  const page = sParams.page || "1";
  const orderBy = sParams.orderBy || "recent";
  const keyword = sParams.keyword || "";

  // 💡 Docker 내부망 주소 사용 (Server-side fetch 전용)
  const baseUrl = "https://panda-nextjs-be.vercel.app";
  
  // URL 생성 및 쿼리스트링 조립
  const url = new URL(`${baseUrl}/api/products`);
  url.searchParams.set("page", page);
  url.searchParams.set("pageSize", "10");
  url.searchParams.set("orderBy", orderBy);
  if (keyword) url.searchParams.set("keyword", keyword);

  let initialData = { items: [], pagination: { total: 0 } };

  try {
    const response = await fetch(url.toString(), { 
      cache: 'no-store' // 매번 최신 데이터를 가져와서 Skeleton이 잘 작동하도록 설정
    });
    
    if (response.ok) {
      const data = await response.json();
      // ✅ API 응답 구조에 맞게 할당 (data.items)
      initialData = {
        items: data.items || [],
        pagination: data.pagination || { total: 0 }
      };
    }
  } catch (error) {
    console.error('[Server Page] Fetch failed:', error.message);
  }

  return (
    <>
      {/* 💡 초기 데이터와 현재 파라미터를 컴포넌트에 넘겨줍니다. */}
      <SecondHandMarket 
        initialData={initialData} 
        initialParams={{ page, orderBy, keyword }} 
      />
    </>
  );
}