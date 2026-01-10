'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthProvider';
import { MyPageSkeleton } from '@/app/components/Skeleton'; // ✅ 스켈레톤 임포트
import styles from './MyPage.module.css';
import MyActivity from './MyActivity';

const normalizeImagePath = (imagePath, updatedAt) => {
  if (!imagePath || imagePath === 'undefined') return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';
  let fullPath = imagePath;
  if (!imagePath.startsWith("http")) {
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    fullPath = `${baseUrl}${cleanPath}`;
  }
  const timestamp = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  return `${fullPath}?v=${timestamp}`;
};

function MyPage({ initialUser = null }) {
  const router = useRouter();
  const { user: authUser, isPending } = useAuth(false);
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    } else if (initialUser) {
      setUser(initialUser);
    }
  }, [authUser, initialUser]);

  // ✅ 1. 로딩 중일 때 스켈레톤 표시
  if (isPending) {
    return <MyPageSkeleton />;
  }

  // ✅ 2. 로그인 정보가 없을 때 (가드 로직)
  if (!user) {
    return (
      <div className={styles.myPageContainer}>
        <div className={styles.errorMessage}>
          로그인이 필요합니다.
          <button onClick={() => router.push('/auth/login')} className={styles.loginLink}>
            로그인 하러가기
          </button>
        </div>
      </div>
    );
  }

  const DEFAULT_AVATAR = "/assets/icons/MyPage_avatar.svg";
  const userProfileImage = normalizeImagePath(user.image, user.updatedAt);

  return (
    <div className={styles.myPageContainer}>
      <div className={styles.myPageContent}>
        {/* 이미지 섹션 */}
        <div className={styles.userImageSection}>
          <div className={styles.avatarWrapper}>
            <Image
              src={userProfileImage || DEFAULT_AVATAR}
              alt="User Avatar"
              width={300}
              height={300}
              className={styles.userAvatar}
              priority
              unoptimized
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
            />
          </div>
        </div>

        {/* 정보 섹션 */}
        <div className={styles.userInfoSection}>
          <div className={styles.userNameContainer}>
            <h1 className={styles.userName}>
              {user.nickname || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '사용자'}
            </h1>
            
            {/* ✅ [정보수정] 버튼 클릭 시 /profile/[id]로 이동 (여기서 비밀번호 수정 가능) */}
            {user.id && (
              <button 
                className={styles.editButton}
                onClick={() => router.push(`/profile/${user.id}`)}
              >
                정보수정
              </button>
            )}
          </div>

          <div className={styles.userInfoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>닉네임:</span>
              <span className={styles.infoValue}>{user.nickname || '미입력'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>이메일:</span>
              <span className={styles.infoValue}>{user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>로그인 경로:</span>
              <span className={styles.infoValue}>{user.provider === 'google' ? '구글 로그인' : '일반 로그인'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>전화번호:</span>
              <span className={styles.infoValue}>{user.phoneNumber || '미입력'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>주소:</span>
              <span className={styles.infoValue}>{user.address || '미입력'}</span>
            </div>
          </div>
          
          <MyActivity />
        </div>
      </div>
    </div>
  );
}

export default MyPage;