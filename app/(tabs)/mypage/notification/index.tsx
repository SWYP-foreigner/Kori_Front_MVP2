import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DetailHeader from '@/components/common/DetailHeader';
import Toggle from '@/components/common/Toggle';
import { useCallback, useEffect, useState } from 'react';
import { textStyle } from '@/src/styles/theme';
import { Text, View } from 'react-native';
import { NotificationSetting, NotificationType, putOSPushAgreement } from '@/api/notifications/notifications';
import { defaultSettings, useNotificationSettings } from '@/hooks/queries/notifications/useNotifications';
import useUpdateNotificationSettings from '@/hooks/mutations/notifications/useUpdateNotifications';
import { showNotificationPermissionAlert } from '@/lib/fcm/showNotificationPermissionAlert';
import * as Notifications from 'expo-notifications';

type NotificationSettingListText = {
  title: string;
  subtitle?: string;
};

const NOTIFICATION_SETTING_LIST_TEXT: Record<NotificationType | 'all', NotificationSettingListText> = {
  all: {
    title: 'All notifications',
    subtitle: 'Enable all push notifications',
  },
  newuser: {
    title: 'New member join notifications',
    subtitle: 'Get notified when new users join Kori',
  },
  receive: {
    title: 'Follow Request Accepted',
  },
  follow: {
    title: 'New Follower Request',
  },
  followuserpost: {
    title: 'Post notifications from followed users',
  },
  post: {
    title: 'Comment on Your Post',
  },
  comment: {
    title: 'Reply to your comment',
  },
  chat: {
    title: 'Allow Chat Notifications',
  },
};

export default function NotificationSettingPage() {
  const { data, isLoading } = useNotificationSettings();
  const notificationSettings = data ?? defaultSettings;
  const { mutate } = useUpdateNotificationSettings();
  const [isAllEnabled, setIsAllEnabled] = useState<boolean>(false);

  /* -------------- state에서 특정 type의 enabled를 찾음 -------------- */
  function findEnabled(type: NotificationType | 'all'): boolean {
    if (!Array.isArray(data)) return false;

    if (type === 'all') {
      return isAllEnabled;
    }
    return data.find((s) => s.notificationType === type)!.enabled;
  }

  /* -------------- 개별 알림 토글 핸들러 콜백 함수 -------------- */
  const handleToggle = useCallback(
    ({ notificationType, enabled }: NotificationSetting) => {
      if (!isAllEnabled) return;

      const updatedSettings = notificationSettings.map((s) =>
        s.notificationType === notificationType ? { ...s, enabled: enabled } : s,
      );

      mutate(updatedSettings);
    },
    [isAllEnabled, notificationSettings, mutate],
  );

  /* -------------- 전체 알림 토글 핸들러 콜백 함수 -------------- */
  const handleAllToggle = useCallback(
    async (next: boolean) => {
      const { status } = await Notifications.getPermissionsAsync();
      const needsSetupFromOS = status === 'undetermined' || status === 'denied';

      if (needsSetupFromOS) {
        const updatedosStatus = await showNotificationPermissionAlert();

        if (updatedosStatus !== 'granted') return;
        else await putOSPushAgreement(true);
      }

      setIsAllEnabled(next);
      const updatedSettings = notificationSettings.map((s) => ({ ...s, enabled: next }));
      mutate(updatedSettings);
    },
    [notificationSettings, mutate],
  );

  interface NotificationSettingListProps {
    notificationType: NotificationType | 'all';
    isBorderBottom?: boolean;
  }

  /* -------------- 알림 설정 리스트 컴포넌트 -------------- */
  const NotificationSettingList = ({ notificationType, isBorderBottom }: NotificationSettingListProps) => {
    const title = NOTIFICATION_SETTING_LIST_TEXT[notificationType].title;
    const subtitle = NOTIFICATION_SETTING_LIST_TEXT[notificationType]?.subtitle;

    return (
      <ListItem isBorderBottom={isBorderBottom}>
        <View>
          <ListTitle>
            <Text>{title}</Text>
          </ListTitle>
          {subtitle && (
            <ListSubTitle>
              <Text>{subtitle}</Text>
            </ListSubTitle>
          )}
        </View>
        <Toggle
          isPressed={findEnabled(notificationType)}
          onPress={(enabled) => {
            notificationType === 'all' ? handleAllToggle(enabled) : handleToggle({ notificationType, enabled });
          }}
          disabled={notificationType !== 'all' && !isAllEnabled}
        />
      </ListItem>
    );
  };

  useEffect(() => {
    if (Array.isArray(data)) {
      setIsAllEnabled(data.some((s) => s.enabled));
    }
  }, [data]);

  return (
    <Safe edges={[]}>
      <DetailHeader title="Notification" />
      <Body>
        <NotificationSettingList notificationType={'all'} isBorderBottom={true} />
        <NotificationSettingList notificationType={'newuser'} isBorderBottom={true} />
        <ListSection>
          <ListSectionLabel>
            <Text>Follow Received / Sent</Text>
          </ListSectionLabel>
          <NotificationSettingList notificationType={'receive'} />
          <NotificationSettingList notificationType={'follow'} />
        </ListSection>
        <ListSection>
          <ListSectionLabel>
            <Text>Community</Text>
          </ListSectionLabel>
          <NotificationSettingList notificationType={'followuserpost'} />
          <NotificationSettingList notificationType={'post'} />
          <NotificationSettingList notificationType={'comment'} isBorderBottom={true} />
        </ListSection>
        <ListSection>
          <ListSectionLabel>
            <Text>Chat</Text>
          </ListSectionLabel>
          <NotificationSettingList notificationType={'chat'} />
        </ListSection>
      </Body>
    </Safe>
  );
}

const Safe = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary.black};
`;

const Body = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingBottom: 40,
  },
})`
  flex: 1;
`;

const ListItem = styled.View<{ isBorderBottom?: boolean }>`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 20px 0;
  border-bottom-width: ${({ isBorderBottom }) => (isBorderBottom ? 1 : 0)}px;
  border-bottom-color: ${({ theme, isBorderBottom }) =>
    isBorderBottom ? theme.colors.gray.darkGray_1 : 'transparent'};
`;

const ListTitle = styled.Text`
  margin-bottom: 4px;
  ${({ theme }) => textStyle(theme.fonts.body.B3_M)}
  color: ${({ theme }) => theme.colors.primary.white}
`;

const ListSubTitle = styled.Text`
  ${({ theme }) => textStyle(theme.fonts.body.B4_L)}
  color: ${({ theme }) => theme.colors.primary.white}
`;

const ListSection = styled.View`
  margin-top: 20px;
`;

const ListSectionLabel = styled.Text`
  padding: 4px 0;
  ${({ theme }) => textStyle(theme.fonts.body.B5_SB)}
  color: ${({ theme }) => theme.colors.gray.gray_1}
`;
