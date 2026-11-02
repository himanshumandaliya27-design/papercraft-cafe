/**
 * Atelier Vélin Shared Motion & Animation Configuration
 * Provides unified timing, easings, spring models, and accessible reduced-motion fallbacks.
 * Designed for paper-fold, ticket slide, and elevation micro-interactions.
 */

export const SHARED_MOTION = {
  // Duration tokens in seconds for Framer Motion / CSS
  duration: {
    fast: 0.15,     // 150ms - button clicks, badge pops, focus rings
    normal: 0.25,   // 250ms - drawer slides, accordion expands, tab switches
    cardFold: 0.5,  // 500ms - 3D paper fold/unfold interaction
    pageSlide: 0.28,// 280ms - page transition slide/fade
    toast: 0.3,     // 300ms - notification banner in/out
  },

  // Easing curves
  ease: {
    // Elegant tactile paper deceleration (smooth landing)
    paperOut: [0.16, 1, 0.3, 1] as const,
    // Realistic physical paper fold/hinge ease
    paperFold: [0.4, 0, 0.2, 1] as const,
    // Standard standard ease-in-out
    standard: [0.25, 0.1, 0.25, 1] as const,
  },

  // Framer Motion spring presets
  spring: {
    // Gentle tactile paper lift
    paperHover: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      mass: 0.8,
    },
    // Realistic 3D card unfold
    cardUnfold: {
      type: 'spring',
      stiffness: 220,
      damping: 24,
      mass: 1,
    },
    // Snappy drawer slide
    drawer: {
      type: 'spring',
      stiffness: 340,
      damping: 32,
      mass: 0.9,
    },
    // Micro-badge pop / bump
    badgeBump: {
      type: 'spring',
      stiffness: 500,
      damping: 18,
    },
  },

  // 3D Perspective settings for card flip/fold
  perspective: {
    card: '1200px',
    hero: '1600px',
  },
} as const;

/**
 * Utility to check if user has prefers-reduced-motion enabled
 */
export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
