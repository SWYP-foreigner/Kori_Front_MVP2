// 1. 'api' import를 제거합니다.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
// 2. 'axios'에서 AxiosInstance 타입을 import 합니다.
import { AxiosInstance } from 'axios';

export const ACCESS_KEY = 'jwt';
export const REFRESH_KEY = 'refresh';
export const PROFILE_KEY = 'profile';

let refreshBlocked = false;
export const blockTokenRefresh = () => {
  refreshBlocked = true;
};
export const isRefreshBlocked = () => refreshBlocked;

// 3. authLocalCleanup 함수가 'api: AxiosInstance'를 첫 번째 인자로 받도록 수정합니다.
export async function authLocalCleanup(api: AxiosInstance, qc?: QueryClient) {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY).catch(() => { }),
    SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => { }),
    AsyncStorage.removeItem(PROFILE_KEY).catch(() => { }),
  ]);

  // 4. 인자로 받은 'api'를 사용합니다.
  delete (api.defaults.headers as any).Authorization;

  if (qc) {
    if (qc.clear) qc.clear();
    else {
      qc.removeQueries();
      qc.resetQueries();
    }
  }
}