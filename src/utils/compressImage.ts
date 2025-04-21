import imageCompression from 'browser-image-compression';

export const compressImage = async (
  file: File,
  maxSizeMB = 1,
  maxWidthOrHeight = 1024
): Promise<File> => {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  };

  return await imageCompression(file, options);
};
