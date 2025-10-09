import React, { useMemo, useState } from 'react';
import styled from 'styled-components/native';
import {
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import { useProfile } from '../../contexts/ProfileContext';
import SkipHeader from './components/SkipHeader';

export default function CountryStepScreen({ navigation }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const { profileData, updateProfile } = useProfile();

  const countries = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Cape Verde',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Colombia',
    'Comoros',
    'Congo',
    'Costa Rica',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czech Republic',
    'Democratic Republic of the Congo',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'East Timor',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Honduras',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Ivory Coast',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Kuwait',
    'Kyrgyzstan',
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'North Korea',
    'North Macedonia',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Qatar',
    'Romania',
    'Russia',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Korea',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Suriname',
    'Sweden',
    'Switzerland',
    'Syria',
    'Taiwan',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe',
  ].sort();

  const canProceed = selectedCountry !== '';
  const router = useRouter();

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsModalVisible(false);
  };

  const handleSkip = () => {
    router.push('./LangStepScreen');
  };

  const handleNext = () => {
    updateProfile('country', selectedCountry);
    router.push('./LangStepScreen');
    // router.push({
    //   pathname: './NextStepScreen',
    //   params: { selectedCountry },
    // });
  };

  const renderCountryItem = ({ item }) => (
    <CountryItem selected={selectedCountry === item} onPress={() => handleCountrySelect(item)}>
      <CountryText>{item}</CountryText>
      {selectedCountry === item && <AntDesign name="check" size={20} color="#02F59B" />}
    </CountryItem>
  );

  return (
    <SafeArea bgColor="#0F0F10">
      <StatusBar barStyle="light-content" />
      <Container>
        <SkipHeader onSkip={handleSkip} />
        <StepText>Step 3 / 9</StepText>

        <TitleWrapper>
          <Title>Select your</Title>
          <Title>country</Title>
        </TitleWrapper>

        <Subtitle>Better matches, smoother conversation</Subtitle>

        <Form>
          <DropdownButton selected={selectedCountry} onPress={() => setIsModalVisible(true)}>
            <DropdownText selected={selectedCountry !== ''}>{selectedCountry || 'Select your country'}</DropdownText>
            <AntDesign name="down" size={16} color="#949899" />
          </DropdownButton>
        </Form>

        <Spacer />
        <NextButton onPress={handleNext} disabled={!canProceed} canProceed={canProceed}>
          <ButtonText>Next</ButtonText>
        </NextButton>

        <BottomSpacer />
      </Container>

      {/* Country Selection Bottom Sheet */}
      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <ModalOverlay onPress={() => setIsModalVisible(false)} activeOpacity={1}>
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetHandle />
            </BottomSheetHeader>
            <FlatList
              data={countries}
              renderItem={renderCountryItem}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            />
          </BottomSheetContent>
        </ModalOverlay>
      </Modal>
    </SafeArea>
  );
}

// ------------------------
// Styled Components
// ------------------------
const SafeArea = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(props) => props.bgColor || '#000'};
`;

const Container = styled.View`
  flex: 1;
  padding: 0px 20px;
`;

const StepText = styled.Text`
  color: #5bd08d;
  font-size: 13px;
  letter-spacing: 0.2px;
  font-family: 'PlusJakartaSans-Regular';
  margin-top: 40px;
`;

const TitleWrapper = styled.View`
  margin-top: 30px;
`;

const Title = styled.Text`
  color: #ffffff;
  font-size: 40px;
  line-height: 45px;
  letter-spacing: 0.2px;
  font-family: 'InstrumentSerif-Regular';
`;

const Subtitle = styled.Text`
  margin-top: 15px;
  color: #949899;
  font-size: 15px;
  font-family: 'PlusJakartaSans-Light';
`;

const Form = styled.View`
  margin-top: 50px;
`;

const DropdownButton = styled.TouchableOpacity`
  width: 100%;
  height: 50px;
  border-radius: 8px;
  background-color: #353637;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px;
  border: 1px solid #4a4b4c;
  border-color: ${(props) => (props.selected ? '#02F59B99' : '#949899')};
`;

const DropdownText = styled.Text`
  color: ${(props) => (props.selected ? '#EDEDED' : '#949899')};
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
`;

const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const BottomSheetContent = styled.View`
  background-color: #353637;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  max-height: 60%;
  padding-bottom: 40px;
`;

const BottomSheetHeader = styled.View`
  align-items: center;
  padding: 20px 20px 10px 20px;
`;

const BottomSheetHandle = styled.View`
  width: 40px;
  height: 4px;
  background-color: #949899;
  border-radius: 2px;
  margin-bottom: 16px;
`;

const BottomSheetTitle = styled.Text`
  color: #ededed;
  font-size: 18px;
  font-weight: 600;
  font-family: 'PlusJakartaSans-SemiBold';
`;

const CountryItem = styled.TouchableOpacity`
  padding: 20px;
  border-bottom-width: 0.5px;
  border-bottom-color: #4a4b4c;
  margin: 0 20px;
  flex-direction: row;
  background-color: ${(props) => (props.selected ? '#4A4B4C' : 'transparent')};
  border-radius: ${(props) => (props.selected ? 12 : 0)}px;
`;

const CountryText = styled.Text`
  flex: 1;
  color: #ededed;
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
`;

const Spacer = styled.View`
  flex: 1;
`;

const NextButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #02f59b;
  margin-bottom: 8px;
  opacity: ${(props) => (props.canProceed ? 1 : 0.4)};
`;

const ButtonText = styled.Text`
  color: #1d1e1f;
  font-size: 15px;
  font-weight: 500;
  font-family: 'PlusJakartaSans-Medium';
`;

const BottomSpacer = styled.View`
  height: 25px;
`;
