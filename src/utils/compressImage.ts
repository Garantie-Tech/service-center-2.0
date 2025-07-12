import imageCompression from "browser-image-compression";

export const compressImage = async (
  file: File,
  maxSizeMB = 1,
  maxWidthOrHeight = 1024
): Promise<File> => {
  const sizeInMB = file.size / (1024 * 1024); // Convert bytes to MB

  if (sizeInMB <= 2) {
    // No need to compress
    return file;
  }

  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  };

  return await imageCompression(file, options);
};
