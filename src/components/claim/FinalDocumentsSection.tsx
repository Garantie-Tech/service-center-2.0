"use client";

import PdfUpload from "@/components/ui/PdfUpload";
import Image from "next/image";
import GalleryPopup from "@/components/ui/GalleryPopup";
import { FinalDocumentsSectionProps } from "@/interfaces/ClaimInterface";
import DocumentDateInfo from "@/components/claim/DocumentDateInfo";

const FinalDocumentsSection: React.FC<FinalDocumentsSectionProps> = ({
  repairInvoice,
  replacementReceipt,
  handleRepairInvoiceUpload,
  handleReplacementReceiptUpload,
  reuploadFinalDocs,
  isInvalidRepairInvoice,
  isInvalidRepairInvoiceReason,
  isInvalidRepairInvoiceStatus,
  isInvalidReplacementReceipt,
  isInvalidReplacementReceiptReason,
  isInvalidReplacementReceiptStatus,
  isValidReplacementReceipt,
  showReplacementReceiptSection,
  finalDocuments,
  repairInvoiceError,
  replacementReceiptError,
}) => {
  // Use only server-driven prop so the Device replacement toggle (local state) never affects this section
  const showReplacement = showReplacementReceiptSection === true;
  return (
    <div className="flex gap-8">
      {/* Repair Invoice PDF */}
      <div className="w-1/2">
        {/* Always show input for invoice if reuploadFinalDocs is true and invoice is invalid or under review */}
        {(reuploadFinalDocs &&
          (isInvalidRepairInvoice || isInvalidRepairInvoiceStatus == null)) ||
        !finalDocuments?.repairInvoiceImage ? (
          <PdfUpload
            label="Repair Invoice (Please add Invoice document pdf)"
            pdfs={repairInvoice || []}
            setPdfs={handleRepairInvoiceUpload}
          />
        ) : finalDocuments.repairInvoiceImage.toLowerCase().includes(".pdf") ? (
          <>
            <h3 className="flex items-center gap-1 text-sm font-medium mb-2">
              <span>Repair Invoice</span>
              <DocumentDateInfo document={finalDocuments.repairInvoiceDateInfo} />
            </h3>
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
          </>
        ) : (
          <>
            <h3 className="flex items-center gap-1 text-sm font-medium mb-2">
              <span>Repair Invoice</span>
              <DocumentDateInfo document={finalDocuments.repairInvoiceDateInfo} />
            </h3>
            <GalleryPopup images={[finalDocuments.repairInvoiceImage]} />
          </>
        )}

        {isInvalidRepairInvoice && repairInvoiceError ? (
          <span className=" p-2 text-[#EB5757] text-xxs font-semibold">
            Invalid Invoice : {isInvalidRepairInvoiceReason}
          </span>
        ) : isInvalidRepairInvoiceStatus == null &&
          finalDocuments?.repairInvoiceImage ? (
          <span className=" p-2 text-[#FF9548] text-xxs font-semibold">
            Uploaded (Under Review)
          </span>
        ) : isInvalidRepairInvoiceStatus == true ? (
          <span className=" p-2 text-[#19AD61] text-xxs font-semibold">
            Valid
          </span>
        ) : (
          <></>
        )}
      </div>

      {/* Replacement Receipt PDF - visibility from server (showReplacementReceiptSection), not the Device replacement toggle */}
      <div className="w-1/2">
        {showReplacement && (
          <div className="">
            {/* Always show input for replacement receipt if reuploadFinalDocs is true and receipt is invalid or under review */}
            {(reuploadFinalDocs &&
              (!isValidReplacementReceipt ||
                isInvalidReplacementReceiptStatus == null)) ||
            !finalDocuments?.replacementReceiptImage ? (
              <PdfUpload
                label="Replacement Receipt (Add replacement receipt pdf)"
                pdfs={replacementReceipt}
                setPdfs={handleReplacementReceiptUpload}
              />
            ) : finalDocuments.replacementReceiptImage
                .toLowerCase()
                .includes(".pdf") ? (
              <>
                <h3 className="flex items-center gap-1 text-sm font-medium mb-2">
                  <span>Replacement Receipt</span>
                  <DocumentDateInfo
                    document={finalDocuments.replacementReceiptDateInfo}
                  />
                </h3>
                <div className="relative bg-inputBg w-[60px] h-[60px] flex items-center justify-center border border-[#EEEEEE]">
                  <a
                    href={finalDocuments.replacementReceiptImage}
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
              </>
            ) : (
              <>
                <h3 className="flex items-center gap-1 text-sm font-medium mb-2">
                  <span>Replacement Receipt</span>
                  <DocumentDateInfo
                    document={finalDocuments.replacementReceiptDateInfo}
                  />
                </h3>
                <GalleryPopup
                  images={[finalDocuments.replacementReceiptImage]}
                />
              </>
            )}

            {isInvalidReplacementReceipt && replacementReceiptError ? (
              <span className=" p-2 text-[#EB5757] text-xxs font-semibold">
                Invalid Receipt : {isInvalidReplacementReceiptReason}
              </span>
            ) : isInvalidReplacementReceiptStatus == null &&
              finalDocuments?.replacementReceiptImage &&
              showReplacement ? (
              <span className=" p-2 text-[#FF9548] text-xxs font-semibold">
                Uploaded (Under Review)
              </span>
            ) : isInvalidReplacementReceiptStatus == true ? (
              <span className="p-2 text-[#19AD61] text-xxs font-semibold">
                Valid
              </span>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalDocumentsSection;
