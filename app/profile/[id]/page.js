// app/profile/[id]/page.js

import Header from "@/app/components/Header";
import EditMyPage from "@/app/components/editMyPage";
import { notFound } from "next/navigation";

/**
 * 사용자 정보 가져오기 함수
 */
async function getUserData(id) {
  const API_BASE = 'http://panda-be:4000';
  
  try {
    const response = await fetch(`${API_BASE}/api/users/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error("[getUserData] Fetch failed:", error.message);
    return null;
  }
}

/**
 * 프로필 편집 페이지
 */
export default async function EditProfilePage({ params }) {
  const { id } = await params;

  // loading.js가 최소 2초 표시되도록 지연
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 사용자 데이터 가져오기
  const user = await getUserData(id);
  
  if (!user) {
    return notFound();
  }

  return (
    <>
      <Header />
      <EditMyPage initialData={user} profileId={id} />
    </>
  );
}

