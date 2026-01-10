/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // 1. 로컬 및 도커 환경 백엔드 업로드 이미지
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: 'panda-be', port: '4000', pathname: '/uploads/**' },

      // 2. 카카오 프로필 이미지 (http, https 모두 대응)
      { protocol: 'http', hostname: 'k.kakaocdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'k.kakaocdn.net', pathname: '/**' },

      // 3. 구글 프로필 이미지
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // ✅ Docker 서비스 이름인 panda-be를 사용하여 백엔드와 통신합니다.
        destination: 'https://panda-nextjs-be.vercel.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;