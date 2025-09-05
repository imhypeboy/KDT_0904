/**
 * 애플리케이션 전역 설정
 */

export const APP_CONFIG = {
  // 애플리케이션 정보
  name: '의료영상뷰어',
  version: '1.0.0',
  shortName: '의',
  
  // 썸네일 설정
  thumbnail: {
    visibleCount: 4,
    size: {
      width: 64,
      height: 64,
    },
    scrollStep: 80,
  },
  
  // 뷰어 기본 설정
  viewer: {
    defaultZoom: 100,
    defaultBrightness: 100,
    defaultContrast: 100,
    defaultRotation: 0,
    zoomStep: 10,
    rotationStep: 90,
  },
  
  // DICOM 설정
  dicom: {
    loaders: {
      wadouri: 'wadouri',
      wadors: 'wadors',
      dicomfile: 'dicomfile',
    },
    imageFormats: ['.dcm', '.dicom'],
  },
  
  // 네비게이션 메뉴
  navigation: [
    { key: 'home', label: '홈', path: '/main' },
    { key: 'search', label: '환자 검색', path: '/search' },
    { key: 'user-management', label: '회원 관리', path: '/user-management' },
  ],
  
  // 사이드바 메뉴
  sidebar: [
    { key: 'viewer', label: '홈', icon: 'FolderOpen' },
    { key: 'search', label: '환자 검색', icon: 'Search' },
    { key: 'user-management', label: '회원 관리', icon: 'User' },
  ],
} as const;

export type NavigationKey = typeof APP_CONFIG.navigation[number]['key'];
export type SidebarKey = typeof APP_CONFIG.sidebar[number]['key'];
