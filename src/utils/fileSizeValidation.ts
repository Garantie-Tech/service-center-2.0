const ADDITIONAL_DOC_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ADDITIONAL_DOC_FILE_SIZE_ERROR_MESSAGE =
  "Each file must not exceed 10 MB. Please upload smaller files.";

export function getFileSizeError(
  files: File[],
  maxBytes: number = ADDITIONAL_DOC_MAX_FILE_SIZE_BYTES,
): string | null {
  const tooBig = files.find((f) => f.size > maxBytes);
  return tooBig ? ADDITIONAL_DOC_FILE_SIZE_ERROR_MESSAGE : null;
}
