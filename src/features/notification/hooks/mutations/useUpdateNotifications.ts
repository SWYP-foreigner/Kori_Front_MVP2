import { NotificationSetting, putNotifications } from '@/src/features/notification/api/notifications';
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
