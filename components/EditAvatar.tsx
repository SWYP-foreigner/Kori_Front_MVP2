import styled from 'styled-components/native';

type AvatarProps = {
    uri?: string;
};

export default function EditAvatar({ uri }: AvatarProps) {
    return (
        <StyledImage
            source={uri ? { uri } : require('@/assets/images/editprofile.png')}
        />
    );
}

const StyledImage = styled.Image`
    margin: 15px 15px;
    width: 152px;
    height: 152px;
    `;