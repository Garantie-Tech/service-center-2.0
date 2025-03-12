"use client";

import Image from "next/image";
import { useGallery } from "@/hooks/useGallery";
import { useEffect, useMemo } from "react";

interface GalleryPopupProps {
  images: (string | File)[];
  onRemoveImage?: (index: number) => void; // 🆕 Optional Callback for image removal
  allowRemoval?: boolean; // 🆕 New Prop to control remove button visibility
}

const GalleryPopup: React.FC<GalleryPopupProps> = ({
  images,
  onRemoveImage,
  allowRemoval = true, // Default: Allow removal
}) => {
  const {
    selectedImage,
    currentIndex,
    openGallery,
    closeGallery,
    nextImage,
    prevImage,
  } = useGallery(images);

  // 🔹 Memoized Image URLs (Handles Files and URLs efficiently)
  const imageUrls = useMemo(
    () =>
      images.map((img) =>
        typeof img === "string" ? img : URL.createObjectURL(img)
      ),
    [images]
  );

  // 🔹 Cleanup URLs for File objects when unmounting (Memory Optimization)
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  // 🔹 Handle Keyboard Navigation for Modal
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeGallery();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, nextImage, prevImage, closeGallery]);

  return (
    <div className="container mx-auto p-2">
      {/* Image Grid */}
      <div className="flex justify-start align-center gap-2 flex-wrap">
        {imageUrls.map((src, index) => (
          <div
            key={index}
            className="relative bg-inputBg w-[60px] h-[50px] mt-2 flex items-center justify-center border border-[#EEEEEE] p-[5px] cursor-pointer"
            onClick={() => openGallery(index)}
          >
            {/* Image Preview */}
            {src && (
              <Image
                src={src}
                alt={`Gallery image ${index + 1}`}
                width={60}
                height={60}
                className="rounded h-[100%]"
              />
            )}

            {/* 🆕 Remove Button - Only Show If `allowRemoval` is True */}
            {allowRemoval && onRemoveImage && (
              <button
                type="button"
                className="absolute top-[-4px] right-[-4px] bg-crossBg rounded-full p-[1px]"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(index);
                }}
              >
                <Image
                  src="/images/x-close.svg"
                  alt="Remove"
                  width={12}
                  height={12}
                />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 w-full"
          onClick={closeGallery}
        >
          <div
            className="relative p-[30px] bg-white rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-0 right-0 hover:text-gray-700"
              onClick={closeGallery}
            >
              <Image
                src="/images/cross-square.svg"
                alt="close gallery"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </button>

            {/* Image Display */}
            {imageUrls[currentIndex ?? 0] && (
              <Image
                src={imageUrls[currentIndex ?? 0]}
                alt={`Selected Image ${
                  currentIndex !== null ? currentIndex + 1 : "1"
                }`}
                width={400}
                height={300}
                className="rounded-lg"
              />
            )}

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <button
                  className={`px-4 py-2 bg-gray-300 rounded-md ${
                    currentIndex === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-400"
                  }`}
                  onClick={prevImage}
                  disabled={currentIndex === 0}
                >
                  ◀
                </button>

                <button
                  className={`px-4 py-2 bg-gray-300 rounded-md ${
                    currentIndex === images.length - 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-400"
                  }`}
                  onClick={nextImage}
                  disabled={currentIndex === images.length - 1}
                >
                  ▶
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPopup;
