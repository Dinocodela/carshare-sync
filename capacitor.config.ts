import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.6217b87f22674316ad961ec3820510a8",
  appName: "TESLYS Carshare",
  webDir: "dist",
  bundledWebRuntime: false,
  
  // Remove server config for production builds
  // server: {
  //   url: "https://6217b87f-2267-4316-ad96-1ec3820510a8.lovableproject.com?forceHideBadge=true",
  //   cleartext: true,
  // },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#000000",
    },
    Keyboard: {
      resize: "native",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Camera: {
      permissions: ["camera", "photos"],
    },
  },

  ios: {
    scheme: "TESLYS Carshare",
    contentInset: "automatic",
  },

  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
    allowMixedContent: true,
  },
};

export default config;
