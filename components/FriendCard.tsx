import api from '@/api/axiosInstance';
import Avatar from '@/components/Avatar';
import CustomButton from '@/components/CustomButton';
import Tag from '@/components/Tag';
import { Config } from '@/src/lib/config';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import styled from 'styled-components/native';
const ICON_PURPOSE = require('@/assets/icons/purpose.png');
const ICON_GLOBAL = require('@/assets/icons/global.png');

type RequestMode = 'friend' | 'received' | 'sent';

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
  onUnfollow?: (userId: number) => void;

  mode?: RequestMode;
  onAccept?: (userId: number) => void;
  onCancel?: (userId: number) => void;

  onChat?: () => void;
  footerSlot?: React.ReactNode;
  collapsible?: boolean;
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
  onUnfollow,

  mode = 'friend',
  onAccept,
  onCancel,

  collapsible = true,
  onChat,
  footerSlot,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();

  const handlePrimaryPress = () => {
    if (mode === 'received') {
      onAccept?.(userId);
      return;
    }
    if (mode === 'sent') {
      onCancel?.(userId);
      return;
    }
    if (isFollowed) onUnfollow?.(userId);
    else onFollow?.(userId);
  };

  const handleChat = async () => {
    try {
      const res = await api.post(`${Config.SERVER_URL}/api/v1/chat/rooms/oneTone`
        , { otherUserId: userId }
      );

      const data = res.data;

      router.push({
        pathname: '/screens/chatscreen/ChattingRoomScreen',
        params: {
          userId: userId.toString(),       // props에서 바로 가져옴
          roomName: encodeURIComponent(name), // props에서 바로 가져옴
          roomId: data.id
        },
      });
    } catch (error) {

      console.error("채팅방 생성 실패", error);
    }

  };


  return (
    <CardWrap>
      <CardInner
        style={Platform.select({
          ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
          android: { elevation: 2 },
        })}
      >
        <Top>
          <Avatar />
          <Name>{name}</Name>

          <MetaLine>
            <MetaDim>Birth </MetaDim>
            <MetaStrong>{birth}</MetaStrong>

            <GenderIconSpacer>
              <MaterialCommunityIcons name={genderIconByType[gender]} size={14} color="#B5B5B5" />
            </GenderIconSpacer>

            <MetaDim>From </MetaDim>
            <MetaStrong>{country}</MetaStrong>
          </MetaLine>

          <Bio numberOfLines={expanded ? 4 : 2}>{bio}</Bio>
        </Top>

        <DividerWrap>
          <Divider />
          {collapsible && (
            <ChevronButton onPress={() => setExpanded(!expanded)}>
              <MaterialIcons
                name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={20}
                color="#8a8a8a"
              />
            </ChevronButton>
          )}
        </DividerWrap>

        {expanded && (
          <>
            <RowTop>
              <Col>
                <LabelRow>
                  <Icon source={ICON_PURPOSE} />
                  <Label>Purpose</Label>
                </LabelRow>
                <CategoryValue>{purpose}</CategoryValue>
              </Col>

              <ColRight>
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
              </ColRight>
            </RowTop>

            <InterestHeader>
              <HeartIcon name="heart-outline" size={13} color="#808080" />
              <Label>Interest</Label>
            </InterestHeader>

            <TagsWrap>
              {personalities.map((p) => (
                <Tag key={p} label={p} />
              ))}
            </TagsWrap>
          </>
        )}

        <Actions>
          {mode === 'received' ? (
            <>
              <CustomButton
                label="Accept"
                tone="mint"
                filled
                leftIcon="add"
                onPress={handlePrimaryPress}
              />
              <CustomButton
                label="Decline"
                tone="danger"
                filled
                leftIcon="close"
                onPress={() => {
                  console.log('[FriendCard] decline pressed', userId);
                  onCancel?.(userId);
                }}
              />
            </>
          ) : mode === 'sent' ? (
            <>
              <CustomButton
                label="Following"
                tone="muted"
                filled={false}
                leftIcon="check"
                onPress={handlePrimaryPress}
              />
              <CustomButton
                label="Chat"
                tone="black"
                filled
                leftIcon="chat-bubble-outline"
                onPress={handleChat}
              />
            </>
          ) : (
            <>
              {isFollowed ? (
                <CustomButton
                  label="Following"
                  tone="black"
                  filled={false}
                  leftIcon="check"
                  onPress={() => {
                    console.log('[FriendCard] unfollow pressed', userId);
                    onUnfollow?.(userId);
                  }}
                />
              ) : (
                <CustomButton
                  label="Follow"
                  tone="mint"
                  filled
                  leftIcon="add"
                  onPress={() => onFollow?.(userId)}
                />
              )}
              <CustomButton
                label="Chat"
                tone="black"
                filled
                leftIcon="chat-bubble-outline"
                onPress={handleChat}
              />
            </>
          )}
        </Actions>



        {footerSlot}
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

const MetaLine = styled.View`
  margin-top: ${META_MT}px;
  flex-direction: row;
  align-items: center;
`;

const GenderIconSpacer = styled.View`
  margin: 1px 4px 0 4px;
`;

const MetaDim = styled.Text`
  font-family: 'PlusJakartaSans_400Regular';
  color: #9a9a9a;
  font-size: 13px;
  line-height: 18px;
`;

const MetaStrong = styled.Text`
  font-family: 'PlusJakartaSans_500SemiBold';
  color: #111;
  font-size: 13px;
  line-height: 18px;
`;

const Bio = styled.Text`
  margin-top: ${BIO_MT}px;
  margin-bottom: ${BIO_MB}px;
  font-size: 14px;
  line-height: 22px;
  color: #000000;
  text-align: center;
  font-family: 'PlusJakartaSans_300Light';`;

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
  margin-top: -${CHEVRON.lift}px;
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

const RowTop = styled(Row)`
  margin-top: ${SECTION_GAP_TOP}px;
`;

const Col = styled.View`
  flex: 1;
`;

const ColRight = styled(Col)`
  margin-left: ${COL_GAP}px;
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
  margin-left: 6px;
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

const InterestHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 14px;
  margin-bottom: 8px;
`;

const HeartIcon = styled(MaterialCommunityIcons)`
  margin-right: 4px;
`;
