import Icon from '@/components/common/Icon';
import { theme } from '@/src/styles/theme';
import { LANGUAGES } from '@/src/utils/languages';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { useProfile } from '../../contexts/ProfileContext';
import SkipHeader from './components/SkipHeader';
export default function LanguageStepScreen({ navigation }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const { profileData, updateProfile } = useProfile();

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
        {isSelected && <Icon type="check" size={16} color={theme.colors.primary.mint} />}
      </LanguageItem>
    );
  };

  return (
    <SafeArea bgColor="#0F0F10">
      <StatusBar barStyle="light-content" />
      <Container>
        <SkipHeader onSkip={handleSkip} />
        <StepText>Step 4 / 9</StepText>

        <TitleWrapper>
          <Title>Which language</Title>
          <Title>do you speak?</Title>
        </TitleWrapper>

        <Subtitle>You can select up to 5 language.</Subtitle>

        <Form>
          <DropdownButton selected={selectedLanguages.length > 0} onPress={() => setIsModalVisible(true)}>
            <DropdownText selected={selectedLanguages.length > 0}>{getDisplayText()}</DropdownText>
            <RotatedIcon>
              <Icon type="next" size={16} color={theme.colors.gray.gray_1} />
            </RotatedIcon>
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

      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <ModalOverlay onPress={() => setIsModalVisible(false)} activeOpacity={1}>
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetHandle />
            </BottomSheetHeader>

            <LanguageList
              data={LANGUAGES}
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
  color: ${theme.colors.primary.mint};
  font-size: 13px;
  letter-spacing: 0.2px;
  font-family: 'PlusJakartaSans-Regular';
  margin-top: 40px;
`;

const TitleWrapper = styled.View`
  margin-top: 30px;
`;

const Title = styled.Text`
  color: ${theme.colors.primary.white};
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

const DropdownButton = styled.TouchableOpacity<{ selected: boolean }>`
  width: 100%;
  height: 50px;
  border-radius: 8px;

  background-color: ${theme.colors.gray.darkGray_1};

  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px;

  border-width: 1px;
  border-color: ${(p) => (p.selected ? theme.colors.primary.mint : theme.colors.gray.gray_1)};
`;

const DropdownText = styled.Text`
  color: ${(p) => (p.selected ? theme.colors.primary.white : theme.colors.gray.gray_1)};
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
  color: ${theme.colors.primary.white};
  font-size: 12px;
  font-family: 'PlusJakartaSans-Medium';
`;

const SelectionCount = styled.Text`
  color: ${theme.colors.primary.mint};
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

const RotatedIcon = styled.View`
  transform: rotate(90deg); /* next(→)를 아래(↓)로 회전 */
`;
