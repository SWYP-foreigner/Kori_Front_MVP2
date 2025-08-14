import styled from 'styled-components/native';

type StyledImageProps = {
    size: number;
}

type AvatarProps = {
    uri?: string;
    size?: number;
};

export default function Avatar({ uri, size = 80 }: AvatarProps) {
    return (
        <StyledImage
            source={uri ? { uri } : require('@/assets/images/avatar-placeholder.png')}
            size={size}
        />
    );
}

const StyledImage = styled.Image<StyledImageProps>`
    background-color: #eee;
    width: ${({ size }: StyledImageProps) => size}px;
    height: ${({ size }: StyledImageProps) => size}px;
    border-radius: ${({ size }: StyledImageProps) => size / 2}px;
`;