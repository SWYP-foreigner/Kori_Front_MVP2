import api from '../axiosInstance';

export async function patchLocation(latitude: string | null, longuitude: string | null) {
  try {
    const response = await api.patch('/api/v1/member/location', {
      latitude: latitude,
      longitude: longuitude,
    });

    if (response.status !== 200) {
      console.error('[ERROR] 위치 정보 저장 실패');
    }
  } catch (error) {
    console.error('[ERROR] 위치 정보 저장 요청 실패', error);
  }
}
