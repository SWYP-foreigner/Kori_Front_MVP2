export function getNotificationDeeplink(data: { [key: string]: string | number | object }): string | null {
  if (!data?.type) {
    console.error('[ERROR] 알림 type이 존재하지 않음:', data);
    return null;
  }

  try {
    switch (data.type) {
      case 'post':
      case 'comment':
        return `kori://community/${data.postId}?commentId=${data.commentId ?? ''}`;

      case 'followuserpost':
        return `kori://community/${data.postId}`;

      case 'chat':
        return `kori://screens/chatscreen/ChattingRoomScreen?roomId=${data.roomId}&myId=${data.myId}`;

      case 'follow':
        return `kori://mypage/follows?followerId=${data.followerId}`;

      case 'receive':
        return `kori://mypage/friends?friendId=${data.friendId}`;

      case 'newuser':
        return `kori://community`;

      default:
        console.error('[ERROR] 알림 type이 매칭되지 않음:', data.type);
        return null;
    }
  } catch (e) {
    console.error('[ERROR] 딥링크 생성 중 오류 발생:', e);
    return null;
  }
}
