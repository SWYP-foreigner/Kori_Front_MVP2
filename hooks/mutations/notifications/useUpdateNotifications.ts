import { NotificationSetting, putNotifications } from '@/api/notifications/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useUpdateNotificationSettings() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (notificationSettings: NotificationSetting[]) => putNotifications(notificationSettings),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['notificationSettings'] });
    },
  });
}
