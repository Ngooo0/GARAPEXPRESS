/**
 * Polyfill for web-specific React Navigation issues
 * Fixes: useNavigationIndependentTree is not a function
 */

// Detect if we're on web
const isWeb = typeof window !== 'undefined' && !globalThis.React?.Platform?.OS;

if (isWeb) {
  // Patch react-native for web
  const originalPlatform = require('react-native').Platform;
  if (originalPlatform) {
    originalPlatform.OS = 'web';
  }

  // Add useNavigationIndependentTree to react-navigation/native
  try {
    const navigationNative = require('@react-navigation/native');
    
    // Create a no-op version for web
    if (!navigationNative.useNavigationIndependentTree) {
      navigationNative.useNavigationIndependentTree = () => null;
    }
    
    // Also patch useNavigation to work better on web
    const originalUseNavigation = navigationNative.useNavigation;
    if (originalUseNavigation) {
      navigationNative.useNavigation = function() {
        try {
          return originalUseNavigation();
        } catch (e) {
          // Return a minimal navigation object on web if useNavigation fails
          return {
            navigate: () => {},
            goBack: () => {},
            push: () => {},
            popToTop: () => {},
            replace: () => {},
          };
        }
      };
    }
  } catch (e) {
    console.warn('Could not apply navigation web polyfill:', e);
  }
}

export {};

