// 모바일 9:16 (1080x1920) 프로모션 영상용 스타일 정의

// 캔버스 크기
export const canvas = {
  width: 1080,
  height: 1920,
};

// 색상 팔레트 (4K 버전과 동일)
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

// 모바일 9:16 기준 폰트 사이즈 (가독성 확보)
export const fontSize = {
  xs: 14,
  sm: 18,
  base: 22,
  lg: 28,
  xl: 36,
  '2xl': 48,
  '3xl': 60,
  '4xl': 80,
  '5xl': 100,
  hero: 72,  // 세로 화면에 맞게 축소
};

// 모바일 디바이스 프레임 (화면 내 표시용)
export const mobile = {
  width: 320,
  height: 640,
  frameWidth: 340,
  frameHeight: 680,
  borderRadius: 40,
  notchWidth: 100,
  notchHeight: 28,
};

// 간격 (모바일 기준)
export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 60,
  '2xl': 80,
  '3xl': 120,
};

// 섹션 레이아웃
export const layout = {
  // 좌우 패딩
  padding: 60,
  // 콘텐츠 간 간격
  gap: 40,
  // 안전 영역 (상하)
  safeTop: 100,
  safeBottom: 100,
};

// 카드 크기 (세로 배치용)
export const card = {
  width: 900,  // 거의 전체 너비
  height: 200,
  radius: 24,
};

// 알림 카드
export const notification = {
  width: 900,
  height: 160,
  radius: 20,
};
