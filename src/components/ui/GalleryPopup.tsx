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
        typeof img === "string" ? img : URL.createObjectURL(img),
      ),
    [images],
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

      {/* Popup Modal - width fits image to avoid left/right white space */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-3"
          onClick={closeGallery}
        >
          <div
            className="relative flex flex-col bg-white rounded-xl shadow-2xl w-max max-w-[96vw] max-h-[96vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="absolute top-2 right-2 z-10 rounded-lg bg-white/90 hover:bg-gray-100 shadow-sm border border-gray-200 transition-colors cursor-pointer"
              onClick={closeGallery}
              aria-label="Close gallery"
            >
              <Image
                src="/images/cross-square.svg"
                alt=""
                width={20}
                height={20}
                className="rounded sm:w-8 sm:h-8"
              />
            </button>

            {/* Image - native img so popup width = image width (no side gaps) */}
            <div className="w-max max-w-[90vw] pt-11 sm:pt-12 px-3 sm:px-4 pb-2">
              {imageUrls[currentIndex ?? 0] && (
                <img
                  src={imageUrls[currentIndex ?? 0]}
                  alt={`Selected Image ${
                    currentIndex !== null ? currentIndex + 1 : "1"
                  }`}
                  className="max-w-[90vw] max-h-[78vh] w-auto h-auto object-contain rounded-lg block"
                  draggable={false}
                />
              )}
            </div>

            {/* Bottom bar: counter + navigation */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-4 sm:gap-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 shrink-0">
                <button
                  type="button"
                  className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentIndex === 0
                      ? "opacity-40 cursor-not-allowed bg-gray-200 text-gray-500"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  onClick={prevImage}
                  disabled={currentIndex === 0}
                >
                  ◀ Prev
                </button>
                <span className="text-sm font-medium text-gray-600 tabular-nums">
                  {currentIndex !== null ? currentIndex + 1 : 1} /{" "}
                  {images.length}
                </span>
                <button
                  type="button"
                  className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentIndex === images.length - 1
                      ? "opacity-40 cursor-not-allowed bg-gray-200 text-gray-500"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  onClick={nextImage}
                  disabled={currentIndex === images.length - 1}
                >
                  Next ▶
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
