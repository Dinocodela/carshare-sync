import { useState } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useToast } from './use-toast';

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
}

export function useCameraCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();
  const isNative = Capacitor.isNativePlatform();

  const requestPermissions = async () => {
    if (!isNative) return true;
    
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted' || permissions.photos === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const takePhoto = async (options: CameraOptions = {}) => {
    setIsCapturing(true);
    
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        toast({
          title: "Permission denied",
          description: "Camera access is required to take photos.",
          variant: "destructive"
        });
        return null;
      }

      const photo = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: options.allowEditing || false,
        resultType: options.resultType || CameraResultType.DataUrl,
        source: options.source || CameraSource.Camera,
      });

      return photo;
    } catch (error: any) {
      if (error.message !== 'User cancelled photos app') {
        toast({
          title: "Camera error",
          description: "Failed to capture photo. Please try again.",
          variant: "destructive"
        });
      }
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const selectFromGallery = async (options: CameraOptions = {}) => {
    return takePhoto({
      ...options,
      source: CameraSource.Photos,
    });
  };

  const showActionSheet = async (options: CameraOptions = {}): Promise<Photo | null> => {
    if (!isNative) {
      // On web, just show file input
      return null;
    }

    try {
      const photo = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: options.allowEditing || false,
        resultType: options.resultType || CameraResultType.DataUrl,
        source: CameraSource.Prompt, // This shows the action sheet
      });

      return photo;
    } catch (error: any) {
      if (error.message !== 'User cancelled photos app') {
        toast({
          title: "Error",
          description: "Failed to access camera or photos.",
          variant: "destructive"
        });
      }
      return null;
    }
  };

  const convertPhotoToFile = async (photo: Photo, filename?: string): Promise<File | null> => {
    if (!photo.dataUrl) return null;

    try {
      const response = await fetch(photo.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename || `photo_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      return file;
    } catch (error) {
      console.error('Error converting photo to file:', error);
      return null;
    }
  };

  return {
    takePhoto,
    selectFromGallery,
    showActionSheet,
    convertPhotoToFile,
    isCapturing,
    isNative,
  };
}