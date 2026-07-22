import { Platform } from 'react-native';

export const Colors = {
  // Primary greens
  primary: '#2D6A4F',
  primaryDark: '#1C3B2A',
  primaryLight: '#52B788',
  primaryBg: '#E8F5EE',
  primaryBorder: '#A8D5BE',

  // Backgrounds
  bg: '#EDE8DC',
  bgCard: '#FFFFFF',
  bgSecondary: '#EDE8DC',
  bgShade: '#E4E0D4',

  // Text
  textPrimary: '#1A1A18',
  textSecondary: '#4A4A45',
  textMuted: '#8A8A82',

  // Border
  border: '#D4CFC4',
  borderLight: '#E2DED6',

  // Biomarker status — longevity-optimized
  status: {
    optimal: '#52B788',
    optimalBg: '#E8F5EE',
    optimalBorder: '#A8D5BE',
    optimalText: '#1C5C3A',
    review: '#E9C46A',
    reviewBg: '#FEF9E7',
    reviewBorder: '#F0D88A',
    reviewText: '#7A5B10',
    critical: '#E76F51',
    criticalBg: '#FDECEA',
    criticalBorder: '#F0A898',
    criticalText: '#8B1A0E',
  },

  // Semantic
  warning: '#D4860B',
  warningBg: '#FDF3E3',
  warningBorder: '#EDBE87',
  warningText: '#633806',
  warningTextDark: '#412402',
  danger: '#B13126',
  dangerBg: '#FCECEA',

  // Accent (supplement chips / blue)
  accent: '#5B9DBF',
  accentBg: '#E6F1FB',
  accentBorder: '#B5D4F4',
  accentDark: '#0C447C',

  // Chart
  chartGreen: '#52B788',
  chartBlue: '#378ADD',
  chartOrange: '#D4860B',
  chartPurple: '#7F77DD',
  chartRed: '#D85A30',

  // Dark card (bio age gradient)
  darkCard: '#1C3B2A',
  darkCardText: '#E8F5EE',

  // Dark mode surfaces
  dark: {
    bg: '#0C0F0D',
    bgCard: '#141916',
    bgElevated: '#1C2119',
    navy: '#090E1A',
    graphite: '#1A1C1B',
    warmBlack: '#110F0A',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.12)',
    text: '#E8F5EE',
    textMuted: 'rgba(232,245,238,0.5)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.08)',
    inputBg: 'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.12)',
    ctaPrimary: '#52B788',
    accentBg: 'rgba(82,183,136,0.12)',
    accentBorder: 'rgba(82,183,136,0.3)',
    // Status tints for dark surfaces
    statusOptimalBg: 'rgba(74,222,128,0.12)',
    statusOptimalBorder: 'rgba(74,222,128,0.3)',
    statusWarnBg: 'rgba(245,158,11,0.12)',
    statusWarnBorder: 'rgba(245,158,11,0.3)',
    statusCritBg: 'rgba(248,113,113,0.12)',
    statusCritBorder: 'rgba(248,113,113,0.3)',
  },

  // Data visualisation accents
  viz: {
    cyan: '#00C4C4',
    cyanDim: '#007575',
    teal: '#00B89C',
    bioGreen: '#4ADE80',
    bioGreenDim: '#166534',
    amber: '#F59E0B',
    amberDim: '#92400E',
    purple: '#A78BFA',
    coral: '#F87171',
  },

  // Clinical-premium token set — white/green light-mode system (Phase 13)
  // Tokens: Colors.surface, Colors.surfaceElevated, Colors.brand,
  //         Colors.onSurface, Colors.onSurfaceMuted, Colors.accentMuted, Colors.semantic
  surface: '#FFFFFF',               // Colors.surface — primary card/screen background for light screens
  surfaceElevated: '#F9F9F9',       // Colors.surfaceElevated — elevated card surfaces and headers
  brand: '#1B4332',                 // Colors.brand — deep forest green: CTAs, active states, key data labels
  onSurface: '#1C1C1E',             // Colors.onSurface — Apple-native dark text on white/light screens
  onSurfaceMuted: '#6B6B64',        // Colors.onSurfaceMuted — muted text on light screens
  accentMuted: 'rgba(91, 157, 191, 0.25)', // Colors.accentMuted — muted/alpha neural blue (#5B9DBF) for subtle tint backgrounds

  // iOS semantic state colors — DS-01: Colors.semantic.{success, warning, danger, info}
  semantic: {
    success: '#34C759',  // iOS green, success state
    warning: '#FF9500',  // iOS orange, warning state
    danger: '#FF3B30',   // iOS red, danger/error state
    info: '#007AFF',     // iOS blue, informational state
  },

  // Health OS — quiet editorial surfaces with attention used sparingly.
  health: {
    background: '#F2F0E9',
    surface: '#FAF9F5',
    surfaceStrong: '#FFFFFF',
    ink: '#171916',
    inkSecondary: '#555A53',
    inkTertiary: '#858A82',
    rule: '#DADCD4',
    ruleStrong: '#BFC3B9',
    accent: '#255B46',
    accentSoft: '#E1EBE5',
    neutralSoft: '#ECEEEA',
    neutralInk: '#5F665F',
    attention: '#93662D',
    attentionSoft: '#F1E7D8',
  },

  // Living Sphere — evidence-neutral, low-saturation rendering palette.
  // These colors never encode health quality; motion, texture and clarity do.
  livingSphere: {
    light: {
      base: '#D7D4CC',
      depth: '#77858A',
      warmth: '#B99C87',
      surface: '#929D97',
      highlight: '#F4F0E7',
      atmosphere: 'rgba(103, 119, 124, 0.16)',
      contour: 'rgba(69, 78, 76, 0.18)',
      boundary: 'rgba(69, 78, 76, 0.24)',
    },
    dark: {
      base: '#343C3D',
      depth: '#52636A',
      warmth: '#8A7465',
      surface: '#68756F',
      highlight: '#CDD1C8',
      atmosphere: 'rgba(164, 177, 178, 0.14)',
      contour: 'rgba(222, 226, 218, 0.15)',
      boundary: 'rgba(222, 226, 218, 0.20)',
    },
  },

};

