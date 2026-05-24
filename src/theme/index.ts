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
    text: '#E8F5EE',
    textMuted: 'rgba(232,245,238,0.5)',
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
};

export const Typography = {
  serif: 'serif',
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
    // Display scale
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
};

export const Radius = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
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

// Gradient palette for backgrounds and cards
export const Gradients = {
  bioAge: ['#0A1628', '#1C3B2A'] as const,
  longevity: ['#001A14', '#0D2B22', '#1C3B2A'] as const,
  darkSurface: ['#0C0F0D', '#141916'] as const,
  neural: ['#050E0B', '#0F2018'] as const,
  cardGood: ['#E8F5EE', '#D4EDE2'] as const,
  cardWarn: ['#FDF3E3', '#F5E4CC'] as const,
  cardNone: ['#FFFFFF', '#F8F6F2'] as const,
} as const;

// Motion constants
export const Motion = {
  slow: 800,
  medium: 400,
  fast: 200,
  breath: 4000,
  drift: 8000,
  orbit: 12000,
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
