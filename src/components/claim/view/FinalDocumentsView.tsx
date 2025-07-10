"use client";

import Image from "next/image";
import GalleryPopup from "@/components/ui/GalleryPopup";
import { FinalDocumentsViewProps } from "@/interfaces/ClaimInterface";

const FinalDocumentsView: React.FC<FinalDocumentsViewProps> = ({
  finalDocuments,
}) => {
  // Function to check if a file is a PDF
  const isPdf = (url: string) => url.endsWith(".pdf");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Final Invoice Documents</h2>

      <div className="flex w-full gap-8 flex-wrap">
        {/* Repaired Mobile Photos Section */}
        <div className="w-[45%]">
          <h3 className="text-sm font-medium mb-2">Repaired Mobile</h3>
          {finalDocuments?.repairMobilePhoto && (
            <GalleryPopup images={finalDocuments?.repairMobilePhoto} />
          )}
          <span className="p-2 text-[#19AD61] text-xxs font-semibold">
            Valid
          </span>
        </div>

        {/* Repair Invoice Section */}
        <div className="w-[45%]">
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Repair Invoice</h3>
            {finalDocuments?.repairInvoiceImage ? (
              isPdf(finalDocuments.repairInvoiceImage) ? (
                <div className="relative bg-inputBg w-[60px] h-[60px] flex items-center justify-center border border-[#EEEEEE]">
                  <a
                    href={finalDocuments.repairInvoiceImage}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="/images/pdf-icon.svg"
                      alt="Repair Invoice PDF"
                      width={30}
                      height={50}
                    />
                  </a>
                </div>
              ) : (
                <GalleryPopup images={finalDocuments.repairMobilePhoto ?? []} />
              )
            ) : null}
            <span className="p-2 text-[#19AD61] text-xxs font-semibold">
              Valid
            </span>
          </div>
        </div>

        {/* replacement receipt */}
        <div className="w-[45%]">
          <div className="mt-4">
            {/* Replacement Receipt Section */}
            <h3 className="text-sm font-medium mb-2">Replacement Receipt</h3>
            {finalDocuments?.isImeiChanged &&
              finalDocuments?.replacementReceiptImage &&
              (isPdf(finalDocuments.replacementReceiptImage) ? (
                <div className="relative bg-inputBg w-[60px] h-[60px] flex items-center justify-center border border-[#EEEEEE]">
                  <a
                    href={finalDocuments.replacementReceiptImage}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="/images/pdf-icon.svg"
                      alt="Replacement Receipt PDF"
                      width={30}
                      height={50}
                    />
                  </a>
                </div>
              ) : (
                <GalleryPopup
                  images={[finalDocuments.replacementReceiptImage]}
                />
              ))}
            <span className="p-2 text-[#19AD61] text-xxs font-semibold">
              Valid
            </span>
          </div>
        </div>

        {/* Shipment Receipt Section */}
        <div className="w-[45%]">
          {finalDocuments.shipmentReceipt && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Shipment Receipt</h3>
              <div className="relative bg-inputBg w-[60px] h-[60px] flex items-center justify-center border border-[#EEEEEE]">
                <a
                  href={finalDocuments.shipmentReceipt}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/images/pdf-icon.svg"
                    alt="Shipment Receipt PDF"
                    width={30}
                    height={50}
                  />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalDocumentsView;
