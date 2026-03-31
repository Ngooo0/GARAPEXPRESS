// ============================================
// COLORS - Palette complète GarapExpress
// ============================================

export const colors = {
  // Primary - Vert médical GarapExpress
  primary: '#127b05',
  primaryLight: '#34CF8E',
  primaryDark: '#0A5A04',
  primaryExtraLight: '#E8F2E9',
  
  // Secondary - Bleu doux
  secondary: '#3B82F6',
  secondaryLight: '#60A5FA',
  secondaryDark: '#1D4ED8',
  secondaryExtraLight: '#EFF6FF',
  
  // Backgrounds
  background: '#F8F9FB',
  backgroundSecondary: '#F1F5F9',
  backgroundTertiary: '#E2E8F0',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  
  // Text
  text: '#1F2937',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textLight: '#FFFFFF',
  textInverse: '#1F2937',
  
  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',
  
  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Order Status (like Uber Eats/Glovo)
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
  
  // Pharmacy specific
  pharmacyGreen: '#127b05',
  onDutyBadge: '#F59E0B',
};

export type ColorKeys = keyof typeof colors;