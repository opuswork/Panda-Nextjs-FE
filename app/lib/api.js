// app/lib/api.js

const getBaseUrl = () => {
  // 1. 브라우저 환경(window가 존재)일 때는 그대로 localhost 사용
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  }

  // 2. 서버 환경(Next.js 서버 컴포넌트)일 때는 Docker 서비스 이름 사용
  // docker-compose.yml에 적힌 백엔드 서비스 이름이 'panda-be'라고 가정합니다.
  return "http://panda-be:4000"; 
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