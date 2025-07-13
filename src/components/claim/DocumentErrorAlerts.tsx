"use client";

import ErrorAlert from "@/components/ui/ErrorAlert";
import { DocumentErrorAlertsProps } from "@/interfaces/ClaimInterface";

const DocumentErrorAlerts: React.FC<DocumentErrorAlertsProps> = ({
  isInvalidRepairInvoice,
  isInvalidRepairMobilePhoto,
  isInvalidReplacementReceipt,
  isImeiChanged,
  showRepairInvoiceError,
  showRepairMobilePhotoError,
  showReplacementReceiptError,
  repairInvoiceError,
  repairMobilePhotoError,
  replacementReceiptError,
  isInvalidRepairInvoiceReason,
  isInvalidRepairMobilePhotoReason,
  isInvalidReplacementReceiptReason,
  setShowRepairInvoiceError,
  setShowRepairMobilePhotoError,
  setShowReplacementReceiptError,
}) => {
  return (
    <>
      {isInvalidRepairInvoice &&
        showRepairInvoiceError &&
        repairInvoiceError && (
          <ErrorAlert
            message={isInvalidRepairInvoiceReason}
            onClose={() => setShowRepairInvoiceError(false)}
          />
        )}

      {isInvalidRepairMobilePhoto &&
        showRepairMobilePhotoError &&
        repairMobilePhotoError && (
          <ErrorAlert
            message={isInvalidRepairMobilePhotoReason}
            onClose={() => setShowRepairMobilePhotoError(false)}
          />
        )}

      {isInvalidReplacementReceipt &&
        isImeiChanged &&
        showReplacementReceiptError &&
        replacementReceiptError && (
          <ErrorAlert
            message={isInvalidReplacementReceiptReason}
            onClose={() => setShowReplacementReceiptError(false)}
          />
        )}
    </>
  );
};

export default DocumentErrorAlerts; 