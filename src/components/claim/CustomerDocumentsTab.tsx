"use client";

import Image from "next/image";
import GalleryPopup from "@/components/ui/GalleryPopup";
import CustomerDocumentsUpload from "../ui/CustomerDocumentsUpload";

interface CustomerDocumentsTabProps {
  documents: {
    aadharFront: string;
    aadharBack: string;
    bankDetails: string;
    panCard?: string; // Optional field
  };
}

const CustomerDocumentsTab: React.FC<CustomerDocumentsTabProps> = ({
  documents,
}) => {
  // Function to check if a file is a PDF
  const isPdf = (url: string) => url.endsWith(".pdf");

  return (
    <div>
      {false ? (
        <CustomerDocumentsUpload />
      ) : (
        <div className="documents-view">
          <h2 className="text-lg font-semibold mb-4">Customer Documents</h2>
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
                  {documents.aadharFront &&
                    (isPdf(documents.aadharFront) ? (
                      <a
                        href={documents.aadharFront}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-[60px] h-[60px] border border-[#EEEEEE] flex items-center justify-center bg-inputBg"
                      >
                        <Image
                          src="/images/pdf-icon.svg"
                          alt="Aadhar Front PDF"
                          width={30}
                          height={50}
                        />
                      </a>
                    ) : (
                      <GalleryPopup images={[documents.aadharFront]} />
                    ))}
                </div>

                {/* Aadhar Back */}
                <div className="w-1/2">
                  <span className="text-xs text-gray-500">(Back side)</span>
                  {documents.aadharBack &&
                    (isPdf(documents.aadharBack) ? (
                      <a
                        href={documents.aadharBack}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-[60px] h-[60px] border border-[#EEEEEE] flex items-center justify-center bg-inputBg"
                      >
                        <Image
                          src="/images/pdf-icon.svg"
                          alt="Aadhar Back PDF"
                          width={30}
                          height={50}
                        />
                      </a>
                    ) : (
                      <GalleryPopup images={[documents.aadharBack]} />
                    ))}
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="col-span-1">
              <h3 className="text-sm font-medium mb-2 text-primaryDark">
                Bank Details <span className="text-red-500">*</span>
              </h3>
              <span className="text-xs text-gray-500">
                (Cancelled Cheque/Passbook)
              </span>
              {documents.bankDetails &&
                (isPdf(documents.bankDetails) ? (
                  <a
                    href={documents.bankDetails}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-[60px] h-[60px] border border-[#EEEEEE] flex items-center justify-center bg-inputBg"
                  >
                    <Image
                      src="/images/pdf-icon.svg"
                      alt="Bank Details PDF"
                      width={30}
                      height={50}
                    />
                  </a>
                ) : (
                  <GalleryPopup images={[documents.bankDetails]} />
                ))}
            </div>

            {/* PAN Card (Optional) */}
            <div className="col-span-1">
              <h3 className="text-sm font-medium mb-2 text-primaryDark">
                Pan Card <span className="text-gray-500">(Optional)</span>
              </h3>
              {documents.panCard &&
                (isPdf(documents.panCard) ? (
                  <a
                    href={documents.panCard}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-[60px] h-[60px] border border-[#EEEEEE] flex items-center justify-center bg-inputBg"
                  >
                    <Image
                      src="/images/pdf-icon.svg"
                      alt="PAN Card PDF"
                      width={30}
                      height={50}
                    />
                  </a>
                ) : (
                  <GalleryPopup images={[documents.panCard]} />
                ))}
            </div>
          </div>

          {/* Accessories Provided */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2 text-primaryDark">
              Accessories Provided:
            </h3>
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
        </div>
      )}
    </div>
  );
};

export default CustomerDocumentsTab;
