import { useState } from "react";

export const useGallery = (images: (string | File)[]) => {
  const fileImages: File[] = images.filter((img): img is File => img instanceof File);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const openGallery = (index: number) => {
    setSelectedImage(fileImages[index]);
    setCurrentIndex(index);
  };

  const nextImage = () => {
    if (currentIndex !== null && currentIndex < fileImages.length - 1) {
      setSelectedImage(fileImages[currentIndex + 1]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentIndex !== null && currentIndex > 0) {
      setSelectedImage(fileImages[currentIndex - 1]);
      setCurrentIndex(currentIndex - 1);
    }
  };

  return {
    selectedImage,
    currentIndex,
    openGallery,
    closeGallery: () => {
      setSelectedImage(null);
      setCurrentIndex(null);
    },
    nextImage,
    prevImage,
  };
};
