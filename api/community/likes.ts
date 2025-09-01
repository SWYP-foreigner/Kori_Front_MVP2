import api from '@/api/axiosInstance';

function logLike(op: 'LIKE(PUT)' | 'UNLIKE(DELETE)' | 'TOGGLE', postId: number, extra?: any) {
    console.log(`[like:${op}] postId=${postId}`, extra ?? '');
}

export async function likePost(postId: number) {
    logLike('LIKE(PUT)', postId);
    await api.put(`/api/v1/posts/${postId}/likes/me`, null, {
        headers: { 'X-Debug-Like-Op': 'PUT' }, // 서버 액세스 로그에 남길 힌트용(선택)
    });
    return true;
}

export async function unlikePost(postId: number) {
    logLike('UNLIKE(DELETE)', postId);
    await api.delete(`/api/v1/posts/${postId}/likes/me`, {
        headers: { 'X-Debug-Like-Op': 'DELETE' },
    });
    return true;
}

export async function toggleLike(postId: number, liked: boolean) {
    logLike('TOGGLE', postId, { liked }); // ← 요청 직전에 liked 값 로깅
    return liked ? unlikePost(postId) : likePost(postId);
}
