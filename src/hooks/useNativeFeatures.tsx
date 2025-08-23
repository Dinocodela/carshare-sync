import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

export function useNativeFeatures() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const setupNative = async () => {
      const isNativePlatform = Capacitor.isNativePlatform();
      setIsNative(isNativePlatform);

      if (isNativePlatform) {
        try {
          // Configure status bar
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#000000' });

          // Hide splash screen after app loads
          await SplashScreen.hide();

          // Configure keyboard behavior
          Keyboard.addListener('keyboardWillShow', () => {
            document.body.classList.add('keyboard-open');
          });

          Keyboard.addListener('keyboardWillHide', () => {
            document.body.classList.remove('keyboard-open');
          });
        } catch (error) {
          console.warn('Error setting up native features:', error);
        }
      }
    };

    setupNative();
  }, []);

  return {
    isNative,
    isWeb: !isNative,
  };
}