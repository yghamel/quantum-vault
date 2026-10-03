import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.projecteleven.quantumvault',
  appName: 'Quantum Vault',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    // CSS applies env(safe-area-inset-*); a native inset would double it and
    // make the WKWebView scroll view scrollable.
    contentInset: 'never',
    backgroundColor: '#09090b'
  }
};

export default config;
