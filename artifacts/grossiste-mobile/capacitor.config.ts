import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.livipro.grossiste',
  appName: 'LiviPro Grossiste',
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
