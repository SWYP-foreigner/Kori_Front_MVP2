import { getNotificationsSettingStatus, NotificationSetting } from '@/api/notifications/notifications';
import { useQuery } from '@tanstack/react-query';

export function useNotificationSettings() {
  return useQuery<NotificationSetting[]>({
    queryKey: ['notificationSettings'],
    queryFn: getNotificationsSettingStatus,
    staleTime: 1000 * 60 * 5,
  });
}
