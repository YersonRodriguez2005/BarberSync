import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.barbersync.app',
  appName: 'BarberSync',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
