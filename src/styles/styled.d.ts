import 'styled-components/native';
import type { ThemeType } from './theme';

declare module 'styled-components/native' {
  export interface DefaultTheme extends ThemeType {}
}
