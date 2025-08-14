import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig
} from 'axios';

const BASE_URL = (`https://dev.ko-ri.cloud`);

export const ACCESS_TOKEN_KEY = 'accessToken';

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        Accept: 'application/json',
    },
});

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const isFormData = config.data instanceof FormData;
        if (!isFormData) {
            (config.headers as any)['Content-Type'] = 'application/json';
        }
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
            (config.headers as any).Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        return Promise.reject(error);
    }
);

export default api;

export async function setAccessToken(token: string | null) {
    if (token) {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    }
}

export function setBaseURL(url: string) {
    api.defaults.baseURL = url;
}
