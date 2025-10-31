import { useProfile } from '@/app/contexts/ProfileContext';
import Icon from '@/components/common/Icon';
import { theme } from '@/src/styles/theme';
import { COUNTRIES } from '@/src/utils/countries';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, SafeAreaView, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import SkipHeader from './components/SkipHeader';

export default function CountryStepScreen({ navigation }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [search, setSearch] = useState('');
  const { profileData, updateProfile } = useProfile();

  const isSelected = selectedCountry !== '';
  const canProceed = selectedCountry !== '';
  const router = useRouter();

  // 검색 기능 추가
  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    return COUNTRIES.filter((country) => country.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsModalVisible(false);
    setSearch(''); // 모달 닫을 때 검색창 초기화
  };

  const handleSkip = () => {
    router.push('./LangStepScreen');
  };

  const handleNext = () => {
    if (canProceed) {
      updateProfile('country', selectedCountry);
      router.push('./LangStepScreen');
    }
  };

  const renderCountryItem = ({ item }) => (
    <CountryItem selected={selectedCountry === item} onPress={() => handleCountrySelect(item)}>
      <CountryText>{item}</CountryText>
      {selectedCountry === item && <Icon type="check" size={20} color={theme.colors.primary.mint} />}
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
          <DropdownButton selected={isSelected} onPress={() => setIsModalVisible(true)}>
            <DropdownText selected={selectedCountry !== ''}>{selectedCountry || 'Select your country'}</DropdownText>
            <RotatedIcon>
              <Icon type="next" size={16} color={theme.colors.gray.gray_1} />
            </RotatedIcon>
          </DropdownButton>
        </Form>

        <Spacer />
        <NextButton onPress={handleNext} disabled={!canProceed}>
          <ButtonText>Next</ButtonText>
        </NextButton>

        <BottomSpacer />
      </Container>

      {/* Country Selection Bottom Sheet */}
      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <ModalOverlay onPress={() => setIsModalVisible(false)} activeOpacity={1}>
          <BottomSheetContent onStartShouldSetResponder={() => true}>
            <BottomSheetHeader>
              <BottomSheetHandle />
              <SearchContainer>
                <AntDesign name="search1" size={16} color="#949899" />
                <SearchInput
                  placeholder="Search your country"
                  placeholderTextColor="#616262"
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <ClearButton onPress={() => setSearch('')}>
                    <AntDesign name="close" size={16} color="#949899" />
                  </ClearButton>
                )}
              </SearchContainer>
            </BottomSheetHeader>
            {filteredCountries.length > 0 ? (
              <FlatList
                data={filteredCountries}
                renderItem={renderCountryItem}
                keyExtractor={(item, index) => `${item}-${index}`}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
              />
            ) : (
              <NoResultText>No countries found</NoResultText>
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
const SafeArea = styled(SafeAreaView) <{ bgColor?: string }>`
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

const DropdownButton = styled.TouchableOpacity<{ selected: boolean }>`
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

const DropdownText = styled.Text<{ selected: boolean }>`
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
  max-height: 70%;
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

const SearchContainer = styled.View`
  width: 95%;
  height: 44px;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  padding: 0px 12px;
  background-color: #2a2b2d;
  border-width: 1px;
  border-color: #4a4b4c;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  margin-left: 8px;
  color: #ededed;
  font-size: 18px;
  font-weight: 600;
  font-family: 'PlusJakartaSans-SemiBold';
`;

const CountryItem = styled.TouchableOpacity<{ selected: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: 14px 16px;
  margin-vertical: 6px;

  /* 선택됐을 때 캡슐 형태 */
  background-color: ${({ selected }) => (selected ? '#3F4041' : 'transparent')};
  border-radius: 12px;
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

const NextButton = styled.TouchableOpacity<{ canProceed: boolean }>`
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: #02f59b;
  margin-bottom: 8px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
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

const RotatedIcon = styled.View`
  transform: rotate(90deg); /* next(→)를 아래(↓)로 회전 */
`;
