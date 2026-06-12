import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.akasha.app',
  appName: 'Akasha',
  /**
   * webDir: diretório com o entry point HTML do app.
   * Para desenvolvimento: run `next dev` e configure Android Studio para
   * carregar de http://localhost:3000
   *
   * Para produção: fazer deploy para Vercel e configurar server.url.
   *
   * O build é preparado por scripts/capacitor-build-android.sh
   */
  webDir: 'capacitor',
  /**
   * Configuração do servidor para desenvolvimento.
   *
   * Para emulator Android (AVD):
   *   - Android emulator usa 10.0.2.2 para acessar host localhost
   *
   * Para dispositivo real:
   *   - Usar IP da rede local (ex: 192.168.1.x:3000)
   *
   * Para produção:
   *   - Configurar CAPACITOR_SERVER_URL no ambiente (ex: https://akasha.vercel.app)
   *   - Remover cleartext: true
   */
  server: {
    url: 'https://akasha-portal-jy1lmsbbw-letteriellos-projects.vercel.app',
    cleartext: false,
  },
  /**
   * Configuração específica do Android.
   */
  android: {
    /**
     * Caminho personalizado para o projeto Android.
     */
    path: 'android',
    /**
     * Versão mínima do WebView Android.
     * Capacitor requer no mínimo 55, default é 60.
     */
    minWebViewVersion: 60,
    /**
     * Permite conteúdo misto (HTTP + HTTPS).
     * Necessário para desenvolvimento com servidor HTTP.
     */
    allowMixedContent: true,
  },
  /**
   * Configuração específica do iOS.
   */
  ios: {
    /**
     * Caminho personalizado para o projeto iOS.
     */
    path: 'ios',
  },
  /**
   * Configuração dos plugins built-in.
   */
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0B0E1C',
      showSpinner: false,
    },
  },
};

export default config;
