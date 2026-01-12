// Panda-Nextjs-FE/app/layout.js
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { AuthProvider } from "@/app/contexts/AuthProvider";
import { GoogleOAuthProvider } from "@react-oauth/google"; // ✅ 추가

export const metadata = {
  title: "판다마켓 - 중고거래의 새로운 기준",
  description: "판다마켓에서 쉽고 빠르게 중고 물건을 사고 팔아보세요.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  // .env 파일에 등록된 클라이언트 ID를 가져옵니다.
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // ✅ clientId가 없으면 경고를 표시합니다.
  if (!googleClientId) {
    console.error('❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID가 설정되지 않았습니다. .env.local 파일에 NEXT_PUBLIC_GOOGLE_CLIENT_ID를 추가해주세요.');
  }

  return (
    <html lang="ko" style={{ backgroundColor: '#fafafa' }}>
      <body style={{ backgroundColor: '#fafafa' }}>
        {/* ✅ GoogleOAuthProvider는 항상 렌더링하여 useGoogleLogin 훅이 context를 찾을 수 있도록 합니다.
            clientId가 없으면 빈 문자열을 사용하되, 실제 로그인은 작동하지 않습니다. */}
        <GoogleOAuthProvider clientId={googleClientId || ''}>
          <AuthProvider>
            <div id="layout-wrapper" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '100vh' 
            }}>
              <Header />
              
              <main style={{ 
                flex: '1', 
                width: '100%', 
                margin: '0 auto' 
              }}> 
                {children}
              </main>
              
              <Footer />
            </div>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}