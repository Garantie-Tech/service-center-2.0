"use client";

import { DocumentActionButtonsProps } from "@/interfaces/ClaimInterface";

const DocumentActionButtons: React.FC<DocumentActionButtonsProps> = ({
  reuploadFinalDocs,
  showReuploadButton,
  finalDocuments,
  isImeiChanged,
  setReuploadFinalDocs,
  beginFinalDocumentsReupload,
  handleSubmit,
  isFinalDocValid,
  isSubmitDisabledByDeviceReplacement = false,
  isSubmitDisabledByJobSheetMismatch = false,
  isRepairInvoiceJobSheetMismatch = false,
  isRepairInvoiceValid = false,
}) => {
  const submitDisabled =
    isSubmitDisabledByDeviceReplacement || isSubmitDisabledByJobSheetMismatch;
  const needsJobSheetCorrection =
    isRepairInvoiceJobSheetMismatch && !isRepairInvoiceValid;

  return (
    <>
      {!reuploadFinalDocs && showReuploadButton ? (
        <button
          type="button"
          className="btn w-1/4 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2"
          onClick={() =>
            beginFinalDocumentsReupload
              ? beginFinalDocumentsReupload()
              : setReuploadFinalDocs(true)
          }
        >
          Upload Again
        </button>
      ) : needsJobSheetCorrection ? (
        <button
          type="button"
          className="btn w-1/4 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={submitDisabled}
        >
          Submit Correction
        </button>
      ) : !finalDocuments.repairInvoiceImage &&
        (!isImeiChanged || (isImeiChanged && !isFinalDocValid)) ? (
        <button
          type="button"
          className="btn w-1/4 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={submitDisabled}
        >
          Submit
        </button>
      ) : reuploadFinalDocs ? (
        <button
          type="button"
          className="btn w-1/4 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={submitDisabled}
        >
          Submit
        </button>
      ) : null}
    </>
  );
};

export default DocumentActionButtons;
