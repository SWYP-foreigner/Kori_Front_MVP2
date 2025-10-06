import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useMemo } from 'react';
import { FlatList, Modal } from 'react-native';
import styled from 'styled-components/native';

type Props = {
  visible: boolean;
  value?: string;
  onClose: () => void;
  onSelect: (country: string) => void;
  countries?: string[];
};

const DEFAULT_COUNTRIES = [
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
];

export default function CountryPicker({ visible, value, onClose, onSelect, countries }: Props) {
  const data = useMemo(() => (countries ?? DEFAULT_COUNTRIES).slice().sort(), [countries]);

  const renderCountryItem = ({ item }: { item: string }) => {
    const selected = value === item;
    return (
      <CountryItem selected={selected} onPress={() => onSelect(item)}>
        <CountryText>{item}</CountryText>
        {selected && <AntDesign name="check" size={20} color="#02F59B" />}
      </CountryItem>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ModalOverlay onPress={onClose} activeOpacity={1}>
        <BottomSheetContent onStartShouldSetResponder={() => true}>
          <BottomSheetHeader>
            <BottomSheetHandle />
          </BottomSheetHeader>
          <FlatList
            data={data}
            renderItem={renderCountryItem}
            keyExtractor={(item, index) => `${item}-${index}`}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 400 }}
          />
        </BottomSheetContent>
      </ModalOverlay>
    </Modal>
  );
}

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
  border-color: ${({ selected }) => (selected ? '#949899' : '#02F59B99')};
`;

export const CountryDropdownText = styled.Text<{ selected?: boolean }>`
  color: ${({ selected }) => (selected ? '#EDEDED' : '#949899')};
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
`;
