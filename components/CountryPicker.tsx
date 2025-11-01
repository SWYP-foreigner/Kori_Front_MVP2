import cancelIconImg from '@/assets/images/cancel.png';
import searchIconImg from '@/assets/images/search.png';
import Icon from '@/components/common/Icon';
import { theme } from '@/src/styles/theme';
import { COUNTRIES } from '@/src/utils/countries';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

type Props = {
  visible: boolean;
  value?: string;
  onClose: () => void;
  onSelect: (country: string) => void;
  countries?: string[];
};

export default function CountryPicker({ visible, value, onClose, onSelect, countries }: Props) {
  const [search, setSearch] = useState('');

  const data = useMemo(() => {
    const list = (countries ?? COUNTRIES).slice().sort();
    if (!search.trim()) return list;
    return list.filter((country) => country.toLowerCase().includes(search.toLowerCase()));
  }, [countries, search]);

  const renderCountryItem = ({ item }: { item: string }) => {
    const selected = value === item;
    return (
      <CountryItem selected={selected} onPress={() => onSelect(item)}>
        <CountryText>{item}</CountryText>
        {selected && <Icon type="check" size={20} color={theme.colors.primary.mint} />}
      </CountryItem>
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
        <BottomSheetContent onStartShouldSetResponder={() => true}>
          <BottomSheetHeader>
            <BottomSheetHandle />
            <SearchContainer>
              <SearchInput
                placeholder="Search your country"
                placeholderTextColor="#949899"
                value={search}
                onChangeText={setSearch}
              />

              <TouchableOpacity onPress={handleClearSearch}>
                <CancelIcon source={cancelIconImg} resizeMode="contain" />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSearchPress}>
                <SearchIcon source={searchIconImg} resizeMode="contain" />
              </TouchableOpacity>
            </SearchContainer>
          </BottomSheetHeader>

          {data.length > 0 ? (
            <FlatList
              data={data}
              renderItem={renderCountryItem}
              keyExtractor={(item, index) => `${item}-${index}`}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            />
          ) : (
            <NoResultText>No countries found</NoResultText>
          )}
        </BottomSheetContent>
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
  width: 50px;
  height: 4px;
  background-color: #949899;
  border-radius: 2px;
  margin-bottom: 16px;
`;

const SearchContainer = styled.View`
  width: 95%;
  height: 50px;
  border-radius: 30px;
  flex-direction: row;
  align-items: center;
  padding: 0 20px;
  border-width: 1px;
  border-color: #949899;
`;

const SearchIcon = styled.Image`
  width: 20px;
  height: 20px;
  tint-color: #949899;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  color: #ededed;
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
`;

const NoResultText = styled.Text`
  text-align: center;
  color: #949899;
  margin-top: 20px;
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
`;

const CountryItem = styled.TouchableOpacity<{ selected?: boolean }>`
  padding: 20px;
  border-bottom-width: 0.5px;
  border-bottom-color: #4a4b4c;
  margin: 0 20px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ selected }) => (selected ? '#4A4B4C' : 'transparent')};
  border-radius: ${({ selected }) => (selected ? 12 : 0)}px;
`;

const CountryText = styled.Text`
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

export const CountryDropdownButton = styled.TouchableOpacity<{ selected?: boolean }>`
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

export const CountryDropdownText = styled.Text<{ selected?: boolean }>`
  color: ${({ selected }) => (selected ? '#EDEDED' : '#949899')};
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
`;
