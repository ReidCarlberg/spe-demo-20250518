// Brand-specific Fluent UI v9 themes for Boulder Innovations
// Light and Dark variants with a modern feel.
import { createLightTheme, createDarkTheme, webLightTheme, webDarkTheme } from '@fluentui/react-components';

// Brand ramp (corporate blue-centric)
const brand = {
  10: '#001D33', // darkest
  20: '#002B4A',
  30: '#003B63',
  40: '#004D7D',
  50: '#005F96',
  60: '#0F6CBD', // core brand (matches MS blue accent)
  70: '#1C7FD2',
  80: '#2E91E4',
  90: '#4AA3EE',
  100: '#63B4F6' // lightest
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
    ? 'linear-gradient(160deg,#0A1620,#102A3A 60%)'
    : 'linear-gradient(160deg,#F4F9FC,#FFFFFF 60%)';
