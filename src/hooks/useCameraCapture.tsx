import { useState } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useToast } from './use-toast';

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
}

export function useCameraCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();
  const isNative = Capacitor.isNativePlatform();

  const ensurePermission = async (kind: 'camera' | 'photos') => {
    if (!isNative) return true;

    const toBool = (v?: string) => v === 'granted' || v === 'limited';

    let status = await Camera.checkPermissions();
    let ok = toBool(status[kind]);

    if (!ok) {
      status = await Camera.requestPermissions({ permissions: [kind] as any });
      ok = toBool(status[kind]);
    }

    if (!ok) {
      toast({
        title: 'Permission needed',
        description:
          kind === 'photos'
            ? 'Photo library access is required to select images.'
            : 'Camera access is required to take photos.',
        variant: 'destructive',
      });
    }
    return ok;
  };

  const getPhoto = async (source: CameraSource, options: CameraOptions = {}) => {
    setIsCapturing(true);
    try {
      const kind = source === CameraSource.Camera ? 'camera' : 'photos';
      const ok = await ensurePermission(kind);
      if (!ok) return null;

      const photo = await Camera.getPhoto({
        quality: options.quality ?? 85,
        allowEditing: options.allowEditing ?? false,
        // IMPORTANT: use Uri to avoid huge base64 payloads that crash the webview
        resultType: CameraResultType.Uri,
        saveToGallery: false,
        source,
      });

      return photo;
    } catch (error: any) {
      const msg = String(error?.message || '');
      if (!/cancel/i.test(msg)) {
        toast({
          title: 'Photo error',
          description: 'Failed to access camera or photos.',
          variant: 'destructive',
        });
        console.error('Camera error:', error);
      }
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const takePhoto = (options?: CameraOptions) => getPhoto(CameraSource.Camera, options);
  const selectFromGallery = (options?: CameraOptions) => getPhoto(CameraSource.Photos, options);

  // Keep using the action sheet if you like — it now returns a URI as well
  const showActionSheet = (options?: CameraOptions) => getPhoto(CameraSource.Prompt, options);

  // Convert to File using the URI (webPath), with fallback to dataUrl if present
  const convertPhotoToFile = async (photo: Photo, filename?: string): Promise<File | null> => {
    try {
      const url = photo.webPath || photo.path || photo.dataUrl;
      if (!url) return null;
      const res = await fetch(url);
      const blob = await res.blob();
      return new File([blob], filename || `photo_${Date.now()}.jpg`, {
        type: blob.type || 'image/jpeg',
      });
    } catch (err) {
      console.error('Error converting photo to file:', err);
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
