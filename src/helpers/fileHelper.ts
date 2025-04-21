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
