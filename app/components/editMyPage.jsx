'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Toast from './Toast';
import styles from './MyPage.module.css';
import { useAuth } from "@/app/contexts/AuthProvider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://panda-nextjs-be.vercel.app';

function EditMyPage({ initialData, profileId }) {
  const router = useRouter();
  const id = profileId;
  const { user, getMe } = useAuth(); // ✅ getMe 함수 추가

  // 1. 상태 관리 분리
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    nickname: initialData.nickname || '',
    email: initialData.email || '',
    phoneNumber: initialData.phoneNumber || '',
    address: initialData.address || '',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(
    initialData.image ? (initialData.image.startsWith('http') ? initialData.image : `${API_BASE_URL}${initialData.image}`) : null
  );
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // ✅ 2. 통합 이벤트 핸들러 (입력값 실시간 업데이트)
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // 비밀번호 필드 처리
    if (['currentPassword', 'newPassword', 'confirmPassword'].includes(name)) {
      setPasswordData(prev => ({ ...prev, [name]: value }));
      return;
    }

    // 이미지 파일 처리
    if (type === 'file' && files?.[0]) {
      const file = files[0];
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: file }));
    } else {
      // 일반 프로필 필드 처리
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
    if (toast.type === 'success' && activeTab === 'profile') {
      // ✅ 페이지 새로고침 대신 router.push 사용 (AuthProvider가 이미 업데이트된 정보를 가지고 있음)
      router.push('/profile');
    }
  };

  // 3. 프로필 정보 수정 제출
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image') {
          if (formData.image instanceof File) dataToSend.append('image', formData.image);
        } else {
          dataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: dataToSend,
      });

      if (!response.ok) throw new Error('수정 중 오류가 발생했습니다.');
      
      // ✅ 프로필 수정 성공 후 사용자 정보 새로고침
      await getMe();
      
      setToast({ visible: true, message: '프로필 정보가 수정되었습니다! ✨', type: 'success' });
    } catch (err) {
      setToast({ visible: true, message: err.message, type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  // ✅ 4. 비밀번호 변경 제출 (최종 수정본)
  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    // 소셜 로그인 유저(google, kakao 등)인지 판별
    const isSocialUser = initialData.provider !== 'local';
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // 유효성 검사 로직 최적화
    if (!newPassword || !confirmPassword) {
      setToast({ visible: true, message: '새 비밀번호를 입력해주세요.', type: 'error' });
      return;
    }

    if (!isSocialUser && !currentPassword) {
      setToast({ visible: true, message: '현재 비밀번호를 입력해주세요.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ visible: true, message: '새 비밀번호가 일치하지 않습니다.', type: 'error' });
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: isSocialUser ? null : currentPassword,
          newPassword
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || '비밀번호 변경 실패');
      }

      setToast({ 
        visible: true, 
        message: '비밀번호가 성공적으로 설정되었습니다! 🔐', 
        type: 'success' 
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setToast({ visible: true, message: err.message, type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.myPageContainer}>
      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      <div className={styles.myPageContent}>
        <div className={styles.userImageSection}>
          <div className={styles.avatarWrapper}>
            <Image src={imagePreview || "/assets/icons/MyPage_avatar.svg"} alt="Avatar" width={300} height={300} className={styles.userAvatar} priority unoptimized />
          </div>
          <div className={styles.uploadImageWrapper}>
            <input type="file" id="image-input" accept="image/*" onChange={handleInputChange} style={{ display: 'none' }} />
            <label htmlFor="image-input" className={styles.uploadButton}>
              <span className={styles.uploadIcon}>+</span>
              <span className={styles.uploadText}>사진 업로드</span>
            </label>
          </div>
        </div>

        <div className={styles.userInfoSection}>
          <div className={styles.userNameContainer}>
            <h1 className={styles.userName}>{formData.nickname || '사용자 편집'}</h1>
            <div className={styles.tabWrapper}>
              <button className={`${styles.tabItem} ${activeTab === 'profile' ? styles.tabActive : ''}`} onClick={() => setActiveTab('profile')}>기본 정보</button>
              <button className={`${styles.tabItem} ${activeTab === 'password' ? styles.tabActive : ''}`} onClick={() => setActiveTab('password')}>비밀번호 변경</button>
            </div>
          </div>

          {activeTab === 'profile' ? (
            <form onSubmit={handleSubmitProfile} className={styles.editForm}>
              <div className={styles.userInfoList}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>닉네임</label>
                  <input className={styles.infoInput} name="nickname" value={formData.nickname} onChange={handleInputChange} />
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>이메일</label>
                  <input className={styles.infoInput} type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>전화번호</label>
                  <input className={styles.infoInput} name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>이름</label>
                  <input className={styles.infoInput} name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>성</label>
                  <input className={styles.infoInput} name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>주소</label>
                  <input className={styles.infoInput} name="address" value={formData.address} onChange={handleInputChange} />
                </div>
              </div>
              <div className={styles.formButtons}>
                <button type="button" onClick={() => router.back()} className={styles.cancelBtn}>취소</button>
                <button type="submit" className={styles.saveBtn} disabled={updating}>
                  {updating ? '저장 중..' : '저장'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitPassword} className={styles.editForm}>
              <div className={styles.userInfoList}>
                {initialData.provider === 'local' ? (
                  <div className={styles.infoItem}>
                    <label className={styles.infoLabel}>현재 비밀번호</label>
                    <input 
                      className={styles.infoInput} 
                      type="password" 
                      name="currentPassword" 
                      value={passwordData.currentPassword} 
                      onChange={handleInputChange} // ✅ 수정됨: handleInputChange 사용
                      placeholder="현재 비밀번호를 입력하세요"
                    />
                  </div>
                ) : (
                  <div className={styles.socialInfoMessage}>
                    <p>💡 소셜 계정으로 로그인 중입니다. 새 비밀번호를 설정하여 관리할 수 있습니다.</p>
                  </div>
                )}
                
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>새 비밀번호</label>
                  <input 
                    className={styles.infoInput} 
                    type="password" 
                    name="newPassword" 
                    value={passwordData.newPassword} 
                    onChange={handleInputChange}
                    placeholder="8자 이상 입력" 
                  />
                </div>

                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>새 비밀번호 확인</label>
                  <input 
                    className={styles.infoInput} 
                    type="password" 
                    name="confirmPassword" 
                    value={passwordData.confirmPassword} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className={styles.formButtons}>
                <button type="button" onClick={() => setActiveTab('profile')} className={styles.cancelBtn}>이전으로</button>
                <button type="submit" className={styles.saveBtn} disabled={updating}>
                  {updating ? '변경 중..' : '비밀번호 변경'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditMyPage;