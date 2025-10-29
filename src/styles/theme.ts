/* ------------ color styles ------------ */
const colors = {
  primary: {
    mint: '#02F59B',
    purple: '#9E70FF',
    black: '#1D1E1F',
    white: '#FFFFFF',
  },

  secondary: {
    red: '#FF4F4F',
    blue: '#49CCEA',
    // gradient: 'linear-gradient(45deg, #02F59B, #44C6E9, #9E70FF)', // TODO React Native 그라디언트 적용
  },

  gray: {
    darkBlack_1: '#171818',
    darkGray_1: '#353637',
    darkGray_1_5: '#414142',
    darkGray_2: '#616262',
    gray_1: '#848687',
    gray_2: '#949899',
    lightGray_1: '#CCCFD0',
    lightGray_2: '#E9E9E9',
  },
};

/* -------------- font styles -------------- */
// font family를 상수로 선언
const FONT_FAMILY = {
  PlusJakartaSans: {
    Light: 'PlusJakartaSans_300Light',
    Regular: 'PlusJakartaSans_400Regular',
    Medium: 'PlusJakartaSans_500Medium',
    SemiBold: 'PlusJakartaSans_600SemiBold',
    Bold: 'PlusJakartaSans_700Bold',
  },

  InstrumentSerif: {
    Regular: 'InstrumentSerif_400Regular',
  },
} as const;

// font type
type Font = {
  fontFamily: keyof typeof FONT_FAMILY;
  size: number;
  weight: string;
  lineHeight: number;
};

// font 상수를 생성하는 함수
const FONT = ({ fontFamily, size, weight, lineHeight }: Font) => {
  return {
    fontFamily: (FONT_FAMILY[fontFamily] as any)[weight],
    fontSize: size,
    lineHeight: lineHeight,
  };
};

// font style에 따라 fonts 선언
const fonts = {
  headline: {
    H1_B: FONT({ fontFamily: 'PlusJakartaSans', size: 36, weight: 'Bold', lineHeight: 43 }),
    H1_SB: FONT({ fontFamily: 'PlusJakartaSans', size: 36, weight: 'SemiBold', lineHeight: 43 }),
    H2_B: FONT({ fontFamily: 'PlusJakartaSans', size: 28, weight: 'Bold', lineHeight: 34 }),
    H2_SB: FONT({ fontFamily: 'PlusJakartaSans', size: 28, weight: 'SemiBold', lineHeight: 34 }),
    H3_SB: FONT({ fontFamily: 'PlusJakartaSans', size: 24, weight: 'SemiBold', lineHeight: 30 }),
    H3_M: FONT({ fontFamily: 'PlusJakartaSans', size: 24, weight: 'Medium', lineHeight: 30 }),
    H4_SB: FONT({ fontFamily: 'PlusJakartaSans', size: 20, weight: 'SemiBold', lineHeight: 26 }),
    H4_M: FONT({ fontFamily: 'PlusJakartaSans', size: 20, weight: 'Medium', lineHeight: 26 }),
  },

  body: {
    B1_SB: FONT({ fontFamily: 'PlusJakartaSans', size: 18, weight: 'SemiBold', lineHeight: 23 }),
    B2_SB: FONT({ fontFamily: 'PlusJakartaSans', size: 16, weight: 'SemiBold', lineHeight: 22 }),
    B2_M: FONT({ fontFamily: 'PlusJakartaSans', size: 16, weight: 'Medium', lineHeight: 22 }),
    B2_R: FONT({ fontFamily: 'PlusJakartaSans', size: 16, weight: 'Regular', lineHeight: 22 }),
    B3_M: FONT({ fontFamily: 'PlusJakartaSans', size: 15, weight: 'Medium', lineHeight: 20 }),
    B3_R: FONT({ fontFamily: 'PlusJakartaSans', size: 15, weight: 'Regular', lineHeight: 20 }),
    B3_L: FONT({ fontFamily: 'PlusJakartaSans', size: 15, weight: 'Light', lineHeight: 20 }),
    B4_SB: FONT({ fontFamily: 'PlusJakartaSans', size: 14, weight: 'SemiBold', lineHeight: 18 }),
    B4_M: FONT({ fontFamily: 'PlusJakartaSans', size: 14, weight: 'Medium', lineHeight: 18 }),
    B4_R: FONT({ fontFamily: 'PlusJakartaSans', size: 14, weight: 'Regular', lineHeight: 18 }),
    B4_L: FONT({ fontFamily: 'PlusJakartaSans', size: 14, weight: 'Light', lineHeight: 19 }),
    B5_SB: FONT({ fontFamily: 'PlusJakartaSans', size: 13, weight: 'SemiBold', lineHeight: 17 }),
    B5_M: FONT({ fontFamily: 'PlusJakartaSans', size: 13, weight: 'Medium', lineHeight: 17 }),
    B5_R: FONT({ fontFamily: 'PlusJakartaSans', size: 13, weight: 'Regular', lineHeight: 17 }),
  },

  small: {
    small_SB: FONT({ fontFamily: 'PlusJakartaSans', size: 11, weight: 'SemiBold', lineHeight: 14 }),
    small_M: FONT({ fontFamily: 'PlusJakartaSans', size: 11, weight: 'Medium', lineHeight: 14 }),
    small_L: FONT({ fontFamily: 'PlusJakartaSans', size: 11, weight: 'Light', lineHeight: 14 }),
  },

  Serif: {
    H1_R: FONT({ fontFamily: 'InstrumentSerif', size: 40, weight: 'Regular', lineHeight: 46 }),
    H2_R: FONT({ fontFamily: 'InstrumentSerif', size: 36, weight: 'Regular', lineHeight: 41 }),
    H3_R: FONT({ fontFamily: 'InstrumentSerif', size: 32, weight: 'Regular', lineHeight: 38 }),
    H4_R: FONT({ fontFamily: 'InstrumentSerif', size: 28, weight: 'Regular', lineHeight: 35 }),
  },
};

/* -------------- default theme -------------- */
export const theme = {
  colors,
  fonts,
};

export type ColorType = typeof colors;
export type FontType = typeof fonts;

// export type ThemeType = typeof theme;

/**
 * Styled Text에서 빠르게 텍스트 스타일을 적용할 수 있는 함수입니다.
 *
 * @예시
 *
 * ```tsx
 * const Title = styled.Text`
 *   ${({ theme }) => textStyle(theme.fonts.headline.H1_SB)};
 *   color: ${({ theme }) => theme.colors.primary.white};
 * `;
 * ```
 */
export const textStyle = (font: any) => `
  font-family: ${font.fontFamily};
  font-size: ${font.fontSize}px;
  line-height: ${font.lineHeight}px;
`;
