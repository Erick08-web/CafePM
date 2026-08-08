export const palette = {
  espresso: "#1f2f24",
  forest: "#123d2f",
  pine: "#1f5a43",
  sage: "#6f8f79",
  cream: "#f7f1e7",
  crema: "#fffaf2",
  porcelain: "#fffdf8",
  latte: "#e8d7c1",
  oat: "#f0e5d6",
  mocha: "#5a3828",
  cacao: "#2b211c",
  caramel: "#b97842",
  copper: "#a95c3a",
  mint: "#2f8b64",
  blue: "#356c9f",
  red: "#a33c31",
  amber: "#d8943d",
  white: "#ffffff",
};

export const colors = {
  fondo: palette.cream,
  fondoAlt: "#efe4d2",
  oat: palette.oat,
  superficie: palette.porcelain,
  superficieElevada: palette.white,
  superficieMenta: "#edf7f1",
  superficieCoral: "#fbefea",
  superficieMiel: "#f8eddb",
  superficieOscura: palette.forest,
  borde: "#dfcfb9",
  bordeSuave: "#eee2d2",
  texto: palette.cacao,
  textoSuave: "#715f52",
  textoInvertido: "#fffaf0",
  cafe: palette.mocha,
  cafeOscuro: palette.cacao,
  verdeOscuro: palette.forest,
  verde: palette.mint,
  verdeFondo: "#e3f3ea",
  acento: palette.caramel,
  coral: palette.copper,
  azul: palette.blue,
  rojo: palette.red,
  rojoFondo: "#f8e4df",
  amarillo: palette.amber,
  amarilloFondo: "#fbefd9",
  sombra: "0 10px 26px rgba(31, 47, 36, 0.10)",
  sombraSuave: "0 4px 14px rgba(31, 47, 36, 0.07)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  "2xl": 26,
  pill: 999,
};

export const typography = {
  brand: 12,
  caption: 12,
  body: 15,
  bodyLarge: 16,
  title: 21,
  screenTitle: 32,
  hero: 36,
};

export const shadows = {
  none: "none",
  soft: colors.sombraSuave,
  card: colors.sombra,
  header: "0 16px 34px rgba(31, 61, 47, 0.12)",
};

export const states = {
  success: {
    text: colors.verde,
    background: colors.verdeFondo,
    border: "#bddfca",
  },
  warning: {
    text: "#8a5a17",
    background: colors.amarilloFondo,
    border: "#ead3a7",
  },
  danger: {
    text: colors.rojo,
    background: colors.rojoFondo,
    border: "#edc2ba",
  },
  neutral: {
    text: colors.textoSuave,
    background: colors.fondoAlt,
    border: colors.borde,
  },
  info: {
    text: colors.azul,
    background: "#e8f1f8",
    border: "#c2d8ea",
  },
};

export const theme = {
  colors,
  palette,
  radius,
  shadows,
  spacing,
  states,
  typography,
};
