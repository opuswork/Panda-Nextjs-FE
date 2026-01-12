// app/loading.js
import Spinner from "@/app/components/Loading"; 

export default function Loading() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', // 화면 전체 높이에 맞춰 중앙 정렬
      width: '100%'
    }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner />
        <p style={{ marginTop: '20px', color: '#666' }}>페이지를 불러오는 중입니다...</p>
      </div>
    </div>
  );
}
