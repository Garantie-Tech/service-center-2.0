"use client";

import Image from "next/image";

interface PdfUploadProps {
  label: string;
  pdfs: File[];
  setPdfs: (files: File[]) => void;
}

const PdfUpload: React.FC<PdfUploadProps> = ({ label, pdfs, setPdfs }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).filter(
        (file) => file.type === "application/pdf"
      );
      setPdfs([...pdfs, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedPdfs = pdfs.filter((_, i) => i !== index);
    setPdfs(updatedPdfs);
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-2">{label}</label>

      {/* Upload Button */}
      <div className="mb-4">
        <label className="w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded cursor-pointer px-[10px]">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="text-grayFont text-sm">Add File</span>
          <Image
            src="/images/upload-icon.svg"
            alt="Upload"
            width={20}
            height={20}
          />
        </label>
      </div>

      {/* PDF Previews */}
      <div className="flex gap-2 flex-wrap">
        {pdfs.map((pdf, index) => (
          <div
            key={index}
            className="relative bg-inputBg w-[60px] h-[50px] flex items-center justify-center border border-[#EEEEEE]"
          >
            <Image
              src="/images/pdf-icon.svg"
              alt="PDF"
              width={30}
              height={50}
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

export default PdfUpload;
