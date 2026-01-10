// app/auth/loading.js
import Spinner from "@/app/components/Loading"; 

export default function AuthLoading() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh', // 화면 높이에 맞춰 중앙 정렬
      width: '100%'
    }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner />
        <p style={{ marginTop: '20px', color: '#666' }}>로그인 페이지로 이동 중입니다...</p>
      </div>
    </div>
  );
}