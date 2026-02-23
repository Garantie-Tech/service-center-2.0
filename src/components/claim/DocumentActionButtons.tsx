"use client";

import { DocumentActionButtonsProps } from "@/interfaces/ClaimInterface";

const DocumentActionButtons: React.FC<DocumentActionButtonsProps> = ({
  reuploadFinalDocs,
  showReuploadButton,
  finalDocuments,
  isImeiChanged,
  setReuploadFinalDocs,
  handleSubmit,
  isFinalDocValid,
  isSubmitDisabledByDeviceReplacement = false,
}) => {
  const submitDisabled = isSubmitDisabledByDeviceReplacement;
  return (
    <>
      {!finalDocuments.repairInvoiceImage &&
      (!isImeiChanged || (isImeiChanged && !isFinalDocValid)) ? (
        <button
          type="button"
          className="btn w-1/4 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={submitDisabled}
        >
          Submit
        </button>
      ) : !reuploadFinalDocs && showReuploadButton ? (
        <button
          type="button"
          className="btn w-1/4 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2"
          onClick={() => setReuploadFinalDocs(true)}
        >
          Upload Again
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
