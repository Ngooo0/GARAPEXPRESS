// ============================================
// SHADOWS - Ombres pour iOS et Android
// ============================================

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

// ============================================
// LAYOUT - Valeurs communes
// ============================================

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

// ============================================
// ANIMATION Durées
// ============================================

export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
};

export default {
  shadows,
  layout,
  animation,
};