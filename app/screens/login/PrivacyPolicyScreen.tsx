import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import {
  StatusBar,
  TouchableOpacity,
  ScrollView
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";


const PrivacyPolicyScreen=()=>{
    const router=useRouter();

    return(
        <SafeArea>
      <StatusBar barStyle="light-content" />
        <Container>
          <HeaderContainer>
            <HeaderBox>
              <TouchableOpacity onPress={() => router.back()}>
                <Feather name="arrow-left" size={23} color="#CCCFD0" />
              </TouchableOpacity>
              <HeaderTitleText>Privacy Policy</HeaderTitleText>
            </HeaderBox>
          </HeaderContainer>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 50 , paddingTop: 10}} // 원하는 만큼 여백
          >
          <TermsAndContionsContent>
                          <HighlightText>Privacy Policy{"\n"}</HighlightText>         
                This privacy policy applies to the Kori app (hereby referred to as "Application") for mobile devices that was created by Yeonji Ku (hereby referred to as "Service Provider") as an Ad Supported service. This service is intended for use "AS IS".
                Information Collection and Use
                The Application collects information when you download and use it. This information may include information such as
                {"\n"}•   Your device's Internet Protocol address (e.g. IP address)
                {"\n"}•   The pages of the Application that you visit, the time and date of your visit, the time spent on those pages
                {"\n"}•   The time spent on the Application
                {"\n"}•   The operating system you use on your mobile device
                {"\n"}The Application does not gather precise information about the location of your mobile device.

                {"\n"}{"\n"}{"\n"}The Application collects your device's location, which helps the Service Provider determine your approximate geographical location and make use of in below ways:
                {"\n"}•   Geolocation Services: The Service Provider utilizes location data to provide features such as personalized content, relevant recommendations, and location-based services.
                {"\n"}•   Analytics and Improvements: Aggregated and anonymized location data helps the Service Provider to analyze user behavior, identify trends, and improve the overall performance and functionality of the Application.
                {"\n"}•   Third-Party Services: Periodically, the Service Provider may transmit anonymized location data to external services. These services assist them in enhancing the Application and optimizing their offerings.
                 {"\n"}The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices and marketing promotions.
                For a better experience, while using the Application, the Service Provider may require you to provide us with certain personally identifiable information, including but not limited to email. The information that the Service Provider request will be retained by them and used as described in this privacy policy.

                 <HighlightText>{"\n"} {"\n"} {"\n"}Third Party Access {"\n"}</HighlightText>
                Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service. The Service Provider may share your information with third parties in the ways that are described in this privacy statement.

                The Service Provider may disclose User Provided and Automatically Collected Information:
                {"\n"}•as required by law, such as to comply with a subpoena, or similar legal process;
                {"\n"}•when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;
                {"\n"}•with their trusted services providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement.

                <HighlightText>{"\n"}{"\n"}{"\n"}Opt-Out Rights{"\n"}</HighlightText>
                You can stop all collection of information by the Application easily by uninstalling it. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.

                <HighlightText>{"\n"}{"\n"}{"\n"}Data Retention Policy{"\n"}</HighlightText>
                The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you'd like them to delete User Provided Data that you have provided via the Application, please contact them at koriservice12@gmail.com and they will respond in a reasonable time.
                Children
                The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
                The Service Provider does not knowingly collect personally identifiable information from children. The Service Provider encourages all children to never submit any personally identifiable information through the Application and/or Services. The Service Provider encourage parents and legal guardians to monitor their children's Internet usage and to help enforce this Policy by instructing their children never to provide personally identifiable information through the Application and/or Services without their permission. If you have reason to believe that a child has provided personally identifiable information to the Service Provider through the Application and/or Services, please contact the Service Provider (koriservice12@gmail.com) so that they will be able to take the necessary actions. You must also be at least 16 years of age to consent to the processing of your personally identifiable information in your country (in some countries we may allow your parent or guardian to do so on your behalf).
                Security
                The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.
                Changes
                This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
                This privacy policy is effective as of 2025-08-26
                Your Consent
                By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.
                Contact Us
                If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at koriservice12@gmail.com.
                This privacy policy page was generated by App Privacy Policy Generator

          </TermsAndContionsContent>
          </ScrollView>
          </Container>
          </SafeArea>


    );
};


export default PrivacyPolicyScreen;


const SafeArea = styled.SafeAreaView`
  flex: 1;
  background-color: #1d1e1f;
`;

const Container = styled.View`
  flex: 1;
  background-color: #1d1e1f;
  padding: 0px 15px;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  height: 10%;
  align-items: center;
`;

const HeaderBox = styled.View`
  flex-direction: row;
  width: 66%;
  height: 50px;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitleText = styled.Text`
  color: #ffffff;
  font-family: PlusJakartaSans_500Medium;
  font-size: 16px;
`;

const TermsAndContionsContent=styled.Text`
    color:#FFFFFF;
    font-size:10px;
    font-family:PlusJakartaSans_300Light;

`;
const HighlightText=styled.Text`
     color:#FFFFFF;
    font-size:11px;
    font-family:PlusJakartaSans_700Bold;

`;