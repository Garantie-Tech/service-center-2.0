"use client";

import Image from "next/image";
import GalleryPopup from "@/components/ui/GalleryPopup";
import { FinalDocumentsViewProps } from "@/interfaces/ClaimInterface";
import DocumentDateInfo from "@/components/claim/DocumentDateInfo";

const FinalDocumentsView: React.FC<FinalDocumentsViewProps> = ({
  finalDocuments,
}) => {
  // Function to check if a file is a PDF
  const isPdf = (url: string) => url.toLowerCase().includes(".pdf");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Final Invoice Documents</h2>

      <div className="flex w-full gap-8 flex-wrap">
        {/* Repaired Mobile Photos Section */}
        <div className="w-[45%]">
          <h3 className="flex items-center gap-1 text-sm font-medium mb-2">
            <span>Repaired Mobile</span>
            <DocumentDateInfo
              document={finalDocuments?.repairMobilePhotoDateInfo}
            />
          </h3>
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
            <h3 className="flex items-center gap-1 text-sm font-medium mb-2">
              <span>Repair Invoice</span>
              <DocumentDateInfo
                document={finalDocuments?.repairInvoiceDateInfo}
              />
            </h3>
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

        {/* Device replacement (view) */}
        {finalDocuments?.isImeiChanged && (
          <div className="w-[45%]">
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-[#374151]">
                  Device replaced
                </h3>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  Yes
                </span>
                {finalDocuments?.newImei && (
                  <span className="text-sm text-[#6b7280]">
                    New IMEI: {finalDocuments.newImei}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* replacement receipt */}
        <div className="w-[45%]">
          <div className="mt-4">
            {/* Replacement Receipt Section */}
            <h3 className="flex items-center gap-1 text-sm font-medium mb-2">
              <span>Replacement Receipt</span>
              <DocumentDateInfo
                document={finalDocuments?.replacementReceiptDateInfo}
              />
            </h3>
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
