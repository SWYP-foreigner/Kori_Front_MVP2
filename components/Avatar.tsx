import styled from 'styled-components/native';

type AvatarProps = {
    uri?: string;
    size?: number; // 옵션
};

export default function Avatar({ uri, size = 120 }: AvatarProps) {
    return (
        <StyledImage
            source={uri ? { uri } : require('@/assets/images/avatar-placeholder.png')}
            $size={size}
        />
    );
}

const StyledImage = styled.Image<{ $size: number }>`
  margin: 15px 15px;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
`;
