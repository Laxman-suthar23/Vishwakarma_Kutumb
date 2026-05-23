export const COLORS = {
  // Primary - Temple Maroon
  maroon: {
    50: '#fdf2f2',
    100: '#fce8e8',
    200: '#f8d0d0',
    300: '#f2a8a8',
    400: '#e87070',
    500: '#d94040',
    600: '#c22020',
    700: '#8B1A1A',
    800: '#6B1414',
    900: '#3D0C11',
    950: '#2A0808',
  },

  // Accent - Sacred Saffron
  saffron: {
    50: '#fff8ed',
    100: '#ffefd4',
    200: '#ffdba8',
    300: '#ffc070',
    400: '#ff9a35',
    500: '#FF7D00',
    600: '#F07000',
    700: '#C75A00',
    800: '#9E4500',
  },

  // Highlight - Temple Gold
  gold: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#FBBF24',
    500: '#D4A017',
    600: '#B8860B',
    700: '#9A6E00',
    dark: '#8B6914',
    light: '#F5D06E',
    metallic: '#CFB53B',
  },

  // Background - Cream & Beige
  cream: {
    50: '#FEFDF8',
    100: '#FDF8EC',
    200: '#FAF0D4',
    300: '#F5E6B8',
    400: '#EDD69A',
    500: '#E4C67C',
  },

  sandal: {
    100: '#F5EDD6',
    200: '#EDD9AD',
    300: '#DEC58A',
    400: '#C9A96E',
    500: '#A07850',
    600: '#7D5A3C',
  },

  // Semantic
  success: '#2D7A3A',
  error: '#C0392B',
  warning: '#E67E22',
  info: '#2471A3',

  // Neutrals
  white: '#FFFFFF',
  black: '#1A0A00',
  gray: {
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
} as const;

export const GRADIENTS = {
  maroonGold: ['#3D0C11', '#6B1414', '#8B1A1A'],
  saffronGold: ['#FF7D00', '#D4A017', '#B8860B'],
  creamWarm: ['#FDF8EC', '#F5E6B8', '#EDD9AD'],
  goldenHour: ['#3D0C11', '#8B1A1A', '#D4A017'],
  templeWall: ['#F5E6B8', '#EDD9AD', '#DEC58A'],
  dawn: ['#3D0C11', '#8B4513', '#D4A017'],
  lotus: ['#FFF0F5', '#FFD0DD', '#FFB0C0'],
} as const;
