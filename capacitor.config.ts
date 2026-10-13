import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lucidintel.quantumvaultwallet',
  appName: 'Quantum Vault Wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    // CSS applies env(safe-area-inset-*); a native inset would double it and
    // make the WKWebView scroll view scrollable.
    contentInset: 'never',
    backgroundColor: '#09090b'
  },
  plugins: {
    SplashScreen: {
      // Hidden early by hideNativeSplash() once the first screen renders;
      // this duration is only the ceiling for a boot that never gets there.
      launchShowDuration: 10000,
      launchAutoHide: true,
      launchFadeOutDuration: 150,
      backgroundColor: '#09090b',
      showSpinner: false
    }
  }
};

export default config;
