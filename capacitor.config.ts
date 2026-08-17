import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.eksperiq.app",
  appName: "EksperIQ",
  webDir: "out",
  plugins: {
    Keyboard: {
      // WKWebView'da varsayilan olarak klavye vh/dvh'yi kucultmuyor; "native"
      // webview'i gercekten yeniden boyutlandirir, boylece klavye acikken
      // fixed/100dvh sabitli sheet'ler (orn. arac ekleme formu) klavyenin
      // altinda kalmaz.
      resize: "native",
    },
  },
};

export default config;
