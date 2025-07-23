export const urlToFile = async (
  url: string,
  fileName: string
): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  const mimeType = blob.type;
  const extension = mimeType.split("/")[1] || "jpg"; // default fallback
  const finalName = `${fileName}.${extension}`;
  return new File([blob], finalName, { type: mimeType });
};

// Function to convert PDF file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
