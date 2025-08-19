import Avatar from '@/components/Avatar';
import CustomButton from '@/components/CustomButton';
import Tag from '@/components/Tag';
import React, { useMemo, useState } from 'react';
import { ImageSourcePropType, Platform } from 'react-native';
import styled from 'styled-components/native';

const ICON_PURPOSE: ImageSourcePropType = require('@/assets/icons/purpose.png');
const ICON_GLOBAL: ImageSourcePropType = require('@/assets/icons/global.png');
const ICON_HEART: ImageSourcePropType = require('@/assets/icons/heart.png');

type Props = {
  userId: number;
  name: string;
  country: string;
  birth?: number;
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

const AVATAR = { size: 112 };
const NAME_MT = 14;
const META_MT = 6;
const BIO_MT = 14;
const BIO_MB = 18;

const DIVIDER_MT = 12;
const DIVIDER_COLOR = '#EAEAEA';

const CHEVRON = { size: 28, ring: 1, lift: 13 };

const SECTION_GAP_TOP = 16;
const COL_GAP = 18;
const LABEL_ICON_GAP = 6;

const BTN_HEIGHT = 52;
const BTN_RADIUS = 14;
const BTN_GAP = 14;
const CARD_OUTER_GAP = 16;

export default function FriendCard({
  userId,
  name,
  country,
  birth,
  purpose,
  languages,
  personalities,
  bio = 'Hello~ I came to Korea from\nthe U.S. as an exchange student',
  isFollowed = false,
  onFollow,
  onChat,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const langText = useMemo(() => languages.join(' • '), [languages]);

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

          <MetaLine>
            <MetaDim>Birth </MetaDim>
            <MetaStrong>{birth}</MetaStrong>
            <Dot>  •  </Dot>
            <MetaDim>From </MetaDim>
            <MetaStrong>{country}</MetaStrong>
          </MetaLine>

          <Bio numberOfLines={expanded ? 4 : 2}>{bio}</Bio>
        </Top>

        {/* Divider + Chevron(중앙 겹침) */}
        <DividerWrap>
          <Divider />
          <ChevronButton
            onPress={() => setExpanded(!expanded)}
            accessibilityRole="button"
            style={{ transform: [{ translateY: -CHEVRON.lift }] }}
          >
            <ChevronText style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>⌄</ChevronText>
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
                <Value>{purpose}</Value>
              </Col>

              <Col style={{ marginLeft: COL_GAP }}>
                <LabelRow>
                  <Icon source={ICON_GLOBAL} />
                  <Label>Language</Label>
                </LabelRow>
                <Value>{langText}</Value>
              </Col>
            </Row>

            <LabelRow style={{ marginTop: 14, marginBottom: 8 }}>
              <HeartIcon source={ICON_HEART} />
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
            label={isFollowed ? 'Following' : '+ Follow'}
            tone={isFollowed ? 'black' : 'mint'}
            filled={!isFollowed}
            disabled={isFollowed}
            onPress={() => !isFollowed && onFollow?.(userId)}
          />
          <CustomButton label="Chat" tone="black" filled onPress={onChat} />
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

const Dot = styled.Text`
  color: #c0c0c0;
`;

const Bio = styled.Text`
  margin-top: ${BIO_MT}px;
  margin-bottom: ${BIO_MB}px;
  font-size: 15px;
  line-height: 22px;
  text-align: center;
  color: #4b4b4b;
  font-family: 'PlusJakartaSans_400Regular';
  letter-spacing: 0.1px;
`;

const DividerWrap = styled.View`
  position: relative;
  align-self: stretch;
  align-items: center;
  justify-content: center;
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

const ChevronText = styled.Text`
  font-size: 18px;
  color: #8a8a8a;
  margin-top: -1px;
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
  gap: ${LABEL_ICON_GAP}px;
`;

const Icon = styled.Image`
  width: 12px;   /* Purpose/Language = 12px */
  height: 12px;
  tint-color: #808080;
`;

const HeartIcon = styled.Image`
  width: 11px;   /* Interest만 더 작게 */
  height: 11px;
  tint-color: #808080;
  margin-top: 1px;
`;

const Label = styled.Text`
  font-size: 12px;
  line-height: 16px;
  color: #808080;
  font-family: 'PlusJakartaSans_400Regular';
`;

const Value = styled.Text`
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  font-family: 'PlusJakartaSans_600SemiBold';
  color: #1a1a1a;
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