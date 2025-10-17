import * as Notifications from 'expo-notifications';

export const getOSNotificationPermissionStatus = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};
