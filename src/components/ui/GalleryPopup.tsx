"use client";

import Image from "next/image";
import { useGallery } from "@/hooks/useGallery";

interface GalleryPopupProps {
  images: (string | File)[];
}

const GalleryPopup: React.FC<GalleryPopupProps> = ({ images }) => {
  const {
    selectedImage,
    currentIndex,
    openGallery,
    closeGallery,
    nextImage,
    prevImage,
  } = useGallery(images);

  return (
    <div className="container mx-auto p-2">
      {/* Image Grid */}

      <div className="flex justify-start align-center gap-2">
        {images.map((src, index) => (
          <div
            key={index}
            className="relative bg-inputBg w-[60px] h-[60px] mt-2 flex items-center justify-center border border-[#EEEEEE] p-[5px] cursor-pointer"
            onClick={() => openGallery(index)}
          >
            <Image
              src={typeof src === "string" ? src : URL.createObjectURL(src)}
              alt="`Gallery image ${index + 1}`"
              width={200}
              height={200}
              className="rounded h-[100%]"
            />
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 w-[100%]"
          onClick={closeGallery}
        >
          <div
            className="relative p-4 bg-white rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={closeGallery}
            >
              ✕
            </button>

            {/* Image Display */}
            <Image
              src={
                typeof selectedImage === "string"
                  ? selectedImage
                  : URL.createObjectURL(selectedImage)
              }
              alt="Selected"
              width={300}
              height={300}
              className="rounded-lg w-[100%]"
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <button
                className={`px-4 py-2 bg-gray-300 rounded-md ${
                  currentIndex === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-400"
                }`}
                onClick={prevImage}
                disabled={currentIndex === 0}
              >
                ◀ Prev
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
                Next ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPopup;
