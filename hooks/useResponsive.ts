// ==================== Responsive Design Hook ====================

import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize, Platform, PixelRatio } from 'react-native';

interface ScreenDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

interface ResponsiveValues {
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isTablet: boolean;
  screenWidth: number;
  screenHeight: number;
  
  // Responsive spacing
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  // Responsive font sizes
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
  };
  
  // Responsive dimensions
  iconSize: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  // Helper functions
  wp: (percentage: number) => number; // Width percentage
  hp: (percentage: number) => number; // Height percentage
  moderateScale: (size: number, factor?: number) => number;
}

/**
 * Get current screen dimensions
 */
const getScreenDimensions = (): ScreenDimensions => {
  const { width, height, scale, fontScale } = Dimensions.get('window');
  return { width, height, scale, fontScale };
};

/**
 * Determine device type based on width
 */
const getDeviceType = (width: number) => {
  const isSmallDevice = width < 375; // iPhone SE, small Android
  const isMediumDevice = width >= 375 && width < 414; // iPhone 12/13/14
  const isLargeDevice = width >= 414 && width < 768; // iPhone 14 Plus, large Android
  const isTablet = width >= 768; // iPad, Android tablets

  return { isSmallDevice, isMediumDevice, isLargeDevice, isTablet };
};

/**
 * Calculate responsive spacing based on screen width
 */
const getResponsiveSpacing = (width: number) => {
  const baseSpacing = width < 375 ? 12 : width < 414 ? 16 : 20;
  
  return {
    xs: baseSpacing * 0.25,  // 3-5px
    sm: baseSpacing * 0.5,   // 6-10px
    md: baseSpacing,         // 12-20px
    lg: baseSpacing * 1.5,   // 18-30px
    xl: baseSpacing * 2,     // 24-40px
  };
};

/**
 * Calculate responsive font sizes
 */
const getResponsiveFontSizes = (width: number, fontScale: number) => {
  // Base font size adjusted for device
  const baseFontSize = width < 375 ? 14 : width < 414 ? 15 : 16;
  
  // Account for system font scaling (accessibility)
  const scale = Math.min(fontScale, 1.3); // Cap at 130% to prevent breaking layouts
  
  return {
    xs: Math.round((baseFontSize * 0.75) * scale),    // 10-12px
    sm: Math.round((baseFontSize * 0.875) * scale),   // 12-14px
    base: Math.round(baseFontSize * scale),           // 14-16px
    lg: Math.round((baseFontSize * 1.125) * scale),   // 16-18px
    xl: Math.round((baseFontSize * 1.25) * scale),    // 18-20px
    '2xl': Math.round((baseFontSize * 1.5) * scale),  // 21-24px
    '3xl': Math.round((baseFontSize * 1.875) * scale),// 26-30px
    '4xl': Math.round((baseFontSize * 2.25) * scale), // 32-36px
  };
};

/**
 * Calculate responsive icon sizes
 */
const getResponsiveIconSizes = (width: number) => {
  const baseIconSize = width < 375 ? 18 : width < 414 ? 20 : 22;
  
  return {
    sm: baseIconSize,
    md: baseIconSize * 1.2,
    lg: baseIconSize * 1.5,
    xl: baseIconSize * 2,
  };
};

/**
 * Width percentage to pixels
 */
const widthPercentageToDP = (widthPercent: number, screenWidth: number): number => {
  return PixelRatio.roundToNearestPixel((screenWidth * widthPercent) / 100);
};

/**
 * Height percentage to pixels
 */
const heightPercentageToDP = (heightPercent: number, screenHeight: number): number => {
  return PixelRatio.roundToNearestPixel((screenHeight * heightPercent) / 100);
};

/**
 * Moderate scale - scales with screen size but not linearly
 */
const moderateScale = (size: number, factor: number = 0.5, screenWidth: number): number => {
  const baseWidth = 375; // iPhone X/11/12/13 width
  const scale = screenWidth / baseWidth;
  return Math.round(size + (scale - 1) * size * factor);
};

/**
 * Main responsive hook
 */
export const useResponsive = (): ResponsiveValues => {
  const [dimensions, setDimensions] = useState<ScreenDimensions>(getScreenDimensions());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions({
        width: window.width,
        height: window.height,
        scale: window.scale,
        fontScale: window.fontScale,
      });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height, fontScale } = dimensions;
  const deviceType = getDeviceType(width);
  const spacing = getResponsiveSpacing(width);
  const fontSize = getResponsiveFontSizes(width, fontScale);
  const iconSize = getResponsiveIconSizes(width);

  return {
    ...deviceType,
    screenWidth: width,
    screenHeight: height,
    spacing,
    fontSize,
    iconSize,
    wp: (percentage: number) => widthPercentageToDP(percentage, width),
    hp: (percentage: number) => heightPercentageToDP(percentage, height),
    moderateScale: (size: number, factor?: number) => moderateScale(size, factor, width),
  };
};

/**
 * Get static responsive values (without hook)
 */
export const getResponsiveValues = (): ResponsiveValues => {
  const { width, height, fontScale } = getScreenDimensions();
  const deviceType = getDeviceType(width);
  const spacing = getResponsiveSpacing(width);
  const fontSize = getResponsiveFontSizes(width, fontScale);
  const iconSize = getResponsiveIconSizes(width);

  return {
    ...deviceType,
    screenWidth: width,
    screenHeight: height,
    spacing,
    fontSize,
    iconSize,
    wp: (percentage: number) => widthPercentageToDP(percentage, width),
    hp: (percentage: number) => heightPercentageToDP(percentage, height),
    moderateScale: (size: number, factor?: number) => moderateScale(size, factor, width),
  };
};

/**
 * Responsive style helper
 */
export const responsive = {
  /**
   * Get responsive padding/margin
   */
  spacing: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): number => {
    const values = getResponsiveValues();
    return values.spacing[size];
  },
  
  /**
   * Get responsive font size
   */
  fontSize: (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'): number => {
    const values = getResponsiveValues();
    return values.fontSize[size];
  },
  
  /**
   * Get responsive icon size
   */
  iconSize: (size: 'sm' | 'md' | 'lg' | 'xl'): number => {
    const values = getResponsiveValues();
    return values.iconSize[size];
  },
  
  /**
   * Width percentage
   */
  wp: (percentage: number): number => {
    const { width } = getScreenDimensions();
    return widthPercentageToDP(percentage, width);
  },
  
  /**
   * Height percentage
   */
  hp: (percentage: number): number => {
    const { height } = getScreenDimensions();
    return heightPercentageToDP(percentage, height);
  },
  
  /**
   * Moderate scale
   */
  scale: (size: number, factor: number = 0.5): number => {
    const { width } = getScreenDimensions();
    return moderateScale(size, factor, width);
  },
};

export default useResponsive;
