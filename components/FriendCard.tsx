import Avatar from '@/components/Avatar';
import CustomButton from '@/components/CustomButton';
import Tag from '@/components/Tag';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import styled from 'styled-components/native';

const ICON_PURPOSE = require('@/assets/icons/purpose.png');
const ICON_GLOBAL = require('@/assets/icons/global.png');

type Props = {
  userId: number;
  name: string;
  country: string;
  birth?: number;
  gender?: 'male' | 'female' | 'unspecified';
  purpose: string;
  languages: string[];
  personalities: string[];
  bio?: string;
  isFollowed?: boolean;
  onFollow?: (userId: number) => void;
  onChat?: () => void;
};

const CARD_RADIUS = 22;
const CARD_MAX_W = 388;
const P_H = 20;
const P_TOP = 22;
const P_BOTTOM = 18;

const NAME_MT = 14;
const META_MT = 6;
const BIO_MT = 14;
const BIO_MB = 18;

const DIVIDER_COLOR = '#EAEAEA';
const CHEVRON = { size: 28, ring: 1, lift: 13 };

const SECTION_GAP_TOP = 16;
const COL_GAP = 18;
const LABEL_ICON_GAP = 6;

const BTN_GAP = 14;
const CARD_OUTER_GAP = 16;

const genderIconByType: Record<
  NonNullable<Props['gender']>,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  male: 'gender-male',
  female: 'gender-female',
  unspecified: 'help-circle-outline',
};

export default function FriendCard({
  userId,
  name,
  country,
  birth,
  gender = 'unspecified',
  purpose,
  languages,
  personalities,
  bio = 'Hello~ I came to Korea from\nthe U.S. as an exchange student',
  isFollowed = false,
  onFollow,
  onChat,
}: Props) {
  const [expanded, setExpanded] = useState(true);

  return (
    <CardWrap>
      <CardInner
        style={Platform.select({
          ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
          android: { elevation: 2 },
        })}
      >
        {/* 상단 */}
        <Top>
          <Avatar />
          <Name>{name}</Name>

          {/* 성별 */}
          <MetaLine>
            <MetaDim>Birth </MetaDim>
            <MetaStrong>{birth}</MetaStrong>

            <MaterialCommunityIcons
              name={genderIconByType[gender]}
              size={14}
              color="#B5B5B5"
              style={{ marginHorizontal: 4, marginTop: 1 }}
            />

            <MetaDim>From </MetaDim>
            <MetaStrong>{country}</MetaStrong>
          </MetaLine>

          <Bio numberOfLines={expanded ? 4 : 2}>{bio}</Bio>
        </Top>

        {/* Divider + Chevron */}
        <DividerWrap>
          <Divider />
          <ChevronButton
            onPress={() => setExpanded(!expanded)}
            accessibilityRole="button"
            style={{ transform: [{ translateY: -CHEVRON.lift }] }}
          >
            <MaterialIcons
              name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={20}
              color="#8a8a8a"
            />
          </ChevronButton>
        </DividerWrap>

        {/* 상세 */}
        {expanded && (
          <>
            <Row style={{ marginTop: SECTION_GAP_TOP }}>
              <Col>
                <LabelRow>
                  <Icon source={ICON_PURPOSE} />
                  <Label>Purpose</Label>
                </LabelRow>
                <CategoryValue>{purpose}</CategoryValue>
              </Col>

              <Col style={{ marginLeft: COL_GAP }}>
                <LabelRow>
                  <Icon source={ICON_GLOBAL} />
                  <Label>Language</Label>
                </LabelRow>
                <LangWrap>
                  {languages.map((lg, i) => (
                    <React.Fragment key={lg}>
                      {i > 0 && <LangDot>•</LangDot>}
                      <LangText>{lg}</LangText>
                    </React.Fragment>
                  ))}
                </LangWrap>
              </Col>
            </Row>

            <LabelRow style={{ marginTop: 14, marginBottom: 8 }}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={13}
                color="#808080"
                style={{ marginRight: 4 }}
              />
              <Label>Interest</Label>
            </LabelRow>

            <TagsWrap>
              {personalities.map((p) => (
                <Tag key={p} label={p} />
              ))}
            </TagsWrap>
          </>
        )}

        {/* 버튼 */}
        <Actions>
          <CustomButton
            label={isFollowed ? 'Following' : 'Follow'}
            tone={isFollowed ? 'black' : 'mint'}
            filled={!isFollowed}
            leftIcon={!isFollowed ? 'add' : undefined}
            disabled={isFollowed}
            onPress={() => !isFollowed && onFollow?.(userId)}
          />
          <CustomButton
            label="Chat"
            tone="black"
            filled
            leftIcon="chat-bubble-outline"
            onPress={onChat}
          />
        </Actions>
      </CardInner>
    </CardWrap>
  );
}

