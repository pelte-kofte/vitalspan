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
};
