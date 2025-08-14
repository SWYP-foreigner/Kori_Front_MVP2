import styled from "styled-components/native";

type ProfileBubbleProps = {
    bio: string;
}

function ProfileBubble({ bio }: ProfileBubbleProps) {
    return (
        <SpeechBubble>
            <SpeechText numberOfLines={2}>{bio}</SpeechText>
        </SpeechBubble>
    )
}

const SpeechBubble = styled.View`
  background-color: #DDDDDD;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 25px;
  max-width: 50%;
`;

const SpeechText = styled.Text`
  font-size: 12px;
  text-align: center;
`;

export default ProfileBubble;