const CardWrap = styled.View`
  width: 100%;
  align-self: stretch;
  padding: 0 ${P_H}px;
  margin: ${CARD_OUTER_GAP / 2}px 0;
`;

const CardInner = styled.View`
  align-self: center;
  width: 100%;
  max-width: ${CARD_MAX_W}px;
  background-color: #ffffff;
  border-radius: ${CARD_RADIUS}px;
  padding: ${P_TOP}px ${P_H}px ${P_BOTTOM}px ${P_H}px;
`;

const Top = styled.View`
  align-items: center;
`;

const Name = styled.Text`
  margin-top: ${NAME_MT}px;
  font-size: 18px;
  line-height: 24px;
  font-family: 'PlusJakartaSans_600SemiBold';
  color: #111;
  letter-spacing: 0.1px;
`;

const MetaLine = styled.Text`
  margin-top: ${META_MT}px;
  font-size: 12px;
  line-height: 18px;
  font-family: 'PlusJakartaSans_400Regular';
  color: #8a8a8a;
`;

const MetaDim = styled.Text`
  font-family: 'PlusJakartaSans_400Regular';
  color: #9a9a9a;
`;

const MetaStrong = styled.Text`
  font-family: 'PlusJakartaSans_600SemiBold';
  color: #111;
`;

const Bio = styled.Text`
  margin-top: ${BIO_MT}px;
  margin-bottom: ${BIO_MB}px;
  font-size: 16px;
  line-height: 22px;
  color: #000000;
  text-align: center;
  font-family: 'PlusJakartaSans_500Medium';
`;

const DividerWrap = styled.View`
  position: relative;
  align-self: stretch;
  align-items: center;
  justify-content: center;
  margin-top: 9px;
  margin-bottom: 18px;
`;

const Divider = styled.View`
  height: 1px;
  align-self: stretch;
  background-color: ${DIVIDER_COLOR};
`;

const ChevronButton = styled.Pressable`
  position: absolute;
  top: 50%;
  width: ${CHEVRON.size}px;
  height: ${CHEVRON.size}px;
  border-radius: ${CHEVRON.size / 2}px;
  border-width: ${CHEVRON.ring}px;
  border-color: #dcdcdc;
  background-color: #ffffff;
  align-items: center;
  justify-content: center;
`;

const Row = styled.View`
  flex-direction: row;
  align-self: stretch;
`;

const Col = styled.View`
  flex: 1;
`;

const LabelRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Icon = styled.Image`
  width: 12px;
  height: 12px;
  tint-color: #808080;
`;

const Label = styled.Text`
  font-size: 12px;
  line-height: 16px;
  color: #808080;
  font-family: 'PlusJakartaSans_400Regular';
`;

const CategoryValue = styled.Text`
  margin-top: 4px;
  font-size: 14px;
  line-height: 18px;
  font-family: 'PlusJakartaSans_400Regular';
  color: #000000;
`;

const LangWrap = styled.View`
  margin-top: 4px;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
`;

const LangText = styled.Text`
  font-size: 13px;
  line-height: 18px;
  font-family: 'PlusJakartaSans_400Regular';
  color: #000000;
`;

const LangDot = styled.Text`
  font-size: 8px;
  color: #9e9e9e;
  margin: 0 6px;
`;

const TagsWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 2px;
`;

const Actions = styled.View`
  margin-top: 16px;
  flex-direction: row;
  gap: ${BTN_GAP}px;
`;
