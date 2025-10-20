import notifee, { EventType } from '@notifee/react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { router } from 'expo-router';

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

export function notificationRouterReplace(data: { [key: string]: string | number | object }) {
  console.log('❗️notification data:', data); // TODO 삭제

  router.replace('/(tabs)');

  setTimeout(() => {
    switch (data.type) {
      case 'post':
      case 'comment':
        return router.push({
          pathname: `/(tabs)/community/[id]`,
          params: { id: String(data.postId), commentId: String(data.commentId) },
        });
      case 'followuserpost':
        return router.push({
          pathname: `/(tabs)/community/[id]`,
          params: { id: String(data.postId) },
        });
      case 'chat':
        return router.push({
          pathname: `/screens/chatscreen/ChattingRoomScreen`,
          params: { roomId: String(data.roomId), myId: String(data.myId) },
        });
      case 'follow':
        return router.push({
          pathname: `/(tabs)/mypage/follows`,
          params: { followerId: String(data.followerId) },
        });
      case 'receive':
        return router.push({
          pathname: `/(tabs)/mypage/friends`,
          params: { friendId: String(data.friendId) },
        });
      case 'newuser':
        break;
      default:
        console.error('[ERROR] 알림 type이 존재하지 않음:', data.type);
        break;
    }
  }, 100);
}

/* --------------- push notifee 클릭 시 data에 해당하는 페이지로 이동 --------------- */
export const handleNotificationPress = () => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      const data = detail.notification?.data;
      if (!data) {
        console.error('[ERROR] 포그라운드 알림 데이터가 존재하지 않음');
        return;
      }
      notificationRouterReplace(data);
    }
  });
};
