// src/styles/styled.d.ts
import 'styled-components/native';
import type { theme } from './theme';

type AppTheme = typeof theme;

declare module 'styled-components/native' {
  export interface DefaultTheme extends AppTheme {}
}
