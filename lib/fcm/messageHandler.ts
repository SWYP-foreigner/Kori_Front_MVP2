import notifee from '@notifee/react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

/* --------------- push를 notifee로 표시 --------------- */
export const messageHandler = (message: FirebaseMessagingTypes.RemoteMessage) => {
  const { notification, data } = message;

  const title = notification?.title ?? '알림';
  const body = notification?.body ?? '';

  return notifee.displayNotification({
    title: title,
    body: body,
    data: data,
    ios: {
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        alert: true,
      },
    },
  });
};
