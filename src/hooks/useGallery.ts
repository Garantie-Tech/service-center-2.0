import { useState } from "react";

export const useGallery = (images: (string | File)[]) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<string | File | null>(null);

  const openGallery = (index: number) => {
    setSelectedImage(images[index]);
    setCurrentIndex(index);
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < images.length - 1) {
        setSelectedImage(images[prevIndex + 1]);
        return prevIndex + 1;
      }
      return prevIndex;
    });
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex > 0) {
        setSelectedImage(images[prevIndex - 1]);
        return prevIndex - 1;
      }
      return prevIndex;
    });
  };

  return {
    selectedImage,
    currentIndex,
    openGallery,
    closeGallery: () => {
      setSelectedImage(null);
      setCurrentIndex(0);
    },
    nextImage,
    prevImage,
  };
};
