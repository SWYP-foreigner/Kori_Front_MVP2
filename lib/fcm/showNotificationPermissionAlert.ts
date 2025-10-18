import { Alert, AppState, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export async function showNotificationPermissionAlert() {
  return new Promise((resolve) => {
    Alert.alert(
      'Notification Permission Required',
      'You need to allow notifications in your device settings to receive updates from Kori.\nWould you like to go to Settings?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve('cancelled') },
        {
          text: 'Go to Settings',
          onPress: async () => {
            const subscriptAppState = AppState.addEventListener('change', async (state) => {
              if (state === 'active') {
                const { status } = await Notifications.getPermissionsAsync();
                subscriptAppState.remove();
                resolve(status);
              }
            });

            try {
              if (Platform.OS === 'ios') {
                await Linking.openURL('app-settings:');
              } else {
                await Linking.openSettings();
              }
            } catch (error) {
              console.error('[ERROR] 설정 화면으로 이동 실패:', error);
              resolve('denied');
            }
          },
        },
      ],
    );
  });
}
