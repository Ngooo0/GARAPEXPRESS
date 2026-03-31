// ============================================
// TYPOGRAPHY - Hiérarchie des textes
// ============================================

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

// Headings
export const typography = {
  h1: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: 36,
  },
  h2: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: 30,
  },
  h3: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: 26,
  },
  h4: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: 24,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    lineHeight: 22,
  },
  small: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: 20,
  },
  smallMedium: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: 20,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: 16,
  },
  captionMedium: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: 16,
  },
};

export default {
  fontSize,
  fontWeight,
  typography,
};