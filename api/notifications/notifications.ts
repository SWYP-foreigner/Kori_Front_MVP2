import api from '../axiosInstance';

const notificationType = ['post', 'comment', 'chat', 'follow', 'receive', 'followuserpost', 'newuser'] as const;

export type NotificationType = (typeof notificationType)[number];
export interface NotificationSetting {
  notificationType: NotificationType;
  enabled: boolean;
}

/* ---------- FCM 기기 토큰 등록/갱신 ----------- */
export async function postFcmDeviceToken(fcmDeviceToken: string) {
  try {
    const { data } = await api.post(`/api/v1/user/notification/device-token`, { deviceToken: fcmDeviceToken });

    if (data) {
      console.log('[SUCCESS] FCM 토큰 서버 전송 성공:', data);
      return data;
    }
  } catch (error) {
    console.error('[ERROR] FCM 토큰 서버 전송 실패:', error);
    throw error;
  }
}

/* ---------- 알림 설정 상태 확인 ----------- */
export async function getNotificationsSettingStatus(): Promise<NotificationSetting[]> {
  try {
    const { data } = await api.get(`/api/v1/user/notification`);

    if (data && data.message === 'success') {
      console.log('[SUCCESS] 알림 설정 상태 확인 성공:', data);
      return data.data as NotificationSetting[];
    } else {
      console.log('[ERROR] 알림 설정 상태 확인 실패:', data.message);
      throw new Error(data?.message || '[ERROR] 알림 설정 상태를 불러오지 못했습니다.');
    }
  } catch (error) {
    console.error('[ERROR] 요청 중 에러 발생:', error);
    throw error;
  }
}

/* ---------- 알림 상세 설정 수정 ----------- */
export async function putNotificationsSettingStatus(notificationSettings: NotificationSetting[]) {
  try {
    const { data } = await api.put(`/api/v1/user/notification`, {
      settings: notificationSettings,
    });

    if (data) {
      console.log('[SUCCESS] 알림 상세 설정 변경 완료:', data);
    } else {
      throw new Error(data?.message || '알림 상세 설정을 변경하지 못했습니다.');
    }
  } catch (error) {
    console.error('[ERROR] 알림 상세 설정 변경 실패:', error);
    throw error;
  }
}

/* ---------- OS 푸시 권한 상태 동기화 ----------- */
export async function putOSPushAgreement(osPermissionGranted: boolean) {
  try {
    const { data } = await api.put(`/api/v1/user/notification/push-agreement`, {
      osPermissionGranted: osPermissionGranted,
    });

    if (data) {
      console.log('[SUCCESS] OS 푸시 권한 상태 동기화 성공:', data);
      return data;
    }
  } catch (error) {
    console.error('[ERROR] OS 푸시 권한 상태 동기화 실패:', error);
    throw error;
  }
}

/* ---------- 알림 상세 설정 초기화 ----------- */
export async function initNotificationsSettingStatus() {
  const settings: NotificationSetting[] = [
    {
      notificationType: 'post',
      enabled: true,
    },
    {
      notificationType: 'comment',
      enabled: true,
    },
    {
      notificationType: 'chat',
      enabled: true,
    },
    {
      notificationType: 'follow',
      enabled: true,
    },
    {
      notificationType: 'receive',
      enabled: true,
    },
    {
      notificationType: 'followuserpost',
      enabled: true,
    },
    {
      notificationType: 'newuser',
      enabled: true,
    },
  ];

  try {
    const { data } = await api.post(`/api/v1/user/notification/init`, { settings: settings });

    if (data) {
      console.log('[SUCCESS] 알림 상세 설정 초기화 성공:', data);
      return data;
    }
  } catch (error) {
    console.error('[ERROR] 알림 상세 설정 초기화 실패:', error);
    throw error;
  }
}
