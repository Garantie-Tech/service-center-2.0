"use client";

import Image from "next/image";

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
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).filter((file) =>
        file.type.startsWith("image/")
      );
      setImages([...images, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-2">{label}</label>

      {/* Upload Button */}
      <div className="mb-4">
        <label className="w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded cursor-pointer px-[10px]">
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="text-grayFont text-sm">
            {multiple ? "Add File" : "Add File"}
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
