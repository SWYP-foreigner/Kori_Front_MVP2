export function getNotificationDeeplink(data: { [key: string]: string | number | object }): string | null {
  if (!data?.type) {
    console.error('[ERROR] 알림 type이 존재하지 않음:', data);
    return null;
  }

  try {
    switch (data.type) {
      case 'post':
      case 'comment':
        return `korifront://(tabs)/community/${data.postId}?commentId=${data.commentId ?? ''}`;

      case 'followuserpost':
        return `korifront://(tabs)/community/${data.postId}`;

      case 'chat':
        return `korifront://(tabs)/chat/ChattingRoomScreen?roomId=${data.roomId}&myId=${data.myId}`;

      case 'follow':
        return `korifront://(tabs)/mypage/follows?followerId=${data.followerId}`;

      case 'receive':
        return `korifront://(tabs)/mypage/friends?friendId=${data.friendId}`;

      default:
        console.error('[ERROR] 알림 type이 매칭되지 않음:', data.type);
        return null;
    }
  } catch (error) {
    console.error('[ERROR] 딥링크 생성 중 오류 발생:', error);
    return null;
  }
}
