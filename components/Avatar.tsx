import styled from 'styled-components/native';

type AvatarProps = {
    uri?: string;
};

export default function Avatar({ uri }: AvatarProps) {
    return (
        <StyledImage
            source={uri ? { uri } : require('@/assets/images/avatar-placeholder.png')}
        />
    );
}

const StyledImage = styled.Image`
    margin: 15px 15px;
    `;