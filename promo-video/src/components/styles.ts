// 4K (3840x2160) 프로모션 영상용 스타일 정의

// 캔버스 크기
export const canvas = {
  width: 3840,
  height: 2160,
};

// 색상 팔레트
export const colors = {
  // 배경
  bgDark: '#0f172a',
  bgLight: '#f8fafc',

  // 와이어프레임
  wireframe: '#e2e8f0',
  wireframeDark: '#cbd5e1',

  // 텍스트
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  white: '#ffffff',

  // 브랜드
  primary: '#3b82f6',
  primaryLight: '#dbeafe',
  purple: '#8b5cf6',
  purpleLight: '#ede9fe',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',

  // 카카오
  kakao: '#FEE500',
  kakaoDark: '#000000',

  // 텔레그램
  telegram: '#0088cc',

  // 디바이스
  deviceFrame: '#1f2937',
  deviceScreen: '#ffffff',
  browserBar: '#374151',
};

// 폰트
export const fonts = {
  main: 'Noto Sans KR',
};

// 4K 기준 폰트 사이즈
export const fontSize = {
  xs: 28,
  sm: 36,
  base: 44,
  lg: 56,
  xl: 72,
  '2xl': 96,
  '3xl': 120,
  '4xl': 160,
  '5xl': 200,
  hero: 280,
};

// 모바일 디바이스 (4K 기준 스케일)
export const mobile = {
  width: 520,
  height: 1120,
  frameWidth: 560,
  frameHeight: 1180,
  borderRadius: 70,
  notchWidth: 180,
  notchHeight: 48,
};

// PC 브라우저 (4K 기준)
export const desktop = {
  width: 2400,
  height: 1400,
  frameWidth: 2480,
  frameHeight: 1500,
  borderRadius: 24,
  toolbarHeight: 70,
};

// 간격 (4K 기준)
export const spacing = {
  xs: 16,
  sm: 32,
  md: 48,
  lg: 80,
  xl: 120,
  '2xl': 160,
  '3xl': 240,
};

// 섹션 레이아웃
export const layout = {
  // 좌우 패딩
  padding: 200,
  // 콘텐츠 간 간격
  gap: 120,
};
