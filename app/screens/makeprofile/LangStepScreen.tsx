import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, Modal, FlatList, TouchableOpacity, Alert } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import { useProfile } from '../../contexts/ProfileContext';

export default function LanguageStepScreen({ navigation }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const { profileData, updateProfile } = useProfile();

  const languages = [
    'Abkhaz [AB]',
    'Acehnese [ACE]',
    'Acholi [ACH]',
    'Afrikaans [AF]',
    'Albanian [SQ]',
    'Alur [ALZ]',
    'Amharic [AM]',
    'Arabic [AR]',
    'Armenian [HY]',
    'Assamese [AS]',
    'Awadhi [AWA]',
    'Aymara [AY]',
    'Azerbaijani [AZ]',
    'Balinese [BAN]',
    'Bambara [BM]',
    'Bashkir [BA]',
    'Basque [EU]',
    'Batak Karo [BTX]',
    'Batak Simalungun [BTS]',
    'Batak Toba [BBC]',
    'Belarusian [BE]',
    'Bemba [BEM]',
    'Bengali [BN]',
    'Betawi [BEW]',
    'Bhojpuri [BHO]',
    'Bikol [BIK]',
    'Bosnian [BS]',
    'Breton [BR]',
    'Bulgarian [BG]',
    'Buryat [BUA]',
    'Cantonese [YUE]',
    'Catalan [CA]',
    'Cebuano [CEB]',
    'Chichewa [NY]',
    'Chinese (Simplified) [ZH-CN]',
    'Chinese (Traditional) [ZH-TW]',
    'Chuvash [CV]',
    'Corsican [CO]',
    'Crimean Tatar [CRH]',
    'Croatian [HR]',
    'Czech [CS]',
    'Danish [DA]',
    'Dinka [DIN]',
    'Divehi [DV]',
    'Dogri [DOI]',
    'Dombe [DOV]',
    'Dutch [NL]',
    'Dzongkha [DZ]',
    'English [EN]',
    'Esperanto [EO]',
    'Estonian [ET]',
    'Ewe [EE]',
    'Fijian [FJ]',
    'Filipino [FIL]',
    'Finnish [FI]',
    'French [FR]',
    'French (French) [FR-FR]',
    'French (Canadian) [FR-CA]',
    'Frisian [FY]',
    'Fulfulde [FF]',
    'Ga [GAA]',
    'Galician [GL]',
    'Ganda [LG]',
    'Georgian [KA]',
    'German [DE]',
    'Greek [EL]',
    'Guarani [GN]',
    'Gujarati [GU]',
    'Haitian Creole [HT]',
    'Hakha Chin [CNH]',
    'Hausa [HA]',
    'Hawaiian [HAW]',
    'Hebrew [IW]',
    'Hiligaynon [HIL]',
    'Hindi [HI]',
    'Hmong [HMN]',
    'Hungarian [HU]',
    'Hunsrik [HRX]',
    'Icelandic [IS]',
    'Igbo [IG]',
    'Iloko [ILO]',
    'Indonesian [ID]',
    'Irish [GA]',
    'Italian [IT]',
    'Japanese [JA]',
    'Javanese [JW]',
    'Kannada [KN]',
    'Kapampangan [PAM]',
    'Kazakh [KK]',
    'Khmer [KM]',
    'Kiga [CGG]',
    'Kinyarwanda [RW]',
    'Kituba [KTU]',
    'Konkani [GOM]',
    'Korean [KO]',
    'Krio [KRI]',
    'Kurdish (Kurmanji) [KU]',
    'Kurdish (Sorani) [CKB]',
    'Kyrgyz [KY]',
    'Lao [LO]',
    'Latgalian [LTG]',
    'Latin [LA]',
    'Latvian [LV]',
    'Ligurian [LIJ]',
    'Limburgan [LI]',
    'Lingala [LN]',
    'Lithuanian [LT]',
    'Lombard [LMO]',
    'Luo [LUO]',
    'Luxembourgish [LB]',
    'Macedonian [MK]',
    'Maithili [MAI]',
    'Makassar [MAK]',
    'Malagasy [MG]',
    'Malay [MS]',
    'Malay (Jawi) [MS-ARAB]',
    'Malayalam [ML]',
    'Maltese [MT]',
    'Maori [MI]',
    'Marathi [MR]',
    'Meadow Mari [CHM]',
    'Meiteilon [MNI-MTEI]',
    'Minang [MIN]',
    'Mizo [LUS]',
    'Mongolian [MN]',
    'Myanmar (Burmese) [MY]',
    'Ndebele (South) [NR]',
    'Nepalbhasa [NEW]',
    'Nepali [NE]',
    'Northern Sotho [NSO]',
    'Norwegian [NO]',
    'Nuer [NUS]',
    'Occitan [OC]',
    'Odia [OR]',
    'Oromo [OM]',
    'Pangasinan [PAG]',
    'Papiamento [PAP]',
    'Pashto [PS]',
    'Persian [FA]',
    'Polish [PL]',
    'Portuguese [PT]',
    'Portuguese (Portugal) [PT-PT]',
    'Portuguese (Brazil) [PT-BR]',
    'Punjabi [PA]',
    'Punjabi (Shahmukhi) [PA-ARAB]',
    'Quechua [QU]',
    'Romani [ROM]',
    'Romanian [RO]',
    'Rundi [RN]',
    'Russian [RU]',
    'Samoan [SM]',
    'Sango [SG]',
    'Sanskrit [SA]',
    'Scots Gaelic [GD]',
    'Serbian [SR]',
    'Sesotho [ST]',
    'Seychellois Creole [CRS]',
    'Shan [SHN]',
    'Shona [SN]',
    'Sicilian [SCN]',
    'Silesian [SZL]',
    'Sindhi [SD]',
    'Sinhala [SI]',
    'Slovak [SK]',
    'Slovenian [SL]',
    'Somali [SO]',
    'Spanish [ES]',
    'Sundanese [SU]',
    'Swahili [SW]',
    'Swati [SS]',
    'Swedish [SV]',
    'Tajik [TG]',
    'Tamil [TA]',
    'Tatar [TT]',
    'Telugu [TE]',
    'Tetum [TET]',
    'Thai [TH]',
    'Tigrinya [TI]',
    'Tsonga [TS]',
    'Tswana [TN]',
    'Turkish [TR]',
    'Turkmen [TK]',
    'Twi [AK]',
    'Ukrainian [UK]',
    'Urdu [UR]',
    'Uyghur [UG]',
    'Uzbek [UZ]',
    'Vietnamese [VI]',
    'Welsh [CY]',
    'Xhosa [XH]',
    'Yiddish [YI]',
    'Yoruba [YO]',
    'Yucatec Maya [YUA]',
    'Zulu [ZU]',
  ].sort();

  const canProceed = selectedLanguages.length > 0;
  const router = useRouter();

  const handleLanguageSelect = (language) => {
    if (selectedLanguages.includes(language)) {
      // 이미 선택된 언어면 제거
      setSelectedLanguages(selectedLanguages.filter((lang) => lang !== language));
    } else if (selectedLanguages.length < 5) {
      // 최대 5개까지만 선택 가능
      setSelectedLanguages([...selectedLanguages, language]);
    } else {
      // 5개 초과 선택시 경고
      Alert.alert('Maximum Selection', 'You can select up to five languages!');
    }
  };

  const handleNext = () => {
    console.log('Selected languages:', selectedLanguages);
    updateProfile('language', selectedLanguages);
    router.push('./AboutMeStepScreen');
  };

  const handleSkip = () => {
    router.push({
      pathname: './AboutMeStepScreen',
    });
  };

  const getDisplayText = () => {
    if (selectedLanguages.length === 0) {
      return 'Select your language';
    } else {
      // 언어 코드만 추출해서 표시
      const codes = selectedLanguages.map((lang) => {
        const match = lang.match(/\(([^)]+)\)/);
        return match ? match[1] : lang;
      });
      return codes.join(' / ');
    }
  };

  const renderLanguageItem = ({ item }) => {
    const isSelected = selectedLanguages.includes(item);

    return (
      <LanguageItem selected={isSelected} onPress={() => handleLanguageSelect(item)}>
        <LanguageText>{item}</LanguageText>
        {isSelected && <AntDesign name="check" size={20} color="#02F59B" />}
      </LanguageItem>
    );
  };

  return (
    <SafeArea bgColor="#0F0F10">
      <StatusBar barStyle="light-content" />
      <Container>
        <StepText>Step 4 / 9</StepText>

        <TitleWrapper>
          <Title>Which language</Title>
          <Title>do you speak?</Title>
        </TitleWrapper>

        <Subtitle>You can select up to 5 language.</Subtitle>

        <Form>
          <DropdownButton selected={selectedLanguages.length > 0} onPress={() => setIsModalVisible(true)}>
            <DropdownText selected={selectedLanguages.length > 0}>{getDisplayText()}</DropdownText>
            <AntDesign name="down" size={16} color="#949899" />
          </DropdownButton>

          {selectedLanguages.length > 0 && (
            <SelectionInfo>
              <SelectionCount>{selectedLanguages.length}/5 selected</SelectionCount>
            </SelectionInfo>
          )}
        </Form>

        <Spacer />

        <ButtonContainer hasSelection={canProceed}>
          <NextButton onPress={handleNext} disabled={!canProceed} canProceed={canProceed}>
            <ButtonText>Next</ButtonText>
          </NextButton>
          {!canProceed && (
            <SkipButton onPress={handleSkip}>
              <SkipText>Skip</SkipText>
            </SkipButton>
          )}
        </ButtonContainer>

        <BottomSpacer />
      </Container>

      {/* Language Selection Bottom Sheet */}
      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <ModalOverlay onPress={() => setIsModalVisible(false)} activeOpacity={1}>
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetHandle />
            </BottomSheetHeader>

            <LanguageList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />

            {selectedLanguages.length >= 5 && (
              <MaxSelectionWarning>
                <AntDesign name="closecircle" size={16} color="#FF6B6B" />
                <WarningText>You can select up to five languages!</WarningText>
              </MaxSelectionWarning>
            )}
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
  border: 1px solid ${(props) => (props.selected ? '#02F59B99' : '#949899')};
`;

const DropdownText = styled.Text`
  color: ${(props) => (props.selected ? '#EDEDED' : '#949899')};
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
  flex: 1;
`;

const SelectionInfo = styled.View`
  margin-top: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

const SelectionText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-family: 'PlusJakartaSans-Medium';
`;

const SelectionCount = styled.Text`
  color: #02f59b;
  font-size: 13px;
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
  max-height: 70%;
  padding-bottom: 20px;
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
`;

const LanguageList = styled(FlatList)`
  max-height: 400px;
  padding: 0 20px;
`;

const LanguageItem = styled.TouchableOpacity`
  padding: 16px 0;
  border-bottom-width: 0.5px;
  border-bottom-color: #4a4b4c;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LanguageText = styled.Text`
  color: #ededed;
  font-size: 16px;
  font-family: 'PlusJakartaSans-Regular';
  flex: 1;
`;

const MaxSelectionWarning = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background-color: rgba(255, 107, 107, 0.1);
  margin: 0 20px;
  border-radius: 8px;
  margin-top: 16px;
`;

const WarningText = styled.Text`
  color: #ff6b6b;
  font-size: 14px;
  font-family: 'PlusJakartaSans-Regular';
  margin-left: 8px;
`;

const Spacer = styled.View`
  flex: 1;
`;

const ButtonContainer = styled.View`
  margin-bottom: ${(props) => (props.hasSelection ? '20px' : '0px')};
  gap: 12px;
`;

const NextButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #02f59b;
  opacity: ${(props) => (props.canProceed ? 1 : 0.4)};
`;

const ButtonText = styled.Text`
  color: #1d1e1f;
  font-size: 15px;
  font-weight: 500;
  font-family: 'PlusJakartaSans-Medium';
`;

const SkipButton = styled.TouchableOpacity`
  height: 44px;
  align-items: center;
  justify-content: center;
`;

const SkipText = styled.Text`
  color: #949899;
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
`;

const BottomSpacer = styled.View`
  height: 25px;
`;
