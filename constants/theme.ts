import { TextStyle } from 'react-native';

// HB+ brand colors — extracted from hbplus.fit
export const Colors = {
  primary: '#9F4022',
  primaryHover: '#B35A3A',
  primary70: '#C16B4D',
  primary80: '#D79A84',
  primary90: '#EAD8D1',
  secondary: '#1A1A1A',
  tertiary: '#E5E7EB',
  neutral: '#FFFFFF',
  surface: '#F7F3EA',
  onSurface: '#1A1A1A',
  error: '#C0392B',
} as const;

// Font family names — these must match the keys used in useFonts()
export const Fonts = {
  serifBold: 'PlayfairDisplay_700Bold',
  sansMedium: 'DMSans_500Medium',
  sansRegular: 'DMSans_400Regular',
  sansSemiBold: 'DMSans_600SemiBold',
  sansBold: 'DMSans_700Bold',
} as const;

// Typography presets — maps to the HB+ design system
// The Seasons Bold → Playfair Display 700 Bold
// Gilroy-Medium   → DM Sans 500 Medium
export const Typography: Record<string, TextStyle> = {
  headlineDisplay: {
    fontFamily: Fonts.serifBold,
    fontSize: 75,
    lineHeight: 90,
    letterSpacing: -0.75,
  },
  headlineLg: {
    fontFamily: Fonts.serifBold,
    fontSize: 51,
    lineHeight: 61,
    letterSpacing: -0.35,
  },
  headlineMd: {
    fontFamily: Fonts.sansMedium,
    fontSize: 35,
    lineHeight: 42,
  },
  headlineSm: {
    fontFamily: Fonts.sansMedium,
    fontSize: 24,
    lineHeight: 39,
    letterSpacing: -0.28,
  },
  bodyLg: {
    fontFamily: Fonts.sansMedium,
    fontSize: 18,
    lineHeight: 27,
  },
  bodyMd: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  labelLg: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  labelMd: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  labelSm: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    lineHeight: 14,
  },
};

export const Spacing = {
  xs: 8,
  sm: 20,
  md: 30,
  lg: 50,
  xl: 150,
} as const;

export const Rounded = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  full: 9999,
} as const;
