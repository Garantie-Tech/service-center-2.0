"use client";

import { DocumentActionButtonsProps } from "@/interfaces/ClaimInterface";

const DocumentActionButtons: React.FC<DocumentActionButtonsProps> = ({
  reuploadFinalDocs,
  showReuploadButton,
  finalDocuments,
  isImeiChanged,
  setReuploadFinalDocs,
  handleSubmit,
}) => {
  return (
    <>
      {!finalDocuments.repairInvoiceImage &&
      (!isImeiChanged ||
        (isImeiChanged && !finalDocuments.replacementReceiptImage)) ? (
        <button
          className="btn w-1/4 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2"
          onClick={handleSubmit}
        >
          Submit
        </button>
      ) : !reuploadFinalDocs && showReuploadButton ? (
        <button
          className="btn w-1/4 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2"
          onClick={() => setReuploadFinalDocs(true)}
        >
          Upload Again
        </button>
      ) : reuploadFinalDocs ? (
        <button
          className="btn w-1/4 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2"
          onClick={handleSubmit}
        >
          Submit
        </button>
      ) : null}
    </>
  );
};

export default DocumentActionButtons;
