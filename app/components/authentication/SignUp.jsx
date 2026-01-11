// app/components/authentication/SignUp.jsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./signUp.module.css";
import { useAuth } from '@/app/contexts/AuthProvider';
import { useGoogleLogin } from '@react-oauth/google'; // ✅ 이제 실제로 사용합니다.


export default function SignUp() {
  const router = useRouter();
  const { register } = useAuth(false);

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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nickname: "",
    password: "",
    passwordConfirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePassword = () => setShowPassword((p) => !p);
  const togglePasswordConfirm = () => setShowPasswordConfirm((p) => !p);

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "성을 입력해주세요.";
    if (!formData.lastName.trim()) newErrors.lastName = "이름을 입력해주세요.";
    if (!formData.email.trim()) newErrors.email = "이메일을 입력해주세요.";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "전화번호를 입력해주세요.";
    if (!formData.nickname.trim()) newErrors.nickname = "닉네임을 입력해주세요.";
    if (!formData.password) newErrors.password = "비밀번호를 입력해주세요.";

    if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validate()) return;

    setLoading(true);
    try {
      // ✅ Send PLAIN password (backend will bcrypt.hash it)
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        nickname: formData.nickname.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `회원가입 실패 (HTTP ${res.status})`);
      }

      alert("회원가입이 완료되었습니다!");
      router.push("/auth");
    } catch (err) {
      console.error("SignUp Error:", err);
      setGeneralError(err?.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image
            src="/assets/logos/panda_logo-login.svg"
            alt="판다마켓"
            width={153}
            height={40}
            loading="eager"
          />
        </Link>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Name Row */}
        <div className={styles.nameRow}>
          <div className={styles.halfInput}>
            <label htmlFor="lastName" className={styles.label}>
              성
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="성"
              value={formData.lastName}
              onChange={handleChange}
              className={`${styles.inputField} ${errors.lastName ? styles.inputError : ""}`}
            />
            <div className={`${styles.errorMessage} ${errors.lastName ? styles.showError : ""}`}>
                {errors.lastName}
            </div>
          </div>

          <div className={styles.halfInput}>
            <label htmlFor="firstName" className={styles.label}>
              이름  
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="이름"
              value={formData.firstName}
              onChange={handleChange}
              className={`${styles.inputField} ${errors.firstName ? styles.inputError : ""}`}
            />
            <div className={`${styles.errorMessage} ${errors.firstName ? styles.showError : ""}`}>
              {errors.lastName}
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={styles.label}>
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={formData.email}
            onChange={handleChange}
            className={`${styles.inputField} ${errors.email ? styles.inputError : ""}`}
          />
          <div className={`${styles.errorMessage} ${errors.email ? styles.showError : ""}`}>
            {errors.email}
          </div>
        </div>

        <div>
          <label htmlFor="phoneNumber" className={styles.label}>
            전화번호
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="전화번호를 입력하세요"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`${styles.inputField} ${errors.phoneNumber ? styles.inputError : ""}`}
          />
          <div className={`${styles.errorMessage} ${errors.phoneNumber ? styles.showError : ""}`}>
            {errors.phoneNumber}
          </div>
        </div>

        {/* Nickname */}
        <div>
          <label htmlFor="nickname" className={styles.label}>
            닉네임
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            placeholder="닉네임을 입력하세요"
            value={formData.nickname}
            onChange={handleChange}
            className={`${styles.inputField} ${errors.nickname ? styles.inputError : ""}`}
          />
          <div className={`${styles.errorMessage} ${errors.nickname ? styles.showError : ""}`}>
            {errors.nickname}
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className={styles.label}>
            비밀번호
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.inputField} ${errors.password ? styles.inputError : ""}`}
            />
            <Image
              src={showPassword ? "/assets/icons/eye-open.svg" : "/assets/icons/eye-closed.svg"}
              alt="toggle"
              width={24}
              height={24}
              className={styles.eyeIcon}
              onClick={togglePassword}
            />
          </div>
          <div className={`${styles.errorMessage} ${errors.password ? styles.showError : ""}`}>
            {errors.password}
          </div>
        </div>

        {/* Password Confirm */}
        <div>
          <label htmlFor="passwordConfirmation" className={styles.label}>
            비밀번호 확인
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirmation}
              onChange={handleChange}
              className={`${styles.inputField} ${errors.passwordConfirmation ? styles.inputError : ""}`}
            />
            <Image
              src={showPasswordConfirm ? "/assets/icons/eye-open.svg" : "/assets/icons/eye-closed.svg"}
              alt="toggle"
              width={24}
              height={24}
              className={styles.eyeIcon}
              onClick={togglePasswordConfirm}
            />
          </div>
          <div
            className={`${styles.errorMessage} ${
              errors.passwordConfirmation ? styles.showError : ""
            }`}
          >
            {errors.passwordConfirmation}
          </div>
        </div>

        {/* General Error */}
        {generalError && (
          <div style={{ color: "#ef4444", marginBottom: 10, textAlign: "center", fontWeight: "bold" }}>
            {generalError}
          </div>
        )}

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <div className={styles.socialLogin}>
        간편 로그인하기
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
        이미 회원이신가요? <Link href="/auth">로그인</Link>
      </div>
    </main>
  );
}
