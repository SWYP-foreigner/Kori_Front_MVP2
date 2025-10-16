import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native';

/* --------------- Global Styles ---------------
 * 자주 사용하는 Styled Component를 한번에 관리하는 파일입니다.
 * 컴포넌트나 페이지별로 동일한 컴포넌트를 중복으로 선언하는 것을 방지하고,
 * 불필요한 코드 중복을 줄여 가독성을 높일 수 있습니다.
 * 확장이 필요한 경우, 원하는 컴포넌트에서 Global Styles를 확장해 사용합니다.
 */

/**
 * 컴포넌트 설명...
 */
export const Safe = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary.background};
`;
