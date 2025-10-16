import React from 'react';
import AlarmOff from '@/assets/icons/alarm-off.svg';
import AlarmOn from '@/assets/icons/alarm-on.svg';
import Alert from '@/assets/icons/alert.svg';
import CameraColored from '@/assets/icons/camera-colored.svg';
import CameraDefault from '@/assets/icons/camera-default.svg';
import Check from '@/assets/icons/check.svg';
import Close from '@/assets/icons/close.svg';
import Comment from '@/assets/icons/comment.svg';
import CommentArrow from '@/assets/icons/comment_arrow.svg';
import Edit from '@/assets/icons/edit.svg';
import Eye from '@/assets/icons/eye.svg';
import Female from '@/assets/icons/female.svg';
import Global from '@/assets/icons/global.svg';
import Hamburger from '@/assets/icons/hamburger.svg';
import HeartNonSelected from '@/assets/icons/heart-non-selected.svg';
import Info from '@/assets/icons/info.svg';
import Link from '@/assets/icons/link.svg';
import Mail from '@/assets/icons/mail.svg';
import Male from '@/assets/icons/male.svg';
import Next from '@/assets/icons/next.svg';
import Nogender from '@/assets/icons/nogender.svg';
import Notice from '@/assets/icons/notice.svg';
import Person from '@/assets/icons/person.svg';
import Photo from '@/assets/icons/photo.svg';
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

const iconMap = {
  alarmOff: AlarmOff,
  alarmOn: AlarmOn,
  alert: Alert,
  cameraColored: CameraColored,
  cameraDefault: CameraDefault,
  check: Check,
  close: Close,
  comment: Comment,
  commentArrow: CommentArrow,
  edit: Edit,
  eye: Eye,
  female: Female,
  global: Global,
  hamburger: Hamburger,
  heartNonSelected: HeartNonSelected,
  info: Info,
  link: Link,
  mail: Mail,
  male: Male,
  next: Next,
  nogender: Nogender,
  notice: Notice,
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