export const Typography = {
  serif: 'serif',
  // Editorial display serif — "The Vitalspan Brief" issue headlines ONLY.
  // Every other screen stays SF (`sans`/system default). See DESIGN_SYSTEM.md
  // "Editorial Display Serif" for the scope rule.
  displaySerif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) as string,
  sans: 'System',
  sizes: {
    // Existing — do not remove
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 16,
    xl: 20,
    xxl: 28,
    hero: 44,
    // Semantic scale — use these for all screen typography
    // Display scale
    heroNumeral: 68, // De-Slop editorial rule: the single largest numeral in the app (Dashboard bio age)
    display1: 56,
    display2: 44,
    display3: 36,
    // Heading scale
    h1: 28,
    h2: 22,
    h3: 18,
    // Body scale
    body: 15,
    bodySmall: 13,
    // Caption scale
    caption: 12,
    captionSmall: 11,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 3,
  },
  // Named weights per DESIGN_SYSTEM.md "Type Hierarchy" table — pair with the
  // matching size role below instead of hardcoding raw fontWeight strings.
  weights: {
    displayHero: '200' as const,   // BioAge sphere number
    title: '300' as const,         // Screen-level titles
    headline: '400' as const,      // Card headings — use '500' for emphasis
    subheadline: '600' as const,   // Modal/sheet titles, card section headers
    body: '400' as const,
    label: '600' as const,         // Eyebrow labels, badges
  },
  // Line heights paired 1:1 with sizes.* of the same role name.
  lineHeights: {
    display1: 60,
    display2: 50,
    display3: 42,
    h1: 34,
    h2: 28,
    h3: 24,
    body: 21,
    bodySmall: 18,
    caption: 16,
    captionSmall: 14,
  },
};

// De-Slop editorial rule: exactly two corner-radius values app-wide.
// `card` for cards/inputs/chips/badges, `sheet` for bottom sheets/modals/large
// pill CTAs. `full` is a separate stadium/circle shape (height ÷ 2), not a
// fixed radius. The legacy sm/md/lg/xl/xxl names are kept as aliases so
// existing call sites don't need a rename — they all resolve to one of the
// two values below now.
export const Radius = {
  card: 12,
  sheet: 24,
  full: 999,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 12,
  xxl: 24,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

// Shared product-screen geometry. Home and Health establish these proportions:
// restrained page insets, readable content widths, quiet card padding, and
// enough bottom clearance for the persistent tab bar / home indicator.
export const ProductLayout = {
  maxContentWidth: 720,
  compactBreakpoint: 360,
  pageInset: 20,
  compactPageInset: 14,
  cardPadding: 20,
  sectionGap: 32,
  controlMinHeight: 44,
  bottomClearance: 64,
} as const;

// Gradient palette for backgrounds and cards
export const Gradients = {
  bioAge: ['#0A1628', '#1C3B2A'] as const,
  longevity: ['#001A14', '#0D2B22', '#1C3B2A'] as const,
  darkSurface: ['#0C0F0D', '#141916'] as const,
  neural: ['#050E0B', '#0F2018'] as const,
  appBg: ['#080D09', '#0C1410', '#0F1C14'] as const,
  // Light card gradients (legacy — kept for reference)
  cardGood: ['#E8F5EE', '#D4EDE2'] as const,
  cardWarn: ['#FDF3E3', '#F5E4CC'] as const,
  cardNone: ['#FFFFFF', '#F8F6F2'] as const,
  // Dark card gradients — use on dark-background screens
  darkCardGood: ['rgba(74,222,128,0.08)', 'rgba(74,222,128,0.04)'] as const,
  darkCardWarn: ['rgba(245,158,11,0.08)', 'rgba(245,158,11,0.04)'] as const,
  darkCardNone: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)'] as const,
} as const;

// Motion constants
export const Motion = {
  slow: 800,
  medium: 400,
  fast: 200,
  breath: 4000,
  drift: 8000,
  orbit: 12000,
  // Micro-interaction system (premium polish pass) — pair with
  // components/motion.ts (AnimatedPressable, StaggerIn).
  pressScale: 0.97,       // scale-down target for button/card press feedback
  pressSpring: { damping: 16, stiffness: 260 } as const,
  entranceDuration: 220,  // card/list-item fade+slide-in duration (no overshoot)
  entranceStagger: 50,    // ms delay added per list index when staggering entrance
  entranceOffset: 10,     // px the entrance animation slides up from
} as const;

// Elevation / shadow tokens
export const Elevation = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
