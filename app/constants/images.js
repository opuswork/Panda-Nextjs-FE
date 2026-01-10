export const IMAGES = {
  LOGO_DESKTOP: "/assets/logos/panda_logo.svg",
  LOGO_MOBILE: "/assets/logos/logo-mobile.svg",

  ICON_PROFILE: "/assets/icons/ic_profile.svg",
  ICON_LOGOUT: "/assets/icons/ic_logout.svg",

  PRODUCT_DEFAULT: "/assets/products/default.svg",

// for SearchProduct.jsx
  ICON_SEARCH: "/assets/icons/ic_search.svg",
  ICON_SORT: "/assets/icons/ic_sort.svg",
  NO_RESULT: "/assets/icons/ic_no_qa.svg",

// for Pagination.jsx
  ICON_ARROW_LEFT: "/assets/icons/arrow_left.svg",
  ICON_ARROW_RIGHT: "/assets/icons/arrow_right.svg",

// for Footer.jsx
  LOGO_FACEBOOK: "/assets/logos/facebook-logo.svg",
  LOGO_TWITTER: "/assets/logos/twitter-logo.svg",
  LOGO_YOUTUBE: "/assets/logos/youtube-logo.svg",
  LOGO_INSTAGRAM: "/assets/logos/instagram-logo.svg",

//for Landing.jsx
  BANNER_HOME_01: "/assets/banners/img_home_01.svg",
  BANNER_HOME_02: "/assets/banners/img_home_02.svg",
  BANNER_HOME_03: "/assets/banners/img_home_03.svg",

//for Articles.jsx
  ICON_PROFILE: "/assets/icons/ic_profile.svg",
  ICON_HEART: "/assets/icons/heart-icon.svg",
  ICON_NO_QA: "/assets/icons/ic_no_qa.svg",

// for Articles.jsx & viewArticle.jsx
  ICON_PROFILE: "/assets/icons/ic_profile.svg",
  ICON_HEART: "/assets/icons/heart-icon.svg",
  ICON_BACK: "/assets/icons/ic_back_to_list.svg", // Added
  ICON_KEBAB: "/assets/icons/ic_kebab.svg",        // Added

// for Registration.jsx
  ICON_REGISTRATION: "/assets/products/default.svg",
};

// export를 붙여서 외부에서 쓸 수 있게 합니다.
export const getFullImageUrl = (path, defaultType = 'profile') => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  
  if (!path) {
    // 기본 이미지 경로가 프로젝트 구조에 맞는지 확인하세요!
    return defaultType === 'profile' 
      ? '/assets/icons/MyPage_avatar.svg' 
      : '/assets/icons/ic_profile.svg';
  }
  
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};