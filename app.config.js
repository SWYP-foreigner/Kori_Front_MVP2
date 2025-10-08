import 'dotenv/config';

export default {
  expo: {
    name: 'Kori',
    slug: 'Kori_Front',
    owner: 'koriapp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/Kori_Icon.png',
    scheme: 'korifront',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    splash: {
      image: './assets/images/character_02.png',
      resizeMode: 'contain',
      backgroundColor: '#0f0f10',
    },

    ios: {
      bundleIdentifier: 'com.SWYP.kori',
      supportsTablet: true,
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: 'Camera access is required to take and upload photos within the app.',
        NSPhotoLibraryUsageDescription:
          'Photo library access is required to upload photos for use in Friend Recommendations, Chatting, and Community features.',
        UIBackgroundModes: ['remote-notification'],
      },
      entitlements: {
        'aps-environment': 'production',
      },
      googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST || './GoogleService-Info.plist',
    },

    android: {
      package: 'com.SWYP.kori',
      permissions: ['android.permission.INTERNET', 'android.permission.RECORD_AUDIO'],
      usesCleartextTraffic: false,
      softwareKeyboardLayoutMode: 'resize',
      edgeToEdgeEnabled: true,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
    },

    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      'expo-router',
      'expo-apple-authentication',
      [
        'expo-splash-screen',
        {
          image: './assets/images/AppLogo.png',
          imageWidth: 150,
          resizeMode: 'contain',
          backgroundColor: '#0f0f10',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you share them with your friends.',
        },
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: 'com.googleusercontent.apps.86972168076-m7l8vrcmav3v3pofhu6ssheq39s9kvht',
        },
      ],
      'expo-secure-store',
      'expo-web-browser',
      'expo-font',

      // Firebase 관련
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',

      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      router: {},
      eas: {
        projectId: 'ebde49c4-4dbe-4c95-9f09-52f33096566c',
      },
    },
  },
};
