import 'styled-components/native';
import { ColorType, FontType, ThemeType } from './theme';

declare module 'styled-components/native' {
  export interface DefaultTheme extends ThemeType {
    colors: ColorType;
    fonts: FontType;
  }
}
