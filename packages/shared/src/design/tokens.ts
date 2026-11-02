/**
 * Atelier Vélin Design System Tokens
 * Universal source of truth for Spacing, Typography, Layout, Shadows, Z-index and Colors.
 * Enforces WCAG 2.1 AA compliance (>= 4.5:1 text, >= 3:1 graphical) and zero-pill discipline.
 */

export const DESIGN_TOKENS = {
  // Spacing scale in px / rem
  spacing: {
    xs: '4px',    // 0.25rem - py-1, gap-1
    sm: '8px',    // 0.5rem  - p-2, gap-2
    md: '12px',   // 0.75rem - p-3, gap-3
    base: '16px', // 1rem    - p-4, gap-4 (Mobile gutter baseline)
    lg: '24px',   // 1.5rem  - p-6, gap-6 (Tablet gutter baseline)
    xl: '32px',   // 2rem    - p-8, gap-8 (Desktop gutter baseline)
    '2xl': '48px',// 3rem    - p-12 (Section vertical rhythm)
    '3xl': '64px',// 4rem    - p-16 (Hero / major break)
  },

  // Max widths
  maxWidths: {
    customerContainer: '1200px', // Max content width for customer-facing pages
    readingBlock: '640px',       // Optimal line length (~65 characters)
    adminContent: '100%',        // Fluid with consistent padding
    modalSm: '420px',
    modalMd: '560px',
    modalLg: '768px',
  },

  // Page gutters
  gutters: {
    mobile: '16px',
    tablet: '24px',
    desktop: '32px',
    desktopWide: '48px',
  },

  // Typography scale (font-size / line-height / tracking)
  typography: {
    display: {
      fontSize: 'clamp(2rem, 4vw + 1rem, 3.25rem)',
      lineHeight: '1.15',
      fontWeight: '700',
      fontFamily: "'Fraunces', Georgia, serif",
      letterSpacing: '-0.02em',
    },
    h1: {
      fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.25rem)',
      lineHeight: '1.2',
      fontWeight: '700',
      fontFamily: "'Fraunces', Georgia, serif",
      letterSpacing: '-0.015em',
    },
    h2: {
      fontSize: 'clamp(1.35rem, 2vw + 0.5rem, 1.75rem)',
      lineHeight: '1.25',
      fontWeight: '700',
      fontFamily: "'Fraunces', Georgia, serif",
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: 'clamp(1.15rem, 1.5vw + 0.25rem, 1.35rem)',
      lineHeight: '1.3',
      fontWeight: '600',
      fontFamily: "'Fraunces', Georgia, serif",
    },
    body: {
      fontSize: '1rem',
      lineHeight: '1.6',
      fontWeight: '400',
      fontFamily: "'Inter', -apple-system, sans-serif",
    },
    small: {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      fontWeight: '400',
      fontFamily: "'Inter', -apple-system, sans-serif",
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: '1.4',
      fontWeight: '500',
      letterSpacing: '0.04em',
      fontFamily: "'Inter', -apple-system, sans-serif",
    },
    numeric: {
      fontFamily: "'Inter', -apple-system, sans-serif",
      fontVariantNumeric: 'tabular-nums',
      fontWeight: '500',
      letterSpacing: '-0.01em',
    },
    handwritten: {
      fontFamily: "'Caveat', cursive",
      lineHeight: '1.2',
    },
  },

  // Z-index hierarchy (ensures clean layering without conflicts)
  zIndex: {
    base: 0,
    elevated: 10,
    stickyHeader: 30,
    navbar: 40,
    floatingAction: 45,
    drawer: 50,
    modalBackdrop: 60,
    modalContent: 65,
    toast: 70,
    tooltip: 80,
  },

  // Palette with WCAG AA compliance verified
  colors: {
    // Base paper
    paperBase: '#F4EBDD',      // Parchment background
    paperSheet: '#FAF5EC',     // High-grade crisp cream sheet
    paperKraft: '#E7D6BE',     // Natural unbleached kraft paper
    
    // Core text & brand (Contrast ratio on #FAF5EC > 11.5:1)
    espresso: '#2B1B14',       // Primary text / deep espresso roast
    roastMuted: '#4A372F',     // Secondary subtext (Contrast ratio > 7.8:1)
    kraftBorder: '#8A5E35',    // Accessible kraft brown border
    terracotta: '#B84B29',     // Accessible warm terracotta accent (Contrast ratio > 4.6:1)
    
    // Status badges / indicators (High contrast text on cream sheet)
    status: {
      received: {
        text: '#9C4121',
        bg: '#FDF0EB',
        border: '#E8B9A7',
        label: 'Received',
      },
      preparing: {
        text: '#8A5E2E',
        bg: '#FDF6ED',
        border: '#E8D2B4',
        label: 'In Kitchen',
      },
      ready: {
        text: '#206324',
        bg: '#EDF7EE',
        border: '#B2DEB5',
        label: 'Ready for Service',
      },
      served: {
        text: '#2B1B14',
        bg: '#F4EBDD',
        border: '#B98A5E',
        label: 'Served',
      },
      cancelled: {
        text: '#9E2424',
        bg: '#FCECEC',
        border: '#F1AFAF',
        label: 'Cancelled',
      },
      paid: {
        text: '#1B5E20',
        bg: '#EAF5EC',
        border: '#A7D7AD',
        label: 'Paid',
      },
      pending: {
        text: '#935817',
        bg: '#FEF8EC',
        border: '#EDD3A1',
        label: 'Payment Pending',
      },
    },

    // Dark Mode Palette for Admin POS/KDS
    dark: {
      base: '#19120E',         // Dark bean background
      sheet: '#231A15',        // Dark slate paper
      card: '#2D221C',         // Elevated card paper
      border: 'rgba(185, 138, 94, 0.28)',
      textPrimary: '#FAF5EC',  // Parchment text (>13:1 on dark)
      textSecondary: '#D4C4B5',// Muted beige subtext (>8:1 on dark)
      accent: '#E06B45',       // High-visibility terracotta
    },
  },

  // Shadows for layered paper elevation
  shadows: {
    resting: '0 1px 2px rgba(43, 27, 20, 0.07), 0 4px 10px -2px rgba(43, 27, 20, 0.08), inset 0 0 0 1px rgba(185, 138, 94, 0.22)',
    hover: '0 4px 8px rgba(43, 27, 20, 0.09), 0 14px 28px -4px rgba(43, 27, 20, 0.13), 0 24px 40px -12px rgba(43, 27, 20, 0.09), inset 0 0 0 1px rgba(185, 138, 94, 0.35)',
    pressed: '0 1px 2px rgba(43, 27, 20, 0.12), inset 0 2px 4px rgba(43, 27, 20, 0.08)',
    modal: '0 20px 48px -10px rgba(43, 27, 20, 0.25), 0 8px 16px -4px rgba(43, 27, 20, 0.15), inset 0 0 0 1px rgba(185, 138, 94, 0.4)',
    ticketStub: '0 2px 6px rgba(43, 27, 20, 0.08), 0 8px 16px -4px rgba(43, 27, 20, 0.06)',
  },

  // Border radiuses for paper products
  radii: {
    sharp: '0px',       // Strict paper ticket edges
    slight: '2px',      // Crisp deckled paper sheet
    card: '4px',        // Normal paper card
    tag: '6px',         // Luggage tag
    pill: '9999px',     // Strictly reserved for interactive toggle switches / counters
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
