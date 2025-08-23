import React from "react";
import styled from "styled-components/native";


const NewSpaceCreated=()=>{
    return(
            <Background  source={require("@/assets/images/background2.png")}
                    resizeMode="cover">
                <ProfileBox>
                    <ProfileImage source={require("@/assets/images/character2.png")}/>
                </ProfileBox>
                <TextBox>
                    <BigText>New Spaces Created</BigText>
                    <SmallText>Bring people together and share your interests</SmallText>
                </TextBox>
                 <NextButton>
                    <ButtonText>Done</ButtonText>
                    </NextButton>

                <BottomSpacer/>
            </Background>
    );

}

export default NewSpaceCreated;


const Background = styled.ImageBackground`
  flex: 1;
  justify-content:flex-start;
  align-items: center;
  padding-top: 200px;     
`;
const ProfileBox=styled.View`
    width:150px;
    height:150px;
`;
const ProfileImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode:contain;
`;

const TextBox=styled.View`
    margin-top:80px;
    height:100px;
    align-items:center;
    justify-content:center;
`;
const BigText=styled.Text`
    color:#ffffff;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:24px;
`;
const SmallText=styled.Text`
    color:#949899;
    font-family:PlusJakartaSans_400Regular;
    font-size:13px;
    margin-top:7px;
`;

const NextButton = styled.TouchableOpacity`
  width:90%;
  height:50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #02F59B;
  margin:150px;
`;

const ButtonText = styled.Text`
  color: #1D1E1F;
  font-size: 15px;
  font-family: PlusJakartaSans_500Medium;

`;

const BottomSpacer = styled.View`
  height: 25px;
`;
