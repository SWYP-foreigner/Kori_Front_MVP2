

import { ACCESS_KEY, isRefreshBlocked, REFRESH_KEY } from "@/src/lib/auth/session";
import { Config } from "@/src/lib/config";
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = Config.SERVER_URL;

function maskToken(t?: string | null) {
    if (!t) return "no";
    const v = t.startsWith("Bearer ") ? t.slice(7) : t;
    return `yes(Bearer ${v.slice(0, 10)}...)`;
}

function shortUrl(base: string, url?: string) {
    if (!url) return "";
    try {
        const u = new URL(url, base);
        return u.pathname + (u.search || "");
    } catch {
        return url;
    }
}

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { Accept: "application/json" },
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const isFormData =
            typeof FormData !== "undefined" && config.data instanceof FormData;
        if (!isFormData) {
            (config.headers as any)["Content-Type"] = "application/json";
        }

        const token = await SecureStore.getItemAsync(ACCESS_KEY);
        if (token) {
            (config.headers as any).Authorization = `Bearer ${token}`;
        }

        (config as any).meta = { start: Date.now(), token };

        const method = (config.method || "GET").toUpperCase();
        const base = config.baseURL || BASE_URL;
        const fullUrl = new URL(config.url || "", base).toString();
        console.log(`[axios:req] ${method} ${fullUrl} auth=${maskToken(token)}`);

        if (config.params) console.log("[axios:req] params", config.params);
        if (config.data && !isFormData) {
            try {
                const s = JSON.stringify(config.data);
                if (s.length <= 400) console.log("[axios:req] body", JSON.parse(s));
                else console.log("[axios:req] body(len)", s.length);
            } catch { }
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
        console.log(`[axios:res] ${res.status} ${path}${ms ? ` (${ms}ms)` : ""}`);
        return res;
    },
    async (error: AxiosError<any>) => {
        const cfg: any = error.config || {};
        const ms = cfg.meta?.start ? Date.now() - cfg.meta.start : undefined;
        const status = error.response?.status ?? "ERR";
        const path = cfg?.url ? shortUrl(cfg.baseURL || BASE_URL, cfg.url) : "";
        console.log(
            `[axios:err] ${status} ${path}${ms ? ` (${ms}ms)` : ""}`,
            error.response?.data || error.message
        );

    if (status === 401 && !cfg._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            cfg.headers["Authorization"] = "Bearer " + token;
            return api(cfg);
          })
          .catch((err) => Promise.reject(err));
      }

      cfg._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refresh");
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(`${BASE_URL}/api/v1/member/refresh`, { refreshToken });
        const newToken = res.data.accessToken;
        await SecureStore.setItemAsync("jwt", newToken);
        
        api.defaults.headers.common["Authorization"] = "Bearer " + newToken;
        processQueue(null, newToken);

        cfg.headers["Authorization"] = "Bearer " + newToken;
        return api(cfg);
      } catch (err) {
        processQueue(err, null);

        // refresh token 만료 → JWT 삭제 및 로그인 페이지 이동
        await SecureStore.deleteItemAsync("jwt");
        await SecureStore.deleteItemAsync("refresh");

        console.log("Refresh token expired, redirecting to login...");
        router.replace("/login"); // 로그인 페이지로 이동

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

