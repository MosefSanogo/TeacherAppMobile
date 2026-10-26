export const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#DBEAFE",

  secondary: "#0F766E",
  secondaryLight: "#CCFBF1",

  background: "#F8FAFC",
  surface: "#FFFFFF",

  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  border: "#E2E8F0",

  success: "#16A34A",
  successLight: "#DCFCE7",

  danger: "#DC2626",
  dangerLight: "#FEE2E2",

  warning: "#D97706",
  warningLight: "#FEF3C7",

  info: "#0284C7",
  infoLight: "#E0F2FE",

  white: "#FFFFFF",
  black: "#000000",
};

export const SIZES = {
  // Typographie
  textXS: 12,
  textSM: 14,
  textMD: 16,
  textLG: 18,
  textXL: 20,
  title: 24,
  heading: 28,

  // Icônes
  iconSM: 18,
  iconMD: 22,
  iconLG: 26,
  iconXL: 32,

  // Espacements
  spaceXS: 4,
  spaceSM: 8,
  spaceMD: 12,
  spaceLG: 16,
  spaceXL: 24,
  space2XL: 32,

  // Dimensions
  buttonHeight: 48,
  inputHeight: 48,
  headerHeight: 56,
  tabBarHeight: 64,

  // Arrondis
  radiusSM: 8,
  radiusMD: 12,
  radiusLG: 16,
  radiusXL: 20,
  radiusFull: 999,
};

export const FONTS = {
  regular: "System",
  medium: "System",
  semibold: "System",
  bold: "System",
};

export const FONTWEIGHTS = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const SHADOWS = {
  small: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const THEME = {
  colors: COLORS,
  sizes: SIZES,
  fonts: FONTS,
  fontWeights: FONTWEIGHTS,
  shadows: SHADOWS,
};

export default {
  COLORS,
  SIZES,
  FONTS,
  FONTWEIGHTS,
  SHADOWS,
  THEME,
};
