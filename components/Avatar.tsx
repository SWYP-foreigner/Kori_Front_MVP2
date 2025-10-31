// components/Avatar.tsx
import ProfileImage from '@/components/common/ProfileImage';
import styled from 'styled-components/native';

type AvatarProps = { uri?: string; size?: number; bg?: string };

export default function Avatar({ uri, size = 120, bg = '#2a2f33' }: AvatarProps) {
  return (
    <Frame $size={size} $bg={bg}>
      <Img
        source={uri ? { uri } : require('@/assets/images/avatar-placeholder.png')}
        resizeMode="cover"
      />
    </Frame>
  );
}

const Frame = styled.View<{ $size: number; $bg: string }>`
  margin: 15px;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
  overflow: hidden;
  background-color: ${({ $bg }) => $bg};
`;

const Img = styled(ProfileImage)`
  width: 100%;
  height: 100%;
`;
