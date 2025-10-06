import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { Alert, Modal, ScrollView } from 'react-native';
import styled from 'styled-components/native';

export type TagSection = {
  title: string;
  items: string[];
  emojis?: string[];
};

type Props = {
  visible: boolean;
  value: string[];
  onClose: () => void;
  onChange: (next: string[]) => void;
  sections: TagSection[];
  max?: number;
  title?: string;
};

const DEFAULT_MAX = 5;

export default function BottomSheetTagPicker({
  visible,
  value,
  onClose,
  onChange,
  sections,
  max = DEFAULT_MAX,
  title = 'Select interests',
}: Props) {
  const toggle = (tag: string) => {
    const exists = value.includes(tag);
    if (exists) {
      onChange(value.filter((t) => t !== tag));
    } else {
      if (value.length >= max) {
        Alert.alert('Maximum Selection', `You can select up to ${max} tags!`);
        return;
      }
      onChange([...value, tag]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Overlay activeOpacity={1} onPress={onClose}>
        <Sheet onStartShouldSetResponder={() => true}>
          <Handle />
          <HeaderRow>
            <TitleText>{title}</TitleText>
            <RightRow>
              {!!value.length && (
                <CountText>
                  {value.length}/{max}
                </CountText>
              )}
              {!!value.length && (
                <PillBtn onPress={clearAll}>
                  <PillBtnText>Clear</PillBtnText>
                </PillBtn>
              )}
              <IconBtn onPress={onClose}>
                <AntDesign name="close" size={18} color="#cfd4da" />
              </IconBtn>
            </RightRow>
          </HeaderRow>

          <ScrollView showsVerticalScrollIndicator={false}>
            {sections.map((sec, idx) => (
              <Section key={`${sec.title}-${idx}`}>
                <SectionTitle>{sec.title}</SectionTitle>
                <TagsWrap>
                  {sec.items.map((tag, i) => {
                    const selected = value.includes(tag);
                    const emoji = sec.emojis?.[i] ?? '';
                    return (
                      <Tag key={tag} selected={selected} onPress={() => toggle(tag)}>
                        {!!emoji && <Emoji>{emoji}</Emoji>}
                        <TagText selected={selected}>{tag}</TagText>
                        {selected && <AntDesign name="check" size={14} color="#02F59B" />}
                      </Tag>
                    );
                  })}
                </TagsWrap>
              </Section>
            ))}

            {value.length >= max && (
              <Warn>
                <AntDesign name="closecircle" size={16} color="#FF6B6B" />
                <WarnText>You can select up to {max} tags!</WarnText>
              </Warn>
            )}
            <BottomPad />
          </ScrollView>
        </Sheet>
      </Overlay>
    </Modal>
  );
}

const Overlay = styled.TouchableOpacity`
  flex: 1;
  background: rgba(0, 0, 0, 0.55);
  justify-content: flex-end;
`;

const Sheet = styled.View`
  background: #353637;
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
  padding: 14px 16px 10px 16px;
  max-height: 78%;
`;

const Handle = styled.View`
  align-self: center;
  width: 54px;
  height: 4px;
  border-radius: 2px;
  background: #9aa0a6;
  margin-bottom: 10px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const TitleText = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-family: 'PlusJakartaSans_700Bold';
`;

const RightRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const CountText = styled.Text`
  color: #7e848a;
  font-size: 12px;
  margin-right: 8px;
  font-family: 'PlusJakartaSans_400Regular';
`;

const PillBtn = styled.Pressable`
  padding: 6px 10px;
  border-radius: 999px;
  background: #2a2b2c;
  margin-right: 6px;
`;
const PillBtnText = styled.Text`
  color: #e9ecef;
  font-size: 12px;
  font-family: 'PlusJakartaSans_600SemiBold';
`;

const IconBtn = styled.Pressable`
  padding: 6px;
`;

const Section = styled.View`
  margin-top: 12px;
`;

const SectionTitle = styled.Text`
  color: #848687;
  font-size: 13px;
  font-family: 'PlusJakartaSans_600SemiBold';
  margin-bottom: 8px;
`;

const TagsWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const Tag = styled.Pressable<{ selected?: boolean }>`
  margin: 6px 10px 6px 0px;
  padding: 6px 10px;
  height: 36px;
  border-radius: 30px;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${({ selected }) => (selected ? '#02F59B' : '#848687')};
  background: #1f2021;
`;

const Emoji = styled.Text`
  margin-right: 6px;
`;

const TagText = styled.Text<{ selected?: boolean }>`
  color: ${({ selected }) => (selected ? '#02F59B' : '#ffffff')};
  font-size: 13px;
  margin-right: 7px;
  font-family: 'PlusJakartaSans-Regular';
`;

const Warn = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 14px 16px;
  background: rgba(255, 107, 107, 0.1);
  margin: 8px 0 0 0;
  border-radius: 8px;
`;
const WarnText = styled.Text`
  color: #ff6b6b;
  font-size: 13px;
  font-family: 'PlusJakartaSans-Regular';
  margin-left: 8px;
`;

const BottomPad = styled.View`
  height: 16px;
`;
