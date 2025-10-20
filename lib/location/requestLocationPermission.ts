import * as Location from 'expo-location';

export async function requestLocationPermission() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.error('[ERROR] 사용자가 위치 정보 권한을 허용하지 않음');
      return { latitude: null, longitude: null };
    }

    const location = await Location.getLastKnownPositionAsync();
    return {
      latitude: location ? String(location.coords.latitude) : null,
      longitude: location ? String(location.coords.longitude) : null,
    };
  } catch (error) {
    console.error('[ERROR] 위치 정보를 가져오는 중 오류 발생', error);
    throw error;
  }
}
