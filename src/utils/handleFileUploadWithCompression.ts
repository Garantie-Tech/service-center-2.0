// utils/handleFileUploadWithCompression.ts
import { compressImage } from "./compressImage";

export const handleFileUploadWithCompression = async (
  files: File[],
  setter: (files: File[]) => void
) => {
  if (files.length > 0) {
    const latestFile = files[files.length - 1];

    const isImage =
      latestFile.type.startsWith("image/") && !latestFile.type.includes("svg");

    if (isImage) {
      try {
        const compressed = await compressImage(latestFile);
        setter([compressed]);
      } catch (err) {
        console.error("Compression failed:", err);
        setter([latestFile]); // fallback to original if compression fails
      }
    } else {
      // Directly set PDFs or other files without compression
      setter([latestFile]);
    }
  } else {
    setter([]);
  }
};
