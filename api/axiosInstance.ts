import * as SecureStore from "expo-secure-store";
import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig
} from 'axios';

const BASE_URL = (`https://dev.ko-ri.cloud`);


const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
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
        const token = await SecureStore.getItemAsync("jwt");
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
