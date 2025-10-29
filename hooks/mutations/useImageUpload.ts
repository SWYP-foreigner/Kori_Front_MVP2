import { getPresignedUrls, PresignRequest } from '@/api/community/images';
import { useMutation } from '@tanstack/react-query';

export function usePresignedUpload() {
  return useMutation({
    mutationFn: (body: PresignRequest) => getPresignedUrls(body),
  });
}
