// =================================================================================
// FILE: src/styles/theme.ts
// Purpose: Defines the comprehensive JavaScript/TypeScript theme object for the application,
//          including palettes for light and dark modes, typography, spacing, etc.
//          This object can be used with CSS-in-JS libraries or to configure Tailwind CSS.
// =================================================================================

// Helper function for rgba (optional, or use template literals)
const rgba = (hex: string, alpha: number): string => {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
      return `rgba(0,0,0,${alpha})`; // Fallback
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return `rgba(0,0,0,${alpha})`; // Fallback
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // -------------------------
  // TYPE DEFINITIONS
  // -------------------------
  interface ColorScale {
    50: string; 100: string; 200: string; 300: string; 400: string;
    500: string; 600: string; 700: string; 800: string; 900: string; 950: string;
  }
  
  interface SemanticColorSuite {
    lightest?: string;
    lighter?: string;
    light: string;
    main: string;
    dark: string;
    darker?: string;
    darkest?: string;
    contrastText: string;
    onLight?: string;
    onDark?: string;
    hover?: string;
    selected?: string;
    active?: string;
  }
  
  interface ModeSpecificPalette {
    mode: 'light' | 'dark';
    primary: SemanticColorSuite;
    secondary: SemanticColorSuite;
    accent?: SemanticColorSuite;
  
    bg: {
      default: string;
      paper: string;
      alt: string;
      inverse: string;
      overlay?: string;
    };
  
    text: {
      primary: string;
      secondary: string;
      tertiary?: string;
      disabled: string;
      inverse: string;
      link: string;
      linkHover?: string;
      placeholder?: string;
    };
  
    border: {
      default: string;
      subtle: string;
      strong?: string;
      focus: string;
      outline?: string;
    };
    divider: string;
  
    ui: {
      hover: string;
      selected: string;
      active: string;
      disabledBg: string;
      disabledContent: string;
      focusRing?: string;
    };
  
    status: {
      success: SemanticColorSuite;
      warning: SemanticColorSuite;
      error: SemanticColorSuite;
      info: SemanticColorSuite;
      neutral?: SemanticColorSuite;
    };
  
    common: {
      black: string;
      white: string;
      transparent: string;
      gray: ColorScale;
      blue: ColorScale;
      green: ColorScale;
      yellow: ColorScale;
      red: ColorScale;
      purple: ColorScale;
      pink: ColorScale;
      orange: ColorScale;
      teal: ColorScale;
    };
  
    shadows: {
      baseColorRGB: string; // RGB values for shadow color, e.g., "0, 0, 0"
      umbraOpacity: number;
      penumbraOpacity: number;
      ambientOpacity: number;
      xs: string; sm: string; md: string; lg: string; xl: string; '2xl': string; inner: string;
    };
  }
  
  interface TypographyScale {
    '3xs': string; '2xs': string; xs: string; sm: string; md: string; lg: string; xl: string;
    '2xl': string; '3xl': string; '4xl': string; '5xl': string; '6xl': string; '7xl': string;
  }
  
  interface FontWeights {
    thin: number; extralight: number; light: number; regular: number; medium: number;
    semibold: number; bold: number; extrabold: number; black: number;
  }
  
  interface LineHeights {
    none: number; tighter: number; tight: number; snug: number; normal: number;
    relaxed: number; loose: number; '3': string; '4': string; '5': string; '6': string;
    '7': string; '8': string; '9': string; '10': string;
  }
  
  interface LetterSpacings {
    tighter: string; tight: string; normal: string; wide: string; wider: string; widest: string;
  }
  
  interface TypographySettings {
    fontFamilyPrimary: string;
    fontFamilySecondary: string;
    fontFamilyMonospace: string;
    rootFontSizePercentage: string;
    baseBodySize: string;
    fontSizes: TypographyScale;
    fontWeights: FontWeights;
    lineHeights: LineHeights;
    letterSpacings: LetterSpacings;
  }
  
  interface SpacingScale {
    px: string; 0: string; 0.5: string; 1: string; 1.5: string; 2: string; 2.5: string; 3: string; 3.5: string; 4: string;
    5: string; 6: string; 7: string; 8: string; 9: string; 10: string; 11: string; 12: string;
    14: string; 16: string; 20: string; 24: string; 28: string; 32: string; 36: string; 40: string;
    44: string; 48: string; 52: string; 56: string; 60: string; 64: string; 72: string; 80: string; 96: string;
    112: string; 128: string;
  }
  
  interface BorderWidths {
    none: string; hairline: string; thin: string; medium: string; thick: string; heavy: string;
  }
  
  interface RadiiScale {
    none: string; xs: string; sm: string; md: string; lg: string; xl: string;
    '2xl': string; '3xl': string; full: string;
  }
  
  interface ZIndices {
    hide: number; base: number; content: number; sticky: number; scrim: number;
    dropdown: number; modal: number; drawer: number; popover: number;
    tooltip: number; toast: number; max: number;
  }
  
  interface BreakpointsValues {
    xs: number; sm: number; md: number; lg: number; xl: number; '2xl': number;
  }
  interface Breakpoints extends BreakpointsValues {
    xsPx: string; smPx: string; mdPx: string; lgPx: string; xlPx: string; '2xlPx': string;
  }
  
  interface Transitions {
    duration: {
      short: string; standard: string; complex: string;
      enteringScreen: string; leavingScreen: string;
    };
    easing: {
      easeInOut: string; easeOut: string; easeIn: string; sharp: string;
    };
  }
  
  interface OpacityValues {
    disabledContent: number;
    disabledBg: number;
    hoverInteraction: number;
    selectedInteraction: number;
    focusedInteraction: number;
    pressedInteraction: number;
    scrim: number;
    '0': number; '5': number; '10': number; '15': number; '20': number; '25': number; '30': number; '35': number; '40': number; '45': number; '50': number;
    '55': number; '60': number; '65': number; '70': number; '75': number; '80': number; '85': number; '90': number; '95': number; '100': number;
  }
  
  export interface AppTheme {
    palette: {
      light: ModeSpecificPalette;
      dark: ModeSpecificPalette;
    };
    typography: TypographySettings;
    spacing: SpacingScale;
    borderWidths: BorderWidths;
    radii: RadiiScale;
    zIndices: ZIndices;
    breakpoints: Breakpoints;
    transitions: Transitions;
    opacity: OpacityValues;
    layout: {
      contentMaxWidth: string;
      containerPaddingX: string;
    };
  }
  
  // -------------------------
  // THEME DEFINITION
  // -------------------------
  
  // --- Common Color Scales ---
  const commonGrayScale: ColorScale = {
    50:  '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF',
    500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827', 950: '#030712',
  };
  const commonBlueScale: ColorScale = {
    50:  '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD', 400: '#60A5FA',
    500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A', 950: '#172554',
  };
  const commonGreenScale: ColorScale = {
    50:  '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0', 300: '#86EFAC', 400: '#4ADE80',
    500: '#22C55E', 600: '#16A34A', 700: '#15803D', 800: '#166534', 900: '#14532D', 950: '#052E16',
  };
  const commonYellowScale: ColorScale = {
    50:  '#FEFDF2', 100: '#FEF9C3', 200: '#FEF08A', 300: '#FDE047', 400: '#FACC15',
    500: '#EAB308', 600: '#CA8A04', 700: '#A16207', 800: '#854D0E', 900: '#713F12', 950: '#422006',
  };
  const commonRedScale: ColorScale = {
    50:  '#FEF2F2', 100: '#FEE2E2', 200: '#FECACA', 300: '#FCA5A5', 400: '#F87171',
    500: '#EF4444', 600: '#DC2626', 700: '#B91C1C', 800: '#991B1B', 900: '#7F1D1D', 950: '#450A0A',
  };
  const commonPurpleScale: ColorScale = {
    50:  '#FAF5FF', 100: '#F3E8FF', 200: '#E9D5FF', 300: '#D8B4FE', 400: '#C084FC',
    500: '#A855F7', 600: '#9333EA', 700: '#7E22CE', 800: '#6B21A8', 900: '#581C87', 950: '#3B0764',
  };
  const commonPinkScale: ColorScale = {
    50:  '#FDF2F8', 100: '#FCE7F3', 200: '#FBCFE8', 300: '#F9A8D4', 400: '#F472B6',
    500: '#EC4899', 600: '#DB2777', 700: '#BE185D', 800: '#9D174D', 900: '#831843', 950: '#500724',
  };
  const commonOrangeScale: ColorScale = {
    50:  '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74', 400: '#FB923C',
    500: '#F97316', 600: '#EA580C', 700: '#C2410C', 800: '#9A3412', 900: '#7C2D12', 950: '#431407',
  };
  const commonTealScale: ColorScale = {
    50:  '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4', 400: '#2DD4BF',
    500: '#14B8A6', 600: '#0D9488', 700: '#0F766E', 800: '#115E59', 900: '#134E4A', 950: '#042F2E',
  };
  
  // --- Shadow Generation Function ---
  const createShadows = (baseColorRGB: string, umbraOpacity: number, penumbraOpacity: number, ambientOpacity: number) => ({
    baseColorRGB, umbraOpacity, penumbraOpacity, ambientOpacity,
    xs: `0 1px 2px 0 rgba(${baseColorRGB}, ${umbraOpacity})`,
    sm: `0 1px 3px 0 rgba(${baseColorRGB}, ${umbraOpacity}), 0 1px 2px -1px rgba(${baseColorRGB}, ${penumbraOpacity})`,
    md: `0 4px 6px -1px rgba(${baseColorRGB}, ${umbraOpacity}), 0 2px 4px -2px rgba(${baseColorRGB}, ${penumbraOpacity})`,
    lg: `0 10px 15px -3px rgba(${baseColorRGB}, ${umbraOpacity}), 0 4px 6px -4px rgba(${baseColorRGB}, ${penumbraOpacity})`,
    xl: `0 20px 25px -5px rgba(${baseColorRGB}, ${umbraOpacity}), 0 8px 10px -6px rgba(${baseColorRGB}, ${penumbraOpacity})`,
    '2xl': `0 25px 50px -12px rgba(${baseColorRGB}, ${umbraOpacity > 0.2 ? umbraOpacity : 0.25})`, // Ensure 2xl is significant
    inner: `inset 0 2px 4px 0 rgba(${baseColorRGB}, ${ambientOpacity})`,
  });
  
  
  // --- Light Mode Palette ---
  const lightPalette: ModeSpecificPalette = {
    mode: 'light',
    primary: { // Indigo
      lightest: '#E8EAF6', lighter: '#C5CAE9', light: '#7986CB', main: '#3F51B5',
      dark: '#303F9F', darker: '#283593', darkest: '#1A237E', contrastText: '#FFFFFF',
      hover: rgba('#3F51B5', 0.08), selected: rgba('#3F51B5', 0.12), active: rgba('#3F51B5', 0.16),
    },
    secondary: { // Pink
      lightest: '#FCE4EC', lighter: '#F8BBD0', light: '#F48FB1', main: '#E91E63',
      dark: '#C2185B', darker: '#AD1457', darkest: '#880E4F', contrastText: '#FFFFFF',
      hover: rgba('#E91E63', 0.08), selected: rgba('#E91E63', 0.12), active: rgba('#E91E63', 0.16),
    },
    accent: { // Cyan
      lightest: '#E0F7FA', lighter: '#B2EBF2', light: '#80DEEA', main: '#00BCD4',
      dark: '#00ACC1', darker: '#0097A7', darkest: '#006064', contrastText: '#000000',
    },
    bg: {
      default: commonGrayScale[50], paper: commonGrayScale[0], alt: commonGrayScale[100],
      inverse: commonGrayScale[900], overlay: rgba(commonGrayScale[950], 0.6),
    },
    text: {
      primary: commonGrayScale[900], secondary: commonGrayScale[700], tertiary: commonGrayScale[500],
      disabled: commonGrayScale[400], inverse: commonGrayScale[0], link: commonBlueScale[600], linkHover: commonBlueScale[700],
      placeholder: commonGrayScale[400],
    },
    border: {
      default: commonGrayScale[300], subtle: commonGrayScale[200], strong: commonGrayScale[400],
      focus: commonBlueScale[500], outline: commonGrayScale[700],
    },
    divider: commonGrayScale[200],
    ui: {
      hover: rgba(commonGrayScale[500], 0.08), selected: rgba(commonBlueScale[500], 0.1),
      active: rgba(commonBlueScale[500], 0.15), disabledBg: commonGrayScale[100],
      disabledContent: commonGrayScale[400], focusRing: rgba(commonBlueScale[500], 0.5),
    },
    status: {
      success: { main: commonGreenScale[600], light: commonGreenScale[400], dark: commonGreenScale[800], contrastText: '#FFFFFF' },
      warning: { main: commonOrangeScale[500], light: commonOrangeScale[300], dark: commonOrangeScale[700], contrastText: '#000000' },
      error:   { main: commonRedScale[600], light: commonRedScale[400], dark: commonRedScale[800], contrastText: '#FFFFFF' },
      info:    { main: commonTealScale[500], light: commonTealScale[300], dark: commonTealScale[700], contrastText: '#FFFFFF' },
      neutral: { main: commonGrayScale[500], light: commonGrayScale[300], dark: commonGrayScale[700], contrastText: '#FFFFFF' },
    },
    common: {
      black: '#000000', white: '#FFFFFF', transparent: 'transparent',
      gray: commonGrayScale, blue: commonBlueScale, green: commonGreenScale, yellow: commonYellowScale,
      red: commonRedScale, purple: commonPurpleScale, pink: commonPinkScale, orange: commonOrangeScale, teal: commonTealScale,
    },
    shadows: createShadows('0, 0, 0', 0.1, 0.07, 0.06),
  };
  
  // --- Dark Mode Palette ---
  const darkPalette: ModeSpecificPalette = {
    mode: 'dark',
    primary: { // Lighter Blue for Dark Mode
      lightest: commonBlueScale[800], lighter: commonBlueScale[700], light: commonBlueScale[400], main: commonBlueScale[500],
      dark: commonBlueScale[300], darker: commonBlueScale[200], darkest: commonBlueScale[100], contrastText: commonGrayScale[950],
      hover: rgba(commonBlueScale[400], 0.12), selected: rgba(commonBlueScale[400], 0.16), active: rgba(commonBlueScale[400], 0.20),
    },
    secondary: { // Lighter Purple for Dark Mode
      lightest: commonPurpleScale[800], lighter: commonPurpleScale[700], light: commonPurpleScale[400], main: commonPurpleScale[500],
      dark: commonPurpleScale[300], darker: commonPurpleScale[200], darkest: commonPurpleScale[100], contrastText: commonGrayScale[950],
      hover: rgba(commonPurpleScale[400], 0.12), selected: rgba(commonPurpleScale[400], 0.16), active: rgba(commonPurpleScale[400], 0.20),
    },
    accent: { // Lighter Teal for Dark Mode
      lightest: commonTealScale[800], lighter: commonTealScale[700], light: commonTealScale[300], main: commonTealScale[400],
      dark: commonTealScale[200], darker: commonTealScale[100], darkest: commonTealScale[50], contrastText: commonGrayScale[950],
    },
    bg: {
      default: commonGrayScale[900], paper: commonGrayScale[800], alt: commonGrayScale[950],
      inverse: commonGrayScale[100], overlay: rgba(commonGrayScale[50], 0.7),
    },
    text: {
      primary: commonGrayScale[50], secondary: commonGrayScale[300], tertiary: commonGrayScale[400],
      disabled: commonGrayScale[500], inverse: commonGrayScale[900], link: commonBlueScale[400], linkHover: commonBlueScale[300],
      placeholder: commonGrayScale[500],
    },
    border: {
      default: commonGrayScale[700], subtle: commonGrayScale[800], strong: commonGrayScale[600],
      focus: commonBlueScale[400], outline: commonGrayScale[200],
    },
    divider: commonGrayScale[700],
    ui: {
      hover: rgba(commonGrayScale[400], 0.12), selected: rgba(commonBlueScale[400], 0.15),
      active: rgba(commonBlueScale[400], 0.20), disabledBg: commonGrayScale[700],
      disabledContent: commonGrayScale[500], focusRing: rgba(commonBlueScale[400], 0.6),
    },
    status: {
      success: { main: commonGreenScale[400], light: commonGreenScale[300], dark: commonGreenScale[500], contrastText: commonGrayScale[950] },
      warning: { main: commonOrangeScale[400], light: commonOrangeScale[300], dark: commonOrangeScale[500], contrastText: commonGrayScale[950] },
      error:   { main: commonRedScale[400], light: commonRedScale[300], dark: commonRedScale[500], contrastText: commonGrayScale[950] },
      info:    { main: commonTealScale[400], light: commonTealScale[300], dark: commonTealScale[500], contrastText: commonGrayScale[950] },
      neutral: { main: commonGrayScale[400], light: commonGrayScale[600], dark: commonGrayScale[200], contrastText: commonGrayScale[950] },
    },
    common: {
      black: '#000000', white: '#FFFFFF', transparent: 'transparent',
      gray: commonGrayScale, blue: commonBlueScale, green: commonGreenScale, yellow: commonYellowScale,
      red: commonRedScale, purple: commonPurpleScale, pink: commonPinkScale, orange: commonOrangeScale, teal: commonTealScale,
    },
    shadows: createShadows('0, 0, 0', 0.2, 0.14, 0.12), // Shadows might be slightly stronger or use a different base in dark mode
  };
  
  // --- Typography ---
  const typography: TypographySettings = {
    fontFamilyPrimary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontFamilySecondary: 'Lora, Georgia, Cambria, "Times New Roman", Times, serif',
    fontFamilyMonospace: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    rootFontSizePercentage: '100%',
    baseBodySize: '1rem',
    fontSizes: {
      '3xs': '0.5rem', '2xs': '0.625rem', xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem',
      '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem', '6xl': '3.75rem', '7xl': '4.5rem',
    },
    fontWeights: {
      thin: 100, extralight: 200, light: 300, regular: 400, medium: 500,
      semibold: 600, bold: 700, extrabold: 800, black: 900,
    },
    lineHeights: {
      none: 1, tighter: 1.125, tight: 1.25, snug: 1.375, normal: 1.5,
      relaxed: 1.75, loose: 2,
      '3': '.75rem', '4': '1rem', '5': '1.25rem', '6': '1.5rem', '7': '1.75rem', '8': '2rem', '9': '2.25rem', '10': '2.5rem',
    },
    letterSpacings: {
      tighter: '-0.05em', tight: '-0.025em', normal: '0em',
      wide: '0.025em', wider: '0.05em', widest: '0.1em',
    },
  };
  
  // --- Spacing (based on 4px grid, 1 unit = 0.25rem if base is 16px) ---
  const spacing: SpacingScale = {
    px: '1px', 0: '0', 0.5: '0.125rem', 1: '0.25rem', 1.5: '0.375rem',
    2: '0.5rem', 2.5: '0.625rem', 3: '0.75rem', 3.5: '0.875rem',
    4: '1rem', 5: '1.25rem', 6: '1.5rem', 7: '1.75rem',
    8: '2rem', 9: '2.25rem', 10: '2.5rem', 11: '2.75rem',
    12: '3rem', 14: '3.5rem', 16: '4rem', 20: '5rem',
    24: '6rem', 28: '7rem', 32: '8rem', 36: '9rem',
    40: '10rem', 44: '11rem', 48: '12rem', 52: '13rem',
    56: '14rem', 60: '15rem', 64: '16rem', 72: '18rem',
    80: '20rem', 96: '24rem', 112: '28rem', 128: '32rem',
  };
  
  // --- Borders & Radii ---
  const borderWidths: BorderWidths = {
    none: '0px', hairline: '0.5px', thin: '1px', medium: '2px', thick: '4px', heavy: '8px',
  };
  const radii: RadiiScale = {
    none: '0px', xs: '2px', sm: '4px', md: '8px', lg: '12px', xl: '16px',
    '2xl': '24px', '3xl': '32px', full: '9999px',
  };
  
  // --- Z-Indices ---
  const zIndices: ZIndices = {
    hide: -1, base: 0, content: 1, sticky: 100, scrim: 500, dropdown: 1000,
    modal: 1100, drawer: 1200, popover: 1300, tooltip: 1400, toast: 1500, max: 2147483647,
  };
  
  // --- Breakpoints ---
  const breakpointsValues: BreakpointsValues = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 };
  const breakpoints: Breakpoints = {
    ...breakpointsValues,
    xsPx: `${breakpointsValues.xs}px`, smPx: `${breakpointsValues.sm}px`, mdPx: `${breakpointsValues.md}px`,
    lgPx: `${breakpointsValues.lg}px`, xlPx: `${breakpointsValues.xl}px`, '2xlPx': `${breakpointsValues['2xl']}px`,
  };
  
  // --- Transitions & Opacity ---
  const transitions: Transitions = {
    duration: {
      short: '150ms', standard: '250ms', complex: '375ms',
      enteringScreen: '225ms', leavingScreen: '195ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)', sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  };
  const opacity: OpacityValues = {
    disabledContent: 0.4, disabledBg: 0.12,
    hoverInteraction: 0.08, selectedInteraction: 0.12,
    focusedInteraction: 0.12, pressedInteraction: 0.16,
    scrim: 0.6,
    '0': 0, '5': 0.05, '10': 0.1, '15': 0.15, '20': 0.2, '25': 0.25, '30': 0.3, '35': 0.35, '40': 0.4, '45': 0.45, '50': 0.5,
    '55': 0.55, '60': 0.6, '65': 0.65, '70': 0.7, '75': 0.75, '80': 0.8, '85': 0.85, '90': 0.9, '95': 0.95, '100': 1,
  };
  
  // --- Global Layout ---
  const layout = {
    contentMaxWidth: '1440px',
    containerPaddingX: spacing[6],
  };
  
  export const theme: AppTheme = {
    palette: {
      light: lightPalette,
      dark: darkPalette,
    },
    typography,
    spacing,
    borderWidths,
    radii,
    zIndices,
    breakpoints,
    transitions,
    opacity,
    layout,
  };
  

//   const { theme: appDefaultTheme } = require('./src/styles/theme');
  
//   // Helper to map semantic color suites to Tailwind color objects
//   function mapSemanticColors(suite) {
//     const colors = { DEFAULT: suite.main, ...suite };
//     delete colors.main; // Avoid duplicate 'main' and 'DEFAULT'
//     return colors;
//   }
  
//   module.exports = {
//     darkMode: 'class', // or 'media'
//     content: ["./src/**/\*.{js,jsx,ts,tsx}"],
//     theme: {
//       colors: { // Only light mode colors directly, dark mode via dark: prefix
//         transparent: 'transparent',
//         current: 'currentColor',
//         black: appDefaultTheme.palette.light.common.black,
//         white: appDefaultTheme.palette.light.common.white,
//         gray: appDefaultTheme.palette.light.common.gray,
//         blue: appDefaultTheme.palette.light.common.blue,
//         // ... other common scales from lightPalette.common
  
//         primary: mapSemanticColors(appDefaultTheme.palette.light.primary),
//         secondary: mapSemanticColors(appDefaultTheme.palette.light.secondary),
//         accent: appDefaultTheme.palette.light.accent ? mapSemanticColors(appDefaultTheme.palette.light.accent) : undefined,
  
//         // Semantic names
//         text: appDefaultTheme.palette.light.text,
//         bg: appDefaultTheme.palette.light.bg,
//         border: appDefaultTheme.palette.light.border.default, // Or map the whole border object
//         // ...etc.
//       },
//       extend: {
//         colors: { // Define dark mode colors here for use with `dark:` prefix
//           dark: { // This structure allows e.g. `dark:bg-primary-main`
//             primary: mapSemanticColors(appDefaultTheme.palette.dark.primary),
//             secondary: mapSemanticColors(appDefaultTheme.palette.dark.secondary),
//             accent: appDefaultTheme.palette.dark.accent ? mapSemanticColors(appDefaultTheme.palette.dark.accent) : undefined,
//             text: appDefaultTheme.palette.dark.text,
//             bg: appDefaultTheme.palette.dark.bg,
//             border: appDefaultTheme.palette.dark.border.default,
//             // ...etc. for dark mode
//           }
//         },
//         fontFamily: {
//           primary: appDefaultTheme.typography.fontFamilyPrimary.split(','),
//           secondary: appDefaultTheme.typography.fontFamilySecondary.split(','),
//           mono: appDefaultTheme.typography.fontFamilyMonospace.split(','),
//         },
//         fontSize: appDefaultTheme.typography.fontSizes,
//         fontWeight: appDefaultTheme.typography.fontWeights,
//         lineHeight: appDefaultTheme.typography.lineHeights,
//         letterSpacing: appDefaultTheme.typography.letterSpacings,
//         spacing: appDefaultTheme.spacing,
//         borderRadius: appDefaultTheme.radii,
//         borderWidth: appDefaultTheme.borderWidths,
//         boxShadow: { // Directly use the generated shadow strings
//           ...appDefaultTheme.palette.light.shadows, // Light mode shadows
//           // For dark mode shadows, you might need to define them with a 'dark-' prefix
//           // or handle them via CSS variables if Tailwind doesn't support complex dark mode shadow mapping easily.
//         },
//         zIndex: appDefaultTheme.zIndices,
//         screens: {
//           'xs': appDefaultTheme.breakpoints.xsPx,
//           'sm': appDefaultTheme.breakpoints.smPx,
//           'md': appDefaultTheme.breakpoints.mdPx,
//           'lg': appDefaultTheme.breakpoints.lgPx,
//           'xl': appDefaultTheme.breakpoints.xlPx,
//           '2xl': appDefaultTheme.breakpoints['2xlPx'],
//         },
//         transitionDuration: appDefaultTheme.transitions.duration,
//         transitionTimingFunction: appDefaultTheme.transitions.easing,
//         opacity: appDefaultTheme.opacity,
//         maxWidth: {
//           'content': appDefaultTheme.layout.contentMaxWidth,
//         },
//         container: {
//           center: true,
//           padding: {
//             DEFAULT: appDefaultTheme.layout.containerPaddingX,
//           }
//         }
//       },
//     },
//     plugins: [],
//   };
