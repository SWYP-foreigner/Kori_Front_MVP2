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
const fetchItems = async () => {
  try {
    const res = await api.get('/health'); // /api/v1/items 경로 예시
    console.log('데이터 조회 성공:', res.data);
  } catch (err: any) {
    console.error('조회 실패:', err.response?.data || err.message);
  }
};

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
