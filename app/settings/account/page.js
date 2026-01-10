// app/settings/account/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthProvider';
import EditMyPage from '@/app/components/editMyPage'; 
import { AccountSettingsSkeleton } from '@/app/components/Skeleton';

export default function AccountSettingsPage() {
  const { user, isPending } = useAuth();
  
  // ✅ 2초 지연을 위한 상태 관리
  const [showDelay, setShowDelay] = useState(true);

  useEffect(() => {
    // 페이지 접속 후 2초(2000ms) 뒤에 showDelay를 false로 변경
    const timer = setTimeout(() => {
      setShowDelay(false);
    }, 2000);

    return () => clearTimeout(timer); // 언마운트 시 타이머 정리
  }, []);

  // ✅ 실제 로딩 중(isPending)이거나, 2초가 지나지 않았을(showDelay) 때 스켈레톤 표시
  if (isPending || showDelay) {
    return (
      <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
        <AccountSettingsSkeleton />
      </div>
    );
  }

  // 로그인 체크 (2초 뒤에 유저 정보가 없으면 로그인 페이지로)
  if (!user) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <p>로그인이 필요한 서비스입니다.</p>
        <a href="/auth/login" style={{ color: '#3B82F6', textDecoration: 'underline' }}>
          로그인하러 가기
        </a>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '20px 0' }}>
      <EditMyPage initialData={user} profileId={user.id} />
    </div>
  );
}