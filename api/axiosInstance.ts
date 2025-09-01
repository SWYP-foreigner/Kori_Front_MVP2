import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig
} from 'axios';
import { Config } from "@/src/lib/config";

const BASE_URL = Config.SERVER_URL;

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

const REAL_ID_POOL = Array.from({ length: 19 }, (_, i) => i + 2);
const ID_MAP_PATTERNS = [
    /^\/api\/v1\/follow\/(\d+)(\?.*)?$/,
    /^\/api\/v1\/home\/chat\/(\d+)(\?.*)?$/,
    /^\/api\/v1\/chat\/direct\/(\d+)(\?.*)?$/,
];

function mapDummyIdInUrl(
    url: string | undefined
): { url: string; mapped?: { from: number; to: number; endpoint: string } } {
    if (!url || !__DEV__) return { url: url || '' };

    for (const re of ID_MAP_PATTERNS) {
        const m = url.match(re);
        if (!m) continue;
        const from = Number(m[1]);
        if (!Number.isFinite(from) || from < 100000) return { url };
        const to = REAL_ID_POOL[from % REAL_ID_POOL.length];
        const endpoint = re.toString();
        const newUrl = url.replace(/\/\d+(\?.*)?$/, `/${to}${m[2] || ''}`);
        return { url: newUrl, mapped: { from, to, endpoint } };
    }
    return { url };
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

        if (config.url) {
            const { url: newUrl, mapped } = mapDummyIdInUrl(config.url);
            if (mapped) {
                config.url = newUrl;
                (config.headers as any)['X-Dummy-Map'] = `${mapped.from}->${mapped.to}`;
                console.log(`[dummy-map] ${mapped.endpoint} ${mapped.from} -> ${mapped.to}`);
            }
        }

        (config as any).meta = { start: Date.now(), token };

        const method = (config.method || 'GET').toUpperCase();
        const base = config.baseURL || BASE_URL;
        const fullUrl = new URL(config.url || '', base).toString();
        console.log(`[axios:req] ${method} ${fullUrl} auth=${maskToken(token)}`);

        if (config.params) console.log('[axios:req] params', config.params);
        if (config.data && !isFormData) {
            try {
                const s = JSON.stringify(config.data);
                if (s.length <= 400) console.log('[axios:req] body', JSON.parse(s));
                else console.log('[axios:req] body(len)', s.length);
            } catch {
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (res) => {
        const cfg: any = res.config || {};
        const ms = cfg.meta?.start ? Date.now() - cfg.meta.start : undefined;
        const path = shortUrl(cfg.baseURL || BASE_URL, res.config.url);
        console.log(`[axios:res] ${res.status} ${path}${ms ? ` (${ms}ms)` : ''}`);
        return res;
    },
    async (error: AxiosError<any>) => {
        const cfg: any = error.config || {};
        const ms = cfg.meta?.start ? Date.now() - cfg.meta.start : undefined;
        const status = error.response?.status ?? 'ERR';
        const path = cfg?.url ? shortUrl(cfg.baseURL || BASE_URL, cfg.url) : '';
        console.log(
            `[axios:err] ${status} ${path}${ms ? ` (${ms}ms)` : ''}`,
            error.response?.data || error.message
        );
        return Promise.reject(error);
    }
);

export default api;
