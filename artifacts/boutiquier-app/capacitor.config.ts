import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.livipro.boutiquier',
  appName: 'LiviPro Boutiquier',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
};

export default config;
