import { getMyProfile } from '@/api/mypage/mypage';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const MY_PROFILE_QK = ['mypage', 'profile'] as const;

export type MyProfile = {
  id?: number | string;
  userId?: number | string;
  firstname?: string;
  lastname?: string;
  gender?: string;
  birthday?: string;
  country?: string;
  introduction?: string;
  purpose?: string;
  email?: string;
  language?: string[];
  hobby?: string[];
  imageKey?: string;
  imageUrl?: string;
} | null;

export default function useMyProfile() {
  return useQuery<MyProfile>({
    queryKey: MY_PROFILE_QK,
    queryFn: getMyProfile,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function setMyProfileCache(queryClient: QueryClient, patch: Partial<NonNullable<MyProfile>>) {
  queryClient.setQueryData(MY_PROFILE_QK, (prev: MyProfile) => {
    if (!prev) return (patch as MyProfile) ?? null;
    return {
      ...prev,
      ...patch,
      imageKey: patch.imageKey ?? prev.imageKey,
      imageUrl: patch.imageUrl ?? prev.imageUrl,
    };
  });
}
