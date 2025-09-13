import { useState, useEffect, useCallback } from 'react';

const WALLPAPER_IMAGE_KEY = 'vibeCoderWallpaper';

export function useWallpaper(): [string | null, (newImage: string | null) => void] {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedImage = localStorage.getItem(WALLPAPER_IMAGE_KEY);
      if (storedImage) {
        setImage(storedImage);
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
  }, []);

  const setAndStoreImage = useCallback((newImage: string | null) => {
    try {
      if (newImage) {
        localStorage.setItem(WALLPAPER_IMAGE_KEY, newImage);
      } else {
        localStorage.removeItem(WALLPAPER_IMAGE_KEY);
      }
      setImage(newImage);
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  }, []);

  return [image, setAndStoreImage];
}