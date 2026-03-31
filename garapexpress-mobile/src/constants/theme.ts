// ============================================
// GARAPEXPRESS DESIGN SYSTEM
// Inspired by Uber Eats, Glovo, Doctolib, Jumia
// ============================================

export const colors = {
  // Primary - Medical Green
  primary: '#127b05',
  primaryLight: '#34CF8E',
  primaryDark: '#0A5A04',
  primaryExtraLight: '#E8F2E9',

  // Secondary - Blue
  secondary: '#3B82F6',
  secondaryLight: '#60A5FA',
  secondaryDark: '#1D4ED8',
  secondaryExtraLight: '#EFF6FF',

  // Backgrounds
  background: '#F8F9FB',
  backgroundSecondary: '#F1F5F9',
  card: '#FFFFFF',
  surface: '#FFFFFF',

  // Text
  text: '#1F2937',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textLight: '#FFFFFF',
  textInverse: '#1F2937',

  // Border
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',

  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Order Status
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  preparing: '#8B5CF6',
  ready: '#10B981',
  delivering: '#127b05',
  delivered: '#10B981',
  cancelled: '#EF4444',

  // Misc
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

export const fontSize = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  title: 32,
  hero: 40,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const layout = {
  screenPadding: 16,
  cardPadding: 16,
  itemSpacing: 8,
  sectionSpacing: 24,
  inputHeight: 52,
  buttonHeight: 52,
  iconSize: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
};

export const typography = {
  h1: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, lineHeight: 36 },
  h2: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, lineHeight: 30 },
  h3: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, lineHeight: 26 },
  h4: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, lineHeight: 24 },
  body: { fontSize: fontSize.md, fontWeight: fontWeight.regular, lineHeight: 22 },
  bodyMedium: { fontSize: fontSize.md, fontWeight: fontWeight.medium, lineHeight: 22 },
  small: { fontSize: fontSize.sm, fontWeight: fontWeight.regular, lineHeight: 20 },
  caption: { fontSize: fontSize.xs, fontWeight: fontWeight.regular, lineHeight: 16 },
};

export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
};
