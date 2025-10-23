import notifee, { EventType } from '@notifee/react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Href, router } from 'expo-router';

/* --------------- push를 notifee로 표시 --------------- */
export const messageHandler = (message: FirebaseMessagingTypes.RemoteMessage) => {
  const { notification, data } = message;

  const title = notification?.title ?? 'Notification from Kori';
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

/* --------------- push notifee 클릭 시 data에 해당하는 페이지로 이동 --------------- */
export const handleNotificationPress = (pathname: string) => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      const data = detail.notification?.data;
      if (!data) {
        console.error('[ERROR] 포그라운드 알림 데이터가 존재하지 않음');
        return;
      }
      notificationRouterReplace(data, pathname);
    }
  });
};

const TARGET_ROUTER: Record<string, Href> = {
  post: '/community/[id]',
  comment: '/community/[id]',
  followUserPost: '/community/[id]',
  chat: '/screens/chatscreen/ChattingRoomScreen',
  follow: '/(tabs)/mypage/follows',
  receive: '/(tabs)/mypage/friends',
};

export function notificationRouterReplace(data: { [key: string]: string | number | object }, pathname: string) {
  const targetRoute = String(TARGET_ROUTER[data.type as string]);

  if (pathname === targetRoute) return;

  switch (data.type) {
    case 'post':
    case 'comment':
      if (!pathname.includes('community')) router.dismissAll();
      return router.navigate({
        pathname: `/(tabs)/community/[id]`,
        params: { id: String(data.postId), commentId: String(data.commentId) },
      });
    case 'followuserpost':
      if (!pathname.includes('community')) router.dismissAll();
      return router.navigate({
        pathname: `/(tabs)/community/[id]`,
        params: { id: String(data.postId) },
      });
    case 'chat':
      if (!pathname.includes('chat')) router.dismissAll();
      return router.navigate({
        pathname: `/screens/chatscreen/ChattingRoomScreen`,
        params: { roomId: String(data.roomId), myId: String(data.myId) },
      });
    case 'follow':
      if (!pathname.includes('mypage')) router.dismissAll();
      return router.navigate({
        pathname: `/(tabs)/mypage/follows`,
        params: { followerId: String(data.followerId) },
      });
    case 'receive':
      if (!pathname.includes('mypage')) router.dismissAll();
      return router.navigate({
        pathname: `/(tabs)/mypage/friends`,
        params: { friendId: String(data.friendId) },
      });
    case 'newuser':
      break;
    default:
      console.error('[ERROR] 알림 type이 존재하지 않음:', data.type);
      break;
  }
}
