import { DarkTheme, type Theme } from '@react-navigation/native';

export const THEME = {
  background: 'hsl(0 0% 3.9%)',
  foreground: 'hsl(0 0% 98%)',
  card: 'hsl(0 0% 3.9%)',
  cardForeground: 'hsl(0 0% 98%)',
  popover: 'hsl(0 0% 3.9%)',
  popoverForeground: 'hsl(0 0% 98%)',
  primary: 'hsl(0 0% 98%)',
  primaryForeground: 'hsl(0 0% 9%)',
  secondary: 'hsl(0 0% 14.9%)',
  secondaryForeground: 'hsl(0 0% 98%)',
  muted: 'hsl(0 0% 14.9%)',
  mutedForeground: 'hsl(0 0% 63.9%)',
  accent: 'hsl(0 0% 14.9%)',
  accentForeground: 'hsl(0 0% 98%)',
  destructive: 'hsl(0 70.9% 59.4%)',
  border: 'hsl(0 0% 14.9%)',
  input: 'hsl(0 0% 14.9%)',
  ring: 'hsl(300 0% 45%)',
  radius: '0.625rem',
  chart1: 'hsl(220 70% 50%)',
  chart2: 'hsl(160 60% 45%)',
  chart3: 'hsl(30 80% 55%)',
  chart4: 'hsl(280 65% 60%)',
  chart5: 'hsl(340 75% 55%)',
};

export const NAV_THEME: Theme = {
  ...DarkTheme,
  colors: {
    background: THEME.background,
    border: THEME.border,
    card: THEME.card,
    notification: THEME.destructive,
    primary: THEME.primary,
    text: THEME.foreground,
  },
};
