import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { Alert, FlatList, Modal } from 'react-native';
import styled from 'styled-components/native';

export const MAX_LANGUAGES = 5;

type Props = {
    visible: boolean;
    value: string[];
    onClose: () => void;
    onChange: (next: string[]) => void;
};

const LANGUAGES = [
    'Afrikaans (AF)', 'Albanian (SQ)', 'Amharic (AM)', 'Arabic (AR)', 'Armenian (HY)', 'Azerbaijani (AZ)',
    'Basque (EU)', 'Belarusian (BE)', 'Bengali (BN)', 'Bosnian (BS)', 'Bulgarian (BG)', 'Burmese (MY)',
    'Catalan (CA)', 'Chinese (ZH)', 'Croatian (HR)', 'Czech (CS)',
    'Danish (DA)', 'Dutch (NL)',
    'English (EN)', 'Estonian (ET)',
    'Finnish (FI)', 'French (FR)',
    'Galician (GL)', 'Georgian (KA)', 'German (DE)', 'Greek (EL)', 'Gujarati (GU)',
    'Hebrew (HE)', 'Hindi (HI)', 'Hungarian (HU)',
    'Icelandic (IS)', 'Indonesian (ID)', 'Irish (GA)', 'Italian (IT)',
    'Japanese (JA)',
    'Kannada (KN)', 'Kazakh (KK)', 'Khmer (KM)', 'Korean (KO)', 'Kurdish (KU)', 'Kyrgyz (KY)',
    'Lao (LO)', 'Latin (LA)', 'Latvian (LV)', 'Lithuanian (LT)', 'Luxembourgish (LB)',
    'Macedonian (MK)', 'Malay (MS)', 'Malayalam (ML)', 'Maltese (MT)', 'Marathi (MR)', 'Mongolian (MN)',
    'Nepali (NE)', 'Norwegian (NO)',
    'Pashto (PS)', 'Persian (FA)', 'Polish (PL)', 'Portuguese (PT)', 'Punjabi (PA)',
    'Romanian (RO)', 'Russian (RU)',
    'Serbian (SR)', 'Sinhala (SI)', 'Slovak (SK)', 'Slovenian (SL)', 'Somali (SO)', 'Spanish (ES)', 'Swahili (SW)', 'Swedish (SV)',
    'Tajik (TG)', 'Tamil (TA)', 'Telugu (TE)', 'Thai (TH)', 'Turkish (TR)', 'Turkmen (TK)',
    'Ukrainian (UK)', 'Urdu (UR)', 'Uzbek (UZ)',
    'Vietnamese (VI)',
    'Welsh (CY)',
    'Yiddish (YI)',
    'Zulu (ZU)'
].sort();

export default function LanguagePicker({ visible, value, onClose, onChange }: Props) {

    const toggle = (lang: string) => {
        const exists = value.includes(lang);
        if (exists) {
            onChange(value.filter(v => v !== lang));
        } else {
            if (value.length >= MAX_LANGUAGES) {
                Alert.alert('Maximum Selection', `You can select up to ${MAX_LANGUAGES} languages!`);
                return;
            }
            onChange([...value, lang]);
        }
    };

    const renderItem = ({ item }: { item: string }) => {
        const selected = value.includes(item);
        return (
            <LanguageItem selected={selected} onPress={() => toggle(item)}>
                <LanguageText>{item}</LanguageText>
                {selected && <AntDesign name="check" size={20} color="#02F59B" />}
            </LanguageItem>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <ModalOverlay onPress={onClose} activeOpacity={1}>
                <BottomSheet>
                    <HandleWrap>
                        <Handle />
                    </HandleWrap>

                    <List
                        data={LANGUAGES}
                        renderItem={renderItem}
                        keyExtractor={(it, idx) => `${it}-${idx}`}
                        showsVerticalScrollIndicator={false}
                    />

                    {value.length >= MAX_LANGUAGES && (
                        <Warn>
                            <AntDesign name="closecircle" size={16} color="#FF6B6B" />
                            <WarnText>You can select up to five languages!</WarnText>
                        </Warn>
                    )}
                </BottomSheet>
            </ModalOverlay>
        </Modal>
    );
}

export const LanguageDropdownButton = styled.TouchableOpacity<{ selected?: boolean }>`
  width: 100%;
  height: 50px;
  border-radius: 8px;
  background-color: #353637;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border: 1px solid ${({ selected }) => (selected ? '#949899' : '#02F59B99')};
`;

export const LanguageDropdownText = styled.Text<{ selected?: boolean }>`
  color: ${({ selected }) => (selected ? '#EDEDED' : '#949899')};
  font-size: 15px;
  font-family: 'PlusJakartaSans-Regular';
  flex: 1;
`;

const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background: rgba(0,0,0,0.5);
  justify-content: flex-end;
`;

const BottomSheet = styled.View`
  background: #353637;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  max-height: 70%;
  padding-bottom: 20px;
`;

const HandleWrap = styled.View`
  align-items: center;
  padding: 20px 20px 10px 20px;
`;
const Handle = styled.View`
  width: 40px; height: 4px; background: #949899; border-radius: 2px;
`;

const List = styled(FlatList as new () => FlatList<string>)`
  max-height: 400px;
  padding: 0 20px;
`;

const LanguageItem = styled.TouchableOpacity<{ selected?: boolean }>`
  padding: 16px 0;
  border-bottom-width: 0.5px;
  border-bottom-color: #4A4B4C;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LanguageText = styled.Text`
  color: #EDEDED;
  font-size: 16px;
  font-family: 'PlusJakartaSans-Regular';
  flex: 1;
`;

const Warn = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background: rgba(255,107,107,0.1);
  margin: 0 20px;
  border-radius: 8px;
  margin-top: 16px;
`;
const WarnText = styled.Text`
  color: #FF6B6B;
  font-size: 14px;
  font-family: 'PlusJakartaSans-Regular';
  margin-left: 8px;
`;
