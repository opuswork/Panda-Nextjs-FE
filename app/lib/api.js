// app/lib/api.js

const getBaseUrl = () => {
  // 1. 우선적으로 환경 변수(NEXT_PUBLIC_API_BASE_URL)를 확인합니다.
  // Netlify나 Vercel 대시보드에 등록한 값이 있다면 그 값이 사용됩니다.
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 2. 환경 변수가 없을 경우의 기본값(Fallback) 설정
  // 배포된 백엔드 주소를 직접 적어주면 가장 확실합니다.
  return "https://panda-nextjs-be.vercel.app";
};

const BASE = getBaseUrl();

export async function apiFetch(path, options = {}) {
  const url = `${BASE}${path}`;

  // credentials는 항상 "include"로 설정하여 쿠키를 포함
  const fetchOptions = {
    ...options,
    credentials: "include", // 항상 include로 설정
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  console.log(`[apiFetch] ${options.method || 'GET'} ${url}`, {
    credentials: fetchOptions.credentials,
    hasBody: !!fetchOptions.body
  });

  const res = await fetch(url, fetchOptions);

  // 응답 헤더에서 Set-Cookie 확인 (디버그용)
  // Set-Cookie가 없는 것은 정상일 수 있습니다 (이미 로그인된 경우 등)
  const setCookieHeader = res.headers.get('set-cookie');
  if (setCookieHeader) {
    console.log(`[apiFetch] Set-Cookie received:`, setCookieHeader);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let errorMessage = text || res.statusText;
    
    // JSON 응답인 경우 파싱 시도
    try {
      const jsonError = JSON.parse(text);
      errorMessage = jsonError.message || errorMessage;
    } catch (e) {
      // JSON이 아니면 그대로 사용
    }
    
    const error = new Error(`API ${res.status}: ${errorMessage}`);
    error.status = res.status;
    error.response = text;
    throw error;
  }

  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

/**
 * NEW: Product specific functions using your apiFetch wrapper
 */

// GET: Single product
export async function getProduct(id) {
  return apiFetch(`/api/products/${id}`);
}

// PATCH: Update product
export async function updateProduct(id, data) {
  return apiFetch(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// DELETE: Remove product
export async function deleteProduct(id) {
  return apiFetch(`/api/products/${id}`, {
    method: "DELETE",
  });
}