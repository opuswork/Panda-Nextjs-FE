// app/profile/page.js

import Header from "@/app/components/Header";
import MyPage from "@/app/components/MyPage";

/**
 * 프로필 페이지 - AuthProvider의 getMe()로 가져온 사용자 정보를 표시
 */
export default async function ProfilePage() {
  // loading.js가 최소 2초 표시되도록 지연
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // initialUser를 null로 전달하면 MyPage 컴포넌트가 AuthProvider의 user를 사용합니다
  return (
    <>
      <Header />
      <MyPage />
    </>
  );
}

