// Brand-specific Fluent UI v9 themes for SPE Demo
// Light and Dark variants with a modern feel.
import { createLightTheme, createDarkTheme, webLightTheme, webDarkTheme } from '@fluentui/react-components';

// Brand ramp (purple-centric)
const brand = {
  10: '#2A0A3F',
  20: '#3A1156',
  30: '#4A166C',
  40: '#5A1C83',
  50: '#6A239B',
  60: '#7A2BB3',
  70: '#8A37CA',
  80: '#9A45E0',
  90: '#AA55F5',
  100: '#B669FF'
};

const baseLight = createLightTheme(webLightTheme);
const baseDark = createDarkTheme(webDarkTheme);

// Shared adjustments
const modern = {
  borderRadiusSmall: '6px',
  borderRadiusMedium: '10px',
  borderRadiusLarge: '16px',
  fontFamilyBase: "'Segoe UI Variable Text','Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif",
  shadow2: '0 2px 4px rgba(0,0,0,.05)',
  shadow4: '0 4px 14px rgba(0,0,0,.10)',
  shadow8: '0 8px 28px rgba(0,0,0,.14)'
};

export const speLightTheme = {
  ...baseLight,
  ...brand,
  ...modern,
  colorBrandForeground1: brand[80],
  colorBrandForegroundLink: brand[70],
  colorBrandBackground: brand[70],
  colorBrandBackgroundHover: brand[60],
  colorBrandBackgroundPressed: brand[80],
  colorBrandBackground2: brand[10],
  colorBrandStroke1: brand[60],
  colorNeutralBackground1: '#F7F8FA',
  colorNeutralBackground2: '#FFFFFF',
  colorNeutralStroke1: '#E2E5EA'
};

export const speDarkTheme = {
  ...baseDark,
  ...brand,
  ...modern,
  colorBrandForeground1: brand[90],
  colorBrandForegroundLink: brand[80],
  colorBrandBackground: brand[60],
  colorBrandBackgroundHover: brand[50],
  colorBrandBackgroundPressed: brand[70],
  colorBrandBackground2: brand[20],
  colorBrandStroke1: brand[50],
  colorNeutralBackground1: '#121317',
  colorNeutralBackground2: '#1C1E23',
  colorNeutralStroke1: '#2E3238'
};

export const getGradientBackground = (mode) =>
  mode === 'dark'
    ? 'linear-gradient(160deg,#121317,#1C1E23 60%)'
    : 'linear-gradient(160deg,#F7F8FA,#FFFFFF 60%)';
