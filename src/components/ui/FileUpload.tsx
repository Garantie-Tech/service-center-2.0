"use client";

import Image from "next/image";

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  files: (File | string)[];
  setFiles: (files: (File | string)[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = "image/*, .pdf",
  multiple = false,
  files,
  setFiles,
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-2">{label}</label>

      {/* File Upload Button */}
      <div className="mb-4">
        <label className="w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded cursor-pointer px-[10px]">
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="text-grayFont text-sm">
            {multiple ? "Add Files" : "Add File"}
          </span>
          <Image
            src="/images/upload-icon.svg"
            alt="Upload"
            width={20}
            height={20}
          />
        </label>
      </div>

      {/* File Previews */}
      <div className="flex gap-2 flex-wrap">
        {files.map((file, index) => (
          <div
            key={index}
            className="relative bg-inputBg w-[60px] h-[50px] flex items-center justify-center border border-[#EEEEEE]"
          >
            {typeof file === "string" ? (
              file.endsWith(".pdf") ? (
                <Image
                  src="/images/pdf-icon.svg"
                  alt="PDF"
                  width={30}
                  height={50}
                />
              ) : (
                <Image
                  src={file}
                  alt="Uploaded File"
                  width={30}
                  height={50}
                  className="rounded border"
                />
              )
            ) : file.type === "application/pdf" ? (
              <Image
                src="/images/pdf-icon.svg"
                alt="PDF"
                width={30}
                height={50}
              />
            ) : (
              <Image
                src={URL.createObjectURL(file)}
                alt="Uploaded File"
                width={30}
                height={50}
                className="rounded border"
              />
            )}

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

export default FileUpload;
