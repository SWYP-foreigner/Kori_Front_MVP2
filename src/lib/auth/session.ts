import api from '@/api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

export const ACCESS_KEY = 'jwt';
export const REFRESH_KEY = 'refresh_token';
export const PROFILE_KEY = 'profile';

let refreshBlocked = false;
export const blockTokenRefresh = () => { refreshBlocked = true; };
export const isRefreshBlocked = () => refreshBlocked;

export async function authLocalCleanup(qc?: QueryClient) {
    await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_KEY).catch(() => { }),
        SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => { }),
        AsyncStorage.removeItem(PROFILE_KEY).catch(() => { }),
    ]);

    delete (api.defaults.headers as any).Authorization;

    if (qc) {
        if (qc.clear) qc.clear();
        else { qc.removeQueries(); qc.resetQueries(); }
    }
}
