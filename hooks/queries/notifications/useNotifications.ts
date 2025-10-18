import { getNotifications, NotificationSetting } from '@/api/notifications/notifications';
import { useQuery } from '@tanstack/react-query';

export const defaultSettings: NotificationSetting[] = [
  { notificationType: 'post', enabled: false },
  { notificationType: 'comment', enabled: false },
  { notificationType: 'chat', enabled: false },
  { notificationType: 'follow', enabled: false },
  { notificationType: 'receive', enabled: false },
  { notificationType: 'followuserpost', enabled: false },
  { notificationType: 'newuser', enabled: false },
];

export function useNotificationSettings() {
  return useQuery<NotificationSetting[]>({
    queryKey: ['notificationSettings'],
    queryFn: getNotifications,
    placeholderData: defaultSettings,
    staleTime: 1000 * 60 * 5,
  });
}
