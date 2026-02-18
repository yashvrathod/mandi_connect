// ==================== Responsive Style Utilities ====================

import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard device breakpoints
export const BREAKPOINTS = {
  small: 375,   // iPhone SE, small phones
  medium: 414,  // iPhone 14 Pro, standard phones
  large: 768,   // iPad Mini, small tablets
  xlarge: 1024, // iPad Pro, large tablets
} as const;

/**
 * Normalize size based on screen width
 * Base width: 375 (iPhone X/11/12/13)
 */
export const normalize = (size: number): number => {
  const scale = SCREEN_WIDTH / 375;
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Responsive font size
 */
export const responsiveFontSize = (size: number): number => {
  return normalize(size);
};

/**
 * Responsive width
 */
export const responsiveWidth = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percentage) / 100);
};

/**
 * Responsive height
 */
export const responsiveHeight = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percentage) / 100);
};

/**
 * Check if device is small
 */
export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < BREAKPOINTS.small;
};

/**
 * Check if device is medium
 */
export const isMediumDevice = (): boolean => {
  return SCREEN_WIDTH >= BREAKPOINTS.small && SCREEN_WIDTH < BREAKPOINTS.medium;
};

/**
 * Check if device is large (tablet)
 */
export const isTablet = (): boolean => {
  return SCREEN_WIDTH >= BREAKPOINTS.large;
};

/**
 * Get responsive value based on device size
 */
export const getResponsiveValue = <T,>(values: {
  small?: T;
  medium?: T;
  large?: T;
  default: T;
}): T => {
  if (isSmallDevice() && values.small !== undefined) {
    return values.small;
  }
  if (isMediumDevice() && values.medium !== undefined) {
    return values.medium;
  }
  if (isTablet() && values.large !== undefined) {
    return values.large;
  }
  return values.default;
};

/**
 * Responsive spacing scale
 */
export const spacing = {
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(16),
  lg: normalize(24),
  xl: normalize(32),
  '2xl': normalize(40),
  '3xl': normalize(48),
} as const;

/**
 * Responsive font sizes
 */
export const fontSizes = {
  xs: responsiveFontSize(10),
  sm: responsiveFontSize(12),
  base: responsiveFontSize(14),
  lg: responsiveFontSize(16),
  xl: responsiveFontSize(18),
  '2xl': responsiveFontSize(20),
  '3xl': responsiveFontSize(24),
  '4xl': responsiveFontSize(28),
  '5xl': responsiveFontSize(32),
  '6xl': responsiveFontSize(36),
} as const;

/**
 * Responsive icon sizes
 */
export const iconSizes = {
  xs: normalize(12),
  sm: normalize(16),
  md: normalize(20),
  lg: normalize(24),
  xl: normalize(28),
  '2xl': normalize(32),
} as const;

/**
 * Responsive border radius
 */
export const borderRadius = {
  sm: normalize(4),
  md: normalize(8),
  lg: normalize(12),
  xl: normalize(16),
  '2xl': normalize(20),
  '3xl': normalize(24),
  full: 9999,
} as const;

/**
 * Tailwind className builder with responsive values
 */
export const responsiveClass = {
  text: (size: keyof typeof fontSizes) => {
    const sizes = {
      xs: 'text-[10px]',
      sm: 'text-[12px]',
      base: 'text-[14px]',
      lg: 'text-[16px]',
      xl: 'text-[18px]',
      '2xl': 'text-[20px]',
      '3xl': 'text-[24px]',
      '4xl': 'text-[28px]',
      '5xl': 'text-[32px]',
      '6xl': 'text-[36px]',
    };
    return sizes[size] || sizes.base;
  },
  
  padding: (size: keyof typeof spacing) => {
    const values = {
      xs: 'p-1',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
      '2xl': 'p-10',
      '3xl': 'p-12',
    };
    return values[size] || values.md;
  },
  
  gap: (size: keyof typeof spacing) => {
    const values = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-10',
      '3xl': 'gap-12',
    };
    return values[size] || values.md;
  },
};

/**
 * Get screen info
 */
export const getScreenInfo = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallDevice(),
  isMedium: isMediumDevice(),
  isTablet: isTablet(),
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
});
