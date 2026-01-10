import Header from "@/app/components/Header";
import AddArticle from "@/app/components/addArticle";

export default async function AddArticlePage() {
  
  /**
   * 💡 테스트 팁: 
   * 로딩 스피너(loading.js)가 너무 빨리 지나가서 확인이 어렵다면 
   * 아래 주석을 해제하여 인위적인 지연을 줄 수 있습니다.
   */
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기

  return (
    <>
      <Header />
      <AddArticle />
    </>
  );
}