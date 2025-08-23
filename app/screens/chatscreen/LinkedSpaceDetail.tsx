import React from "react";
import styled from "styled-components/native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView } from "react-native";


const LinkedSpaceDetail=()=>{

    return(
        <Container>
            <BackgroundContainer>
                <Background
                    source={require("@/assets/images/background1.png")}
                    resizeMode="contain"> 
                    <ProfileBox>
                        <ProfileImage source={require("@/assets/images/character3.png")} />
                    </ProfileBox>
                </Background>  
            </BackgroundContainer>
            <DetailContainer>
                <DetailTopContainer>
                    <TitleContainer>
                        <TitleText>Hiking Club</TitleText>
                    </TitleContainer>
                    <MembersTextContainer>
                        <MembersText>Members</MembersText>
                    </MembersTextContainer>
                    <HostContainer>
                       <HostImageBox>
                        <HostImage  source={require("@/assets/images/character3.png")}/>
                       </HostImageBox>
                       <HostNameText>Kim Kori</HostNameText>
                       <HostBox>
                        <HostText>Host</HostText>
                       </HostBox>
                    </HostContainer>
                    <MembersContainer>
                        <InMemberContainer>
                            <MaterialIcons name="person-outline" size={15} color="#949899" />
                            <InMemberText>4 members in</InMemberText>
                            <Divider/>
                        </InMemberContainer>
                        <MemberImageContainer>
                            <MembersBox>
                            <MemberImageBox>
                                 <MemberImage source={require("@/assets/images/character3.png")}/>
                            </MemberImageBox>
                            <MemberImageBox>
                                 <MemberImage source={require("@/assets/images/character3.png")}/>
                            </MemberImageBox>
                            <MemberImageBox>
                                 <MemberImage source={require("@/assets/images/character3.png")}/>
                            </MemberImageBox>
                            <MemberImageBox>
                                 <MemberImage source={require("@/assets/images/character3.png")}/>
                            </MemberImageBox>
                            </MembersBox>
                            <MemberCountText>+4</MemberCountText>
                        </MemberImageContainer>
                    </MembersContainer>
                </DetailTopContainer>
                <DetailDivider/>
                <DetailBottomContainer>
                    <BottomTitleContainer>
                        <BottomTitleText>Space Introduction </BottomTitleText>
                    </BottomTitleContainer>
                    <BottomContentContainer>
                        <BottomContent>
                            Hello~anyone that loves to hike can join this chat! We regulary do an
                            offline meeting every two weeks and go to any random mountains near Seoul.
                        </BottomContent>
                    </BottomContentContainer>
                </DetailBottomContainer>
                    <NextButton>
                    <ButtonText>Next</ButtonText>
                    </NextButton>

                <BottomSpacer/>
            </DetailContainer>
        </Container>
    );


};



export default LinkedSpaceDetail;

const Container=styled.View`
    flex:1;
     background-color: #1d1e1f;
`;
const BackgroundContainer=styled.View`
    flex:1.2;
`;
const Background = styled.ImageBackground`
  flex: 1;
  justify-content: center;  /* ProfileBox 세로 정렬 */
  align-items: center;      /* ProfileBox 가로 정렬 */
`;

const ProfileBox=styled.View`
    width:50%;
    height:50%;
    align-items:center;
    justify-content:center;

`;
const ProfileImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode:contain;
`;
const DetailContainer=styled.View`
    flex:2;
`;

const DetailTopContainer=styled.View`
    flex:1.7;
    margin-left:10px;
    
`;
const TitleContainer=styled.View`
    height:25%;
    justify-content:center;
`;
const TitleText=styled.Text`
    font-family:PlusJakartaSans_600SemiBold;
    color:#ffffff;
    font-size:24px;
    margin-left:10px;
    
`;
const MembersTextContainer=styled.View`
    height:20%;
    justify-content:center;
    
`;
const MembersText=styled.Text`
    margin-left:10px;
    font-family:PlusJakartaSans_500Medium;
    font-size:13px;
    color:#848687;
`;
const HostContainer=styled.View`
    height:30%;
    flex-direction:row;
    align-items:center;
`;
const HostImageBox=styled.View`
    width:20%;
`;
const HostImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode: contain;
`;
const HostNameText=styled.Text`
    font-size:15px;
    margin-left:12px;
    font-family: PlusJakartaSans_500Medium;
    color:#FFFFFF;
`;
const HostBox=styled.View`
    background-color:#02F59B40;
    margin-left:15px;
    border-radius:4px;
    justify-content:center;
    align-items:center;
`;
const HostText=styled.Text`
    font-family:PlusJakartaSans_500Medium;
    color:#FFFFFF;
    padding:6px 5px 6px 5px;
    font-size:11px;
`;
const MembersContainer=styled.View`
    flex:1;
    flex-direction:row;
`;
const InMemberContainer=styled.View`
    margin-left:10px;
    width:30%;
    align-items:center;
    flex-direction:row;
`;
const InMemberText=styled.Text`
    margin-left:3px;
    color:#949899;
    font-family:PlusJakartaSans_600SemiBold;
    font-size:11px;
`;

const Divider=styled.View`
    height:12px;
    width:1px;
    background-color:#616262;
    margin-left:11px;
`;
const MemberImageContainer=styled.View`
    width:50%;
    flex-direction:row;
    align-items:center;
    `;
const MembersBox=styled.View`
    height:30px;
    flex-direction:row;
`;
const MemberImageBox=styled.View`
    width:30px;
    height:30px;
    flex-direction:row;    
`;
const MemberImage=styled.Image`
    width:100%;
    height:100%;
    resize-mode: contain;
`;
const MemberCountText=styled.Text`
    color:#CCCFD0;
    font-size:11px;
    font-family:PlusJakartaSans_600SemiBold; 
    margin-left:5px;   
`;
const DetailDivider=styled.View`
    height:4px;
    background-color:#353637;
    margin:10px 0px;
`;
const DetailBottomContainer=styled.View`
    flex:2;
    margin-left:10px;
`;
const BottomTitleContainer=styled.View`
    height:40px;
    justify-content:center;
`;
const BottomTitleText=styled.Text`
    color:#848687;
    font-family: PlusJakartaSans_500Medium;
    font-size:13px;
`;
const BottomContentContainer=styled.View`
    height:100%;
`;
const BottomContent=styled.Text`
    color:#FFFFFF;
    font-family:PlusJakartaSans_300Light;
    font-size:15px;
`;

const NextButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #02F59B;
  margin:10px;
`;

const ButtonText = styled.Text`
  color: #1D1E1F;
  font-size: 15px;
  font-weight: 500;
  font-family: 'PlusJakartaSans-Medium';

`;

const BottomSpacer = styled.View`
  height: 25px;
`;

