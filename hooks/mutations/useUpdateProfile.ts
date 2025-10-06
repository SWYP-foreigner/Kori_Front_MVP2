import api from '@/api/axiosInstance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

export type UpdateProfilePayload = Partial<{
  firstname: string;
  lastname: string;
  gender: string;
  birthday: string;
  country: string;
  introduction: string;
  purpose: string;
  email: string;
  language: string[];
  hobby: string[];
  imageKey: string;
}>;

const BASE_URL = ((api as any)?.defaults?.baseURL || '').replace(/\/$/, '');
const SETUP_URL = `${BASE_URL}/api/v1/member/profile/setup`;

async function getToken() {
  try {
    return await SecureStore.getItemAsync('jwt');
  } catch {
    return null;
  }
}

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const token = await getToken();

      const res = await fetch(SETUP_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : null;
      }

      let detail: any = null;
      try {
        const ct = res.headers.get('content-type') || '';
        detail = ct.includes('application/json') ? await res.json() : await res.text();
      } catch {}

      const msg = (detail && (detail.message || detail.error)) || `${res.status} ${res.statusText}`;
      const err = new Error(msg) as Error & { status?: number; detail?: any };
      err.status = res.status;
      err.detail = detail;
      throw err;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
}
