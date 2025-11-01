import cancelIconImg from '@/assets/images/cancel.png';
import searchIconImg from '@/assets/images/search.png';
import Icon from '@/components/common/Icon';
import { theme } from '@/src/styles/theme';
import { LANGUAGES } from '@/src/utils/languages';
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

export const MAX_LANGUAGES = 5;

type Props = {
  visible: boolean;
  value: string[];
  onClose: () => void;
  onChange: (next: string[]) => void;
  languages?: string[];
};

export default function LanguagePicker({ visible, value, onClose, onChange, languages }: Props) {
  const [search, setSearch] = useState('');

  const OPTIONS = useMemo(() => {
    const list = (languages ?? LANGUAGES).slice().sort();
    if (!search.trim()) return list;
    return list.filter((lang) => lang.toLowerCase().includes(search.toLowerCase()));
  }, [languages, search]);

  const toggle = (lang: string) => {
    const exists = value.includes(lang);
    if (exists) {
      onChange(value.filter((v) => v !== lang));
    } else {
      if (value.length >= MAX_LANGUAGES) return;
      onChange([...value, lang]);
    }
  };

  const renderItem = ({ item }: { item: string }) => {
    const selected = value.includes(item);
    return (
      <LanguageItem selected={selected} onPress={() => toggle(item)}>
        <LanguageText>{item}</LanguageText>
        {selected && <Icon type="check" size={20} color={theme.colors.primary.mint} />}
      </LanguageItem>
    );
  };

  const handleSearchPress = () => {
    console.log('Searching:', search);
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ModalOverlay onPress={onClose} activeOpacity={1}>
        <BottomSheet onStartShouldSetResponder={() => true}>
          <BottomSheetHeader>
            <BottomSheetHandle />
            <SearchContainer>
              <SearchInput
                placeholder="Search your language"
                placeholderTextColor="#949899"
                value={search}
                onChangeText={setSearch}
              />
              <TouchableOpacity onPress={handleClearSearch} disabled={!search}>
                <CancelIcon source={cancelIconImg} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSearchPress}>
                <SearchIcon source={searchIconImg} resizeMode="contain" />
              </TouchableOpacity>
            </SearchContainer>
          </BottomSheetHeader>

          {OPTIONS.length > 0 ? (
            <FlatList
              data={OPTIONS}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item}-${index}`}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            />
          ) : (
            <NoResultText>No languages found</NoResultText>
          )}

          {value.length >= MAX_LANGUAGES && (
            <Warn>
              <AntDesign name="closecircle" size={16} color="#FF6B6B" />
              <WarnText>You can select up to {MAX_LANGUAGES} languages!</WarnText>
            </Warn>
          )}
        </BottomSheet>
      </ModalOverlay>
    </Modal>
  );
}

// ---------------- Styled Components ----------------

const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const BottomSheet = styled.View`
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
  width: 50px;
  height: 4px;
  background-color: #949899;
  border-radius: 2px;
  margin-bottom: 16px;
`;

const SearchContainer = styled.View`
  width: 100%;
  height: 50px;
  border-radius: 30px;
  flex-direction: row;
  align-items: center;
  padding: 0 15px;
  border-width: 1px;
  border-color: #949899;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  color: #ededed;
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
`;

const CancelIcon = styled.Image`
  width: 18px;
  height: 18px;
  margin-right: 8px;
  tint-color: #949899;
`;

const LanguageItem = styled.TouchableOpacity<{ selected?: boolean }>`
  padding: 16px 20px;
  border-bottom-width: 0.5px;
  border-bottom-color: #4a4b4c;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ selected }) => (selected ? '#4A4B4C' : 'transparent')};
  border-radius: ${({ selected }) => (selected ? 12 : 0)}px;
`;

const LanguageText = styled.Text`
  color: #ededed;
  font-size: 16px;
  font-family: 'PlusJakartaSans-Regular';
  flex: 1;
`;

const NoResultText = styled.Text`
  text-align: center;
  color: #949899;
  margin-top: 20px;
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
`;

const Warn = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background: rgba(255, 107, 107, 0.1);
  margin: 16px 20px 0 20px;
  border-radius: 8px;
`;

const WarnText = styled.Text`
  color: #ff6b6b;
  font-size: 14px;
  font-family: 'PlusJakartaSans-Regular';
  margin-left: 8px;
`;

const SearchIcon = styled.Image`
  width: 20px;
  height: 20px;
  tint-color: #949899;
`;

export const LanguageDropdownButton = styled.TouchableOpacity<{ selected?: boolean }>`
  width: 100%;
  height: 50px;
  border-radius: 8px;
  background-color: #353637;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-width: 1px;
  border-color: #949899;
`;

export const LanguageDropdownText = styled.Text<{ selected?: boolean }>`
  color: ${({ selected }) => (selected ? '#EDEDED' : '#949899')};
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
  flex: 1;
`;
