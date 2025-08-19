import Avatar from '@/components/Avatar';
import CustomButton from '@/components/CustomButton';
import React from 'react';
import styled from 'styled-components/native';

type Props = {
    user: { id: number; name: string; country?: string; bio?: string };
    variant: 'received' | 'sent';
    onAccept?: () => void;
    onReject?: () => void;
    onChat?: () => void;
};

export default function UserCard({ user, variant, onAccept, onReject, onChat }: Props) {
    return (
        <Card>
            <Row>
                <Avatar />
                <Main>
                    <Name>{user.name}</Name>
                    {!!user.country && <Meta>{user.country}</Meta>}
                    {!!user.bio && <Bio numberOfLines={2}>{user.bio}</Bio>}
                </Main>
            </Row>

            {variant === 'received' ? (
                <BtnRow>
                    <CustomButton label="Accept" tone="mint" filled onPress={onAccept} />
                    <CustomButton label="Decline" tone="black" filled={false} onPress={onReject} />
                    <CustomButton label="Chat" tone="black" filled onPress={onChat} />
                </BtnRow>
            ) : (
                <BtnRow>
                    <CustomButton label="Chat" tone="black" filled onPress={onChat} />
                </BtnRow>
            )}
        </Card>
    );
}

const Card = styled.View`
  background-color: #ffffff;
  border-radius: 14px;
  padding: 14px;
  gap: 10px;
`;
const Row = styled.View`flex-direction:row;gap:12px;`;
const Main = styled.View`flex:1;justify-content:center;`;
const Name = styled.Text`font-size:16px;color:#111;font-family:'PlusJakartaSans_700Bold';`;
const Meta = styled.Text`font-size:12px;color:#666;font-family:'PlusJakartaSans_400Regular';margin-top:2px;`;
const Bio = styled.Text`font-size:12px;color:#333;font-family:'PlusJakartaSans_400Regular';margin-top:4px;`;
const BtnRow = styled.View`flex-direction:row;gap:10px;`;
