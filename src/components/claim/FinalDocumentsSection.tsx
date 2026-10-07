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
  isValidRepairInvoice,
  isInvalidReplacementReceipt,
  isInvalidReplacementReceiptReason,
  isInvalidReplacementReceiptStatus,
  isValidReplacementReceipt,
  showReplacementReceiptSection,
  finalDocuments,
  repairInvoiceError,
  replacementReceiptError,
  isRepairInvoiceJobSheetMismatch,
  isRepairInvoiceExtracting,
  repairInvoiceExtractStatus,
  repairInvoiceExtractMessage,
  repairInvoiceJobSheetError,
  estimateJobSheetNumber,
  repairInvoiceJobSheetNumber,
  jobSheetMismatchReason = "",
  setJobSheetMismatchReason,
  newJobSheetNumber = "",
  setNewJobSheetNumber,
  jobSheetMismatchReasonError,
  newJobSheetNumberError,
  jobSheetMismatchReasons = [],
}) => {
  // Use only server-driven prop so the Device replacement toggle (local state) never affects this section
  const showReplacement = showReplacementReceiptSection === true;
  const isJobSheetCorrectionReadOnly =
    isRepairInvoiceJobSheetMismatch === true && isValidRepairInvoice === true;

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

        {isRepairInvoiceExtracting ? (
          <div className="flex items-center gap-1.5 px-2 py-2 text-[#6b7280]">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#d1d5db] border-t-primaryBlue" />
            <span className="text-xxs font-semibold">Checking document</span>
          </div>
        ) : isInvalidRepairInvoice && repairInvoiceError ? (
          <span className="block p-2 text-[#EB5757] text-xxs font-semibold">
            Invalid Invoice : {isInvalidRepairInvoiceReason}
          </span>
        ) : isInvalidRepairInvoiceStatus == null &&
          finalDocuments?.repairInvoiceImage ? (
          <span className="block p-2 text-[#FF9548] text-xxs font-semibold">
            Uploaded (Under Review)
          </span>
        ) : isInvalidRepairInvoiceStatus == true ? (
          <span className="block p-2 text-[#19AD61] text-xxs font-semibold">
            Valid
          </span>
        ) : null}

        {!isRepairInvoiceExtracting &&
          repairInvoiceExtractStatus &&
          repairInvoiceExtractMessage && (
            <span
              className={`block px-2 pb-2 text-xxs font-semibold ${
                repairInvoiceExtractStatus === "success"
                  ? "text-[#19AD61]"
                  : "text-[#EB5757]"
              }`}
            >
              {repairInvoiceExtractMessage}
            </span>
          )}

        {repairInvoiceJobSheetError && !isRepairInvoiceJobSheetMismatch && (
          <div className="mb-3 mt-3 rounded-md border border-[#fed7aa] bg-[#fff7ed] px-3 py-2">
            <div className="text-xs font-semibold text-[#c2410c]">
              Job sheet number could not be verified
            </div>
            <div className="mt-1 text-xs leading-5 text-[#7c2d12]">
              {repairInvoiceJobSheetError}
            </div>
          </div>
        )}

        {isRepairInvoiceJobSheetMismatch && (
          <div className="mb-3 mt-3 rounded-md border border-[#e5e7eb] bg-[#fafbfc] p-3">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-[#374151]">
                Job sheet correction
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  isJobSheetCorrectionReadOnly
                    ? "bg-[#E8F7EF] text-[#19AD61]"
                    : "bg-[#EEF2FF] text-primaryBlue"
                }`}
              >
                {isJobSheetCorrectionReadOnly ? "Recorded" : "Action required"}
              </span>
            </div>
            <p className="mb-3 text-xs leading-5 text-[#6b7280]">
              {isJobSheetCorrectionReadOnly
                ? "The job sheet number on the repair invoice did not match the claim record. The corrected job sheet details were captured before validation."
                : "The job sheet number on the repair invoice does not match the claim record. Please select a reason and provide the updated job sheet number."}
            </p>
            {isJobSheetCorrectionReadOnly ? (
              <div className="divide-y divide-[#e5e7eb] rounded-md border border-[#e5e7eb] bg-white">
                <div className="grid grid-cols-[140px_1fr] gap-3 px-3 py-2">
                  <div className="text-xs font-medium text-[#6b7280]">
                    Reason
                  </div>
                  <div className="text-sm font-medium text-[#181D27]">
                    {jobSheetMismatchReason || "Not available"}
                  </div>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-3 px-3 py-2">
                  <div className="text-xs font-medium text-[#6b7280]">
                    New job sheet
                  </div>
                  <div className="text-sm font-medium text-[#181D27]">
                    {newJobSheetNumber || "Not available"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#374151]">
                    Reason <span className="text-[#dc2626]">*</span>
                  </label>
                  <select
                    value={jobSheetMismatchReason}
                    onChange={(event) =>
                      setJobSheetMismatchReason?.(event.target.value)
                    }
                    className={`w-full rounded-md border bg-white px-2.5 py-2 text-sm text-[#181D27] focus:outline-none focus:ring-1 focus:ring-primaryBlue/40 ${
                      jobSheetMismatchReasonError
                        ? "border-[#dc2626] focus:border-[#dc2626]"
                        : "border-[#e5e7eb] focus:border-primaryBlue"
                    }`}
                  >
                    <option value="" disabled>
                      Select reason
                    </option>
                    {jobSheetMismatchReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  {jobSheetMismatchReasonError && (
                    <div className="mt-1 text-xs font-medium text-[#dc2626]">
                      {jobSheetMismatchReasonError}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#374151]">
                    New job sheet number{" "}
                    <span className="text-[#dc2626]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJobSheetNumber}
                    onChange={(event) =>
                      setNewJobSheetNumber?.(event.target.value)
                    }
                    placeholder="Enter new job sheet number"
                    className={`w-full rounded-md border bg-white px-2.5 py-2 text-sm text-[#181D27] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-primaryBlue/40 ${
                      newJobSheetNumberError
                        ? "border-[#dc2626] focus:border-[#dc2626]"
                        : "border-[#e5e7eb] focus:border-primaryBlue"
                    }`}
                  />
                  {newJobSheetNumberError && (
                    <div className="mt-1 text-xs font-medium text-[#dc2626]">
                      {newJobSheetNumberError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
