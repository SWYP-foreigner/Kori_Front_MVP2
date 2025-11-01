import AlarmOff from '@/assets/icons/alarm-off.svg';
import AlarmOn from '@/assets/icons/alarm-on.svg';
import Alert from '@/assets/icons/alert.svg';
import ArrowDown from '@/assets/icons/arrow-down.svg';
import ArrowUp from '@/assets/icons/arrow-up.svg';
import Bookmark from '@/assets/icons/bookmark-non-selected.svg';
import SelectedBookmark from '@/assets/icons/bookmark-selected.svg';
import Box from '@/assets/icons/box.svg';
import Business from '@/assets/icons/business.svg';
import CameraColored from '@/assets/icons/camera-colored.svg';
import CameraDefault from '@/assets/icons/camera-default.svg';
import Chat from '@/assets/icons/chat.svg';
import CheckGrayBox from '@/assets/icons/check-gray-box.svg';
import CheckMintBox from '@/assets/icons/check-mint-box.svg';
import Check from '@/assets/icons/check.svg';
import CloseBox from '@/assets/icons/close-box.svg';
import Close from '@/assets/icons/close.svg';
import Comment from '@/assets/icons/comment.svg';
import CommentArrow from '@/assets/icons/comment_arrow.svg';
import Edit from '@/assets/icons/edit.svg';
import Eclipsis from '@/assets/icons/ellipsis.svg';
import EclipsisGaro from '@/assets/icons/ellipsis_garo.svg';
import Eye from '@/assets/icons/eye.svg';
import FemaleColored from '@/assets/icons/female-color.svg';
import Female from '@/assets/icons/female.svg';
import Global from '@/assets/icons/global.svg';
import Hamburger from '@/assets/icons/hamburger.svg';
import HeartNonSelected from '@/assets/icons/heart-non-selected.svg';
import HeartSelected from '@/assets/icons/heart-selected.svg';
import Info from '@/assets/icons/info.svg';
import Link from '@/assets/icons/link.svg';
import Mail from '@/assets/icons/mail.svg';
import MaleColored from '@/assets/icons/male-color.svg';
import Male from '@/assets/icons/male.svg';
import Next from '@/assets/icons/next.svg';
import Nogender from '@/assets/icons/nogender.svg';
import Notice from '@/assets/icons/notice.svg';
import Pagination1 from '@/assets/icons/pagination_status=1.svg';
import Pagination2 from '@/assets/icons/pagination_status=2.svg';
import Pagination3 from '@/assets/icons/pagination_status=3.svg';
import Person from '@/assets/icons/person.svg';
import Photo from '@/assets/icons/photo.svg';
import Plus from '@/assets/icons/Plus.svg';
import Previous from '@/assets/icons/previous.svg';
import Purpose from '@/assets/icons/purpose.svg';
import Search from '@/assets/icons/search.svg';
import Send from '@/assets/icons/send.svg';
import Setting from '@/assets/icons/setting.svg';
import Share from '@/assets/icons/share.svg';
import StatusOn from '@/assets/icons/status=on.svg';
import ThumbsUpNonSelected from '@/assets/icons/thumbs-up-non-selected.svg';
import ThumbsUpSelected from '@/assets/icons/thumbs-up-selected.svg';
import Translate from '@/assets/icons/translate.svg';
import TrashCan from '@/assets/icons/trash can.svg';
import { theme } from '@/src/styles/theme';
import React from 'react';

const iconMap = {
  alarmOff: AlarmOff,
  alarmOn: AlarmOn,
  alert: Alert,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  business: Business,
  bookmarkNonSelected: Bookmark,
  bookmarkSelected: SelectedBookmark,
  cameraColored: CameraColored,
  cameraDefault: CameraDefault,
  check: Check,
  close: Close,
  chat: Chat,
  comment: Comment,
  commentArrow: CommentArrow,
  edit: Edit,
  eclipsis: Eclipsis,
  eclipsisGaro: EclipsisGaro,
  eye: Eye,
  female: Female,
  femaleColored: FemaleColored,
  global: Global,
  hamburger: Hamburger,
  heartNonSelected: HeartNonSelected,
  heartSelected: HeartSelected,
  info: Info,
  link: Link,
  mail: Mail,
  maleColored: MaleColored,
  male: Male,
  next: Next,
  nogender: Nogender,
  notice: Notice,
  plus: Plus,
  person: Person,
  photo: Photo,
  previous: Previous,
  purpose: Purpose,
  search: Search,
  send: Send,
  
  setting: Setting,
  share: Share,
  statusOn: StatusOn,
  thumbsUpNonSelected: ThumbsUpNonSelected,
  thumbsUpSelected: ThumbsUpSelected,
  translate: Translate,
  trashCan: TrashCan,
  page1: Pagination1,
  page2: Pagination2,
  page3: Pagination3,
  box: Box,
  checkMintBox: CheckMintBox,
  checkGrayBox: CheckGrayBox,
  closeBox: CloseBox,
};

/**
 * ----------- Icon 추가하는 방법 ------------ *
 * 1. figma에서 아이콘을 svg로 export합니다.
 * 2. /assets/icon 폴더에 저장합니다.
 * 3. 저장한 파일을 React 컴포넌트로 import합니다. (기존 import문 참고해주세요)
 * 4. iconMap에 type으로 사용할 key와 컴포넌트명을 작성합니다.
 */

export type IconType = keyof typeof iconMap;

interface IconProps {
  size: 16 | 20 | 24 | 32;
  type: IconType;
  color?: string;
}

/**
 * type에 아이콘의 타입을 전달하면 해당하는 svg 아이콘을 반환합니다.
 * - size: 아이콘 크기 (16, 20, 24, 32(px))
 * - type: 아이콘 종류
 * - color: 아이콘 색상
 */

// components/common/Icon.tsx
const Icon = ({ size, type, color = theme.colors.primary.white }: IconProps) => {
  const SelectedIcon = iconMap[type];

  if (!SelectedIcon) {
    // ✅ 어떤 type이 문제인지 + 호출 스택까지 로그
    const err = new Error(`[Icon] Unknown type: "${type}"`);
    // RN 콘솔에 깔끔히 찍히도록
    // eslint-disable-next-line no-console
    console.warn(err.message, { size, color });
    // eslint-disable-next-line no-console
    console.warn(err.stack);
    // 호출 경로를 한눈에
    // eslint-disable-next-line no-console
    console.trace('[Icon] call trace');
    return null;
  }

  return <SelectedIcon width={size} height={size} color={color} />;
};


export default Icon;