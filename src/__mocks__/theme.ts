// Minimal mock of src/theme for test environment
// supplementTimings.ts imports Colors from theme — this stub satisfies the import without RN deps
export const Colors = {
  primary: '#2D6A4F',
  primaryBg: '#F0FAF4',
  primaryBorder: '#B7DFC9',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F5F0',
  onSurfaceMuted: '#6B6B64',
  borderLight: '#E8E8E3',
  status: {
    optimalText: '#1C5C3A',
    optimalBg: '#EAF7EE',
  },
  livingSphere: {
    light: {
      base: '#D7D4CC', depth: '#77858A', warmth: '#B99C87', surface: '#929D97',
      highlight: '#F4F0E7', atmosphere: 'light-atmosphere', contour: 'light-contour',
      boundary: 'light-boundary',
    },
    dark: {
      base: '#343C3D', depth: '#52636A', warmth: '#8A7465', surface: '#68756F',
      highlight: '#CDD1C8', atmosphere: 'dark-atmosphere', contour: 'dark-contour',
      boundary: 'dark-boundary',
    },
  },
};

export const Spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, xxl: 32,
};
