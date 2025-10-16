import React from 'react';
import AlarmOn from '@/assets/icons/alarmOn.svg';
import { theme } from '@/src/styles/theme';

// TODO 일부 아이콘(알림, 좋아요, 카메라 아이콘 등)은 status props 추가

/**
 * ----------- Icon 추가하는 방법 ------------ *
 * 1. figma에서 아이콘을 svg로 export합니다.
 * 2. /assets/icon 폴더에 저장합니다.
 * 3. 저장한 파일을 React 컴포넌트로 import합니다. (기존 import문 참고해주세요)
 * 4. iconMap에 type으로 사용할 key와 컴포넌트명을 작성합니다.
 */

const iconMap = {
  alarmOn: AlarmOn,
};

export type IconType = keyof typeof iconMap;

interface IconProps {
  size: 16 | 20 | 24;
  type: IconType;
  color?: string;
}

/**
 * type에 아이콘의 타입을 전달하면 해당하는 svg 아이콘을 반환합니다.
 * - size: 아이콘 크기 (16, 20, 24(px))
 * - type: 아이콘 종류
 * - color: 아이콘 색상
 */
const Icon = ({ size, type, color = theme.colors.primary.white }: IconProps) => {
  const SelectedIcon = iconMap[type];

  return <SelectedIcon width={size} height={size} color={color} />;
};

export default Icon;
