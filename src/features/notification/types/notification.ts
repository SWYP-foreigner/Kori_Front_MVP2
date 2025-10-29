export const notificationType = ['post', 'comment', 'chat', 'follow', 'receive', 'followuserpost', 'newuser'] as const;

export type NotificationType = (typeof notificationType)[number];

export interface NotificationSetting {
  notificationType: NotificationType;
  enabled: boolean;
}
