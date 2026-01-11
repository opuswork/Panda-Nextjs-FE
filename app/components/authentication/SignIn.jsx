'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthProvider';
import { useGoogleLogin } from '@react-oauth/google'; // ✅ 이제 실제로 사용합니다.
import styles from './signIn.module.css';

export default function SignIn({ returnTo: propsReturnTo }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const getDestination = () => propsReturnTo || searchParams.get('returnTo') || '/products';
  
  /**
   * ✅ 라이브러리 기능을 이용한 구글, 카카오오 로그인 설정
   * ux_mode: 'redirect'를 설정하면 팝업 대신 페이지가 전환됩니다.
   */
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const API_BASE_URL = 'https://panda-nextjs-be.vercel.app';
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&redirect_uri=${API_BASE_URL}/api/auth/kakao/callback&response_type=code`;

  // ✅ useGoogleLogin 훅은 항상 호출해야 합니다 (React 훅 규칙)
  // client_id는 반드시 필요하므로, 없으면 훅이 에러를 던집니다.
  // 명시적으로 client_id를 전달하거나, context에서 가져올 수 있습니다.
  // client_id가 없으면 빈 문자열을 전달하되, 실제 사용 시 에러가 발생할 수 있습니다.
  const handleGoogleLogin = useGoogleLogin({
    client_id: googleClientId || '', // ✅ client_id 명시적으로 전달 (없으면 빈 문자열)
    flow: 'auth-code', // 백엔드에서 코드를 받아 처리하는 방식
    ux_mode: 'redirect', // 🚀 팝업이 아닌 리디렉션(페이지 전환) 방식 설정
    redirect_uri: `${API_BASE_URL}/api/auth/google/callback`,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    let valid = true;
    if (!email) { setEmailError('이메일을 입력해주세요.'); valid = false; }
    if (!password) { setPasswordError('비밀번호를 입력해주세요.'); valid = false; }
    if (!valid) return;

    setLoading(true);
    try {
      await login({ email, password, redirectTo: getDestination() });
    } catch (err) {
      setGeneralError(err?.message || '이메일 또는 비밀번호가 일치하지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image src="/assets/logos/panda_logo-login.svg" alt="판다마켓" width={153} height={40} className={styles.logoImage} priority />
        </Link>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* 이메일/비밀번호 입력 섹션 (기존과 동일) */}
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>이메일</label>
          <input id="email" type="email" placeholder="이메일을 입력하세요." value={email} onChange={(e) => setEmail(e.target.value)} className={`${styles.inputField} ${emailError ? styles.inputError : ''}`} />
          <div className={`${styles.errorMessage} ${emailError ? styles.showError : ''}`}>{emailError}</div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>비밀번호</label>
          <div className={styles.inputPWD}>
            <input id="password" type={showPassword ? 'text' : 'password'} placeholder="비밀번호를 입력하세요." value={password} onChange={(e) => setPassword(e.target.value)} className={`${styles.inputField} ${passwordError ? styles.inputError : ''}`} />
            <button type="button" className={styles.faEye} onClick={togglePasswordVisibility}>
              <Image src={showPassword ? '/assets/icons/eye-open.svg' : '/assets/icons/eye-closed.svg'} alt="비밀번호 표시 변경" width={24} height={24} />
            </button>
          </div>
          <div className={`${styles.errorMessage} ${passwordError ? styles.showError : ''}`}>{passwordError}</div>
        </div>

        {generalError && <div className={styles.generalErrorMessage}>{generalError}</div>}
        <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? '처리 중...' : '로그인'}</button>
      </form>

      <div className={styles.socialLogin}>
        <p>간편 로그인하기</p>
        <div className={styles.socialLoginButton}>
          {/* ✅ client_id가 있을 때만 Google 로그인 버튼 표시 및 함수 호출 */}
          {googleClientId ? (
            <button 
              type="button" 
              onClick={() => {
                if (googleClientId) {
                  handleGoogleLogin();
                } else {
                  console.error('Google Client ID가 설정되지 않았습니다.');
                  alert('Google 로그인을 사용할 수 없습니다. NEXT_PUBLIC_GOOGLE_CLIENT_ID 환경 변수를 확인해주세요.');
                }
              }} 
              className={styles.iconButton}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Image src="/assets/icons/google_button.svg" alt="구글 로그인" width={42} height={42} />
            </button>
          ) : null}
          
          <button type="button" onClick={() => router.push(KAKAO_AUTH_URL)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Image src="/assets/icons/kakao-button.svg" alt="카카오 로그인" width={42} height={42} />
          </button>
        </div>
      </div>

      <div className={styles.membership}>
        판다마켓이 처음이신가요? <Link href="/signup">회원가입</Link>
      </div>
    </div>
  );
}