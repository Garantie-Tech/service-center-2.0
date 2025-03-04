"use client";

import { useState } from "react";
import Image from "next/image";
import GalleryPopup from "@/components/ui/GalleryPopup";

interface UploadedDocuments {
  aadharFront: File | null;
  aadharBack: File | null;
  bankDetails: File | null;
  panCard?: File | null;
}

const CustomerDocumentsUpload: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocuments>({
    aadharFront: null,
    aadharBack: null,
    bankDetails: null,
    panCard: null,
  });

  // Handle file uploads
  const handleFileChange = (key: keyof UploadedDocuments, file: File | null) => {
    setDocuments((prev) => ({ ...prev, [key]: file }));
  };

  // Check if file is PDF
  const isPdf = (file: File | null) => file?.name.endsWith(".pdf");

  // Convert file to URL for preview
  const getFilePreview = (file: File | null) => (file ? URL.createObjectURL(file) : "");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Upload Customer Documents</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Aadhar Front & Back */}
        <div className="col-span-2">
          <h3 className="text-sm font-medium mb-2 text-primaryDark">
            Aadhar (Front and Back) <span className="text-red-500">*</span>
          </h3>
          <div className="flex gap-4">
            {/* Aadhar Front */}
            <div className="w-1/2">
              <span className="text-xs text-gray-500">(Front side)</span>
              <label className="block cursor-pointer">
                <input type="file" className="hidden" onChange={(e) => handleFileChange("aadharFront", e.target.files?.[0] || null)} />
                <div className="w-[60px] h-[60px] border border-[#EEEEEE] flex items-center justify-center bg-inputBg">
                  {documents.aadharFront ? (
                    isPdf(documents.aadharFront) ? (
                      <a href={getFilePreview(documents.aadharFront)} target="_blank">
                        <Image src="/images/pdf-icon.svg" alt="PDF" width={30} height={50} />
                      </a>
                    ) : (
                      <GalleryPopup images={[getFilePreview(documents.aadharFront)]} />
                    )
                  ) : (
                    <Image src="/images/upload-icon.svg" alt="Upload" width={24} height={24} />
                  )}
                </div>
              </label>
            </div>

            {/* Aadhar Back */}
            <div className="w-1/2">
              <span className="text-xs text-gray-500">(Back side)</span>
              <label className="block cursor-pointer">
                <input type="file" className="hidden" onChange={(e) => handleFileChange("aadharBack", e.target.files?.[0] || null)} />
                <div className="w-[60px] h-[60px] border border-[#EEEEEE] flex items-center justify-center bg-inputBg">
                  {documents.aadharBack ? (
                    isPdf(documents.aadharBack) ? (
                      <a href={getFilePreview(documents.aadharBack)} target="_blank">
                        <Image src="/images/pdf-icon.svg" alt="PDF" width={30} height={50} />
                      </a>
                    ) : (
                      <GalleryPopup images={[getFilePreview(documents.aadharBack)]} />
                    )
                  ) : (
                    <Image src="/images/upload-icon.svg" alt="Upload" width={24} height={24} />
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="col-span-1">
          <h3 className="text-sm font-medium mb-2 text-primaryDark">
            Bank Details <span className="text-red-500">*</span>
          </h3>
          <span className="text-xs text-gray-500">(Cancelled Cheque/Passbook)</span>
          <label className="block cursor-pointer">
            <input type="file" className="hidden" onChange={(e) => handleFileChange("bankDetails", e.target.files?.[0] || null)} />
            <div className="w-[60px] h-[60px] border border-[#EEEEEE] flex items-center justify-center bg-inputBg">
              {documents.bankDetails ? (
                isPdf(documents.bankDetails) ? (
                  <a href={getFilePreview(documents.bankDetails)} target="_blank">
                    <Image src="/images/pdf-icon.svg" alt="PDF" width={30} height={50} />
                  </a>
                ) : (
                  <GalleryPopup images={[getFilePreview(documents.bankDetails)]} />
                )
              ) : (
                <Image src="/images/upload-icon.svg" alt="Upload" width={24} height={24} />
              )}
            </div>
          </label>
        </div>

        {/* PAN Card (Optional) */}
        <div className="col-span-1">
          <h3 className="text-sm font-medium mb-2 text-primaryDark">
            Pan Card <span className="text-gray-500">(Optional)</span>
          </h3>
          <label className="block cursor-pointer">
            <input type="file" className="hidden" onChange={(e) => handleFileChange("panCard", e.target.files?.[0] || null)} />
            <div className="w-[60px] h-[60px] border border-[#EEEEEE] flex items-center justify-center bg-inputBg">
              {documents.panCard ? (
                isPdf(documents.panCard) ? (
                  <a href={getFilePreview(documents.panCard)} target="_blank">
                    <Image src="/images/pdf-icon.svg" alt="PDF" width={30} height={50} />
                  </a>
                ) : (
                  <GalleryPopup images={[getFilePreview(documents.panCard)]} />
                )
              ) : (
                <Image src="/images/upload-icon.svg" alt="Upload" width={24} height={24} />
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Accessories Provided */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2 text-primaryDark">Accessories Provided:</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="checkbox" />
            <span>Yes</span>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" className="checkbox" />
            <span>No</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button className="btn mt-6 bg-primaryBlue text-white px-6 py-2 rounded-md hover:bg-blue-700">
        Submit Documents
      </button>
    </div>
  );
};

export default CustomerDocumentsUpload;
