// Mobile-first responsive styles utility
// Based on 2024 best practices for React mobile optimization
import { useState, useEffect } from 'react';

export const getMobileOptimizedStyles = () => {
  // Get actual viewport dimensions
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  
  // Mobile breakpoints based on 2024 standards
  const isMobile = vw <= 768;
  const isSmallMobile = vw <= 375;
  
  // Calculate safe padding based on screen width
  const safePadding = Math.max(0.5, Math.min(1.5, vw * 0.04)); // 4% of viewport width, min 0.5rem, max 1.5rem
  const safeMargin = Math.max(0.25, Math.min(1, vw * 0.02)); // 2% of viewport width
  
  return {
    // Container styles with proper viewport fitting
    container: {
      width: '100vw',
      minHeight: '100vh',
      maxWidth: '100%',
      paddingBottom: isMobile ? '6rem' : '5rem', // Extra space for mobile nav
      backgroundColor: '#f9fafb',
      overflowX: 'hidden', // Prevent horizontal scroll
      position: 'relative'
    },
    
    // Header with responsive padding
    header: {
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: `${safePadding}rem`,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      width: '100%',
      maxWidth: '100vw',
      boxSizing: 'border-box'
    },
    
    // Content with safe area padding
    content: {
      padding: `0 ${safePadding}rem ${safePadding}rem`,
      width: '100%',
      maxWidth: '100vw',
      boxSizing: 'border-box'
    },
    
    // Cards with responsive sizing
    card: {
      backgroundColor: '#ffffff',
      borderRadius: isMobile ? '0.5rem' : '0.75rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      padding: `${safePadding}rem`,
      marginBottom: `${safeMargin}rem`,
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    },
    
    // Grid systems that adapt to screen size
    gridTwoColumn: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: `${safeMargin}rem`,
      width: '100%'
    },
    
    gridThreeColumn: {
      display: 'grid',
      gridTemplateColumns: isSmallMobile ? '1fr' : isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
      gap: `${safeMargin}rem`,
      width: '100%'
    },
    
    // Weather tabs with proper mobile scaling
    weatherTabContainer: {
      display: 'flex',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.75rem',
      padding: '0.25rem',
      marginBottom: '1rem',
      gap: '0.25rem',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch'
    },
    
    weatherTab: (isActive) => ({
      flex: isMobile ? '0 0 auto' : '1',
      minWidth: isMobile ? '80px' : 'auto',
      padding: `${safeMargin * 0.5}rem ${safeMargin}rem`,
      border: 'none',
      borderRadius: '0.5rem',
      backgroundColor: isActive ? '#ffffff' : 'transparent',
      color: isActive ? '#0891b2' : '#6b7280',
      fontSize: isMobile ? '0.75rem' : '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.25rem',
      transition: 'all 0.2s',
      boxShadow: isActive ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none',
      whiteSpace: 'nowrap'
    }),
    
    // Button styles optimized for touch
    primaryButton: {
      width: '100%',
      backgroundColor: '#0891b2',
      color: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      padding: `${safePadding}rem`,
      fontSize: isMobile ? '1rem' : '1.125rem',
      fontWeight: '600',
      cursor: 'pointer',
      minHeight: '44px', // Apple's minimum touch target
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    
    // Typography that scales properly
    title: {
      fontSize: isSmallMobile ? '1.25rem' : isMobile ? '1.5rem' : '1.75rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem',
      lineHeight: 1.2
    },
    
    subtitle: {
      fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
      color: '#6b7280',
      lineHeight: 1.4
    },
    
    // Safe area utilities
    safeArea: {
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    },
    
    // Utility values for components
    spacing: {
      xs: `${safeMargin * 0.5}rem`,
      sm: `${safeMargin}rem`,
      md: `${safePadding}rem`,
      lg: `${safePadding * 1.5}rem`,
      xl: `${safePadding * 2}rem`
    },
    
    // Screen size checks for components
    breakpoints: {
      isMobile,
      isSmallMobile,
      vw,
      vh
    }
  };
};

// Hook for getting responsive styles in components
export const useMobileStyles = () => {
  const [styles, setStyles] = useState(getMobileOptimizedStyles());
  
  useEffect(() => {
    const handleResize = () => {
      setStyles(getMobileOptimizedStyles());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return styles;
};

// Quick utility for common responsive patterns
export const responsive = {
  // Clamp function for fluid typography
  clamp: (min, preferred, max) => `clamp(${min}, ${preferred}, ${max})`,
  
  // Viewport-based sizing
  vw: (percentage) => `${percentage}vw`,
  vh: (percentage) => `${percentage}vh`,
  vmin: (percentage) => `${percentage}vmin`,
  vmax: (percentage) => `${percentage}vmax`,
  
  // Safe spacing based on screen size
  spacing: (multiplier = 1) => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const base = Math.max(0.5, Math.min(1.5, vw * 0.04));
    return `${base * multiplier}rem`;
  }
};