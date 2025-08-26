import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig
} from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://dev.ko-ri.cloud';

function maskToken(t?: string | null) {
    if (!t) return 'no';
    return `yes(Bearer ${t.slice(0, 10)}...)`;
}

function shortUrl(base: string, url?: string) {
    if (!url) return '';
    try {
        const u = new URL(url, base);
        return u.pathname + (u.search || '');
    } catch {
        return url;
    }
}

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { Accept: 'application/json' },
});

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const isFormData =
            typeof FormData !== 'undefined' && config.data instanceof FormData;
        if (!isFormData) {
            (config.headers as any)['Content-Type'] = 'application/json';
        }

        const token = await SecureStore.getItemAsync('jwt');
        if (token) {
            (config.headers as any).Authorization = `Bearer ${token}`;
        }

        (config as any).meta = { start: Date.now(), token };

        const method = (config.method || 'GET').toUpperCase();
        const url = new URL(config.url || '', config.baseURL || BASE_URL).toString();
        console.log(`[axios:req] ${method} ${url} auth=${maskToken(token)}`);

        if (config.params) {
            console.log('[axios:req] params', config.params);
        }
        if (config.data && !isFormData) {
            try {
                const s = JSON.stringify(config.data);
                if (s.length <= 400) console.log('[axios:req] body', JSON.parse(s));
                else console.log('[axios:req] body(len)', s.length);
            } catch { /* noop */ }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (res) => {
        const cfg: any = res.config || {};
        const ms = cfg.meta?.start ? Date.now() - cfg.meta.start : undefined;
        const path = shortUrl(BASE_URL, res.config.url);
        console.log(`[axios:res] ${res.status} ${path}${ms ? ` (${ms}ms)` : ''}`);
        return res;
    },
    async (error: AxiosError<any>) => {
        const cfg: any = error.config || {};
        const ms = cfg.meta?.start ? Date.now() - cfg.meta.start : undefined;
        const status = error.response?.status ?? 'ERR';
        const path = cfg?.url ? shortUrl(BASE_URL, cfg.url) : '';
        console.log(
            `[axios:err] ${status} ${path}${ms ? ` (${ms}ms)` : ''}`,
            error.response?.data || error.message
        );
        return Promise.reject(error);
    }
);

export default api;
