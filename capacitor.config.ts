import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
	appId: "com.app.teslys",
	appName: "Teslys",
	webDir: "dist",

	// Remove server config for production builds
	// server: {
	//   url: "https://6217b87f-2267-4316-ad96-1ec3820510a8.lovableproject.com?forceHideBadge=true",
	//   cleartext: true,
	// },

	plugins: {
		SplashScreen: {
			launchShowDuration: 2000,
			autoHide: true,
			backgroundColor: "#000000",
			showSpinner: false,

		},
		StatusBar: {
			style: "DARK",
			backgroundColor: "#ffffff",
			overlaysWebView: true,
		},
		EdgeToEdge: {
			backgroundColor: "#ffffff"
		},
		Keyboard: {
			resize: "native",
			resizeOnFullScreen: true
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
		contentInset: "never",
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
