"use client";

import Image from "next/image";
import { useState } from "react";
import { compressImage } from "@/utils/compressImage";

interface ImageUploadProps {
  label: string;
  multiple?: boolean;
  images: File[];
  setImages: (files: File[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  multiple = false,
  images,
  setImages,
}) => {
  const [error, setError] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Function to check if a file is a duplicate
  const isDuplicateFile = (newFile: File): boolean => {
    return images.some((existingFile) => {
      // Compare file name (primary check) and also check if it's the same file
      return existingFile.name === newFile.name;
    });
  };

  // Function to compress image if needed
  const compressImageIfNeeded = async (file: File): Promise<File> => {
    if (file.size > 1024 * 1024) {
      // 1MB
      try {
        return await compressImage(file);
      } catch (error) {
        console.error("Failed to compress image:", error);
        return file; // Return original file if compression fails
      }
    }
    return file;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      setIsCompressing(true);
      setError("");

      try {
        const newFiles = Array.from(event.target.files).filter((file) =>
          file.type.startsWith("image/")
        );

        // Check for duplicates
        const duplicateFiles = newFiles.filter(isDuplicateFile);
        const uniqueFiles = newFiles.filter((file) => !isDuplicateFile(file));

        if (duplicateFiles.length > 0) {
          setError(
            `Image "${duplicateFiles[0].name}" is already selected. Please choose a different image.`
          );
          // Clear error after 5 seconds
          setTimeout(() => setError(""), 5000);
        }

        if (uniqueFiles.length > 0) {
          // Compress images that are larger than 1MB
          const compressedFiles = await Promise.all(
            uniqueFiles.map(compressImageIfNeeded)
          );

          setImages([...images, ...compressedFiles]);
          setError(""); // Clear any existing error when valid files are added
        }
      } catch (error) {
        console.error("Error processing images:", error);
        setError(
          "An error occurred while processing the images. Please try again."
        );
        setTimeout(() => setError(""), 5000);
      } finally {
        setIsCompressing(false);
        event.target.value = "";
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    setError(""); // Clear error when files are removed
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-2">{label}</label>

      {/* Error Message */}
      {error && (
        <div className="mb-2 p-2 text-red-500 text-xs bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {/* Upload Button */}
      <div className="mb-4">
        <label
          className={`w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded cursor-pointer px-[10px] ${
            isCompressing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileUpload}
            className="hidden"
            disabled={isCompressing}
          />
          <span className="text-grayFont text-sm">
            {isCompressing
              ? "Compressing..."
              : multiple
              ? "Add File"
              : "Add File"}
          </span>
          <Image
            src="/images/upload-icon.svg"
            alt="Upload"
            width={20}
            height={20}
          />
        </label>
      </div>

      {/* Image Previews */}
      <div className="flex gap-2 flex-wrap">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative bg-inputBg w-[60px] h-[50px] flex items-center justify-center border border-[#EEEEEE]"
          >
            <Image
              src={URL.createObjectURL(image)}
              alt="Uploaded Image"
              width={50}
              height={40}
              className="rounded border h-[100%]"
            />

            {/* Remove Button */}
            <button
              type="button"
              className="absolute top-[-4px] right-[-4px] bg-crossBg rounded-full p-[1px]"
              onClick={() => handleRemoveFile(index)}
            >
              <Image
                src="/images/x-close.svg"
                alt="Remove"
                width={12}
                height={12}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUpload;
