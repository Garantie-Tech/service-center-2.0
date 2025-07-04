import { useState, useEffect } from "react";
import { useGlobalStore } from "@/store/store";
import { useNotification } from "@/context/NotificationProvider";
import { uploadFinalDocuments } from "@/services/claimService";
import { getDocumentInfo } from "@/helpers/globalHelper";

export const useFinalDocuments = () => {
  const [repairInvoice, setRepairInvoice] = useState<File[] | undefined>(
    undefined
  );
  const [replacementReceipt, setReplacementReceipt] = useState<File[]>([]);
  const [repairedMobilePhotos, setRepairedMobilePhotos] = useState<File[]>([]);
  const [reuploadMobile, setReuploadMobile] = useState(false);
  const [reuploadFinalDocs, setReuploadFinalDocs] = useState(false);
  const [repairInvoiceError, setRepairInvoiceError] = useState(true);
  const [repairMobilePhotoError, setRepairMobilePhotoError] = useState(true);
  const [replacementReceiptError, setReplacementReceiptError] = useState(true);
  const [showRepairInvoiceError, setShowRepairInvoiceError] = useState(true);
  const [showRepairMobilePhotoError, setShowRepairMobilePhotoError] =
    useState(true);
  const [showReplacementReceiptError, setShowReplacementReceiptError] =
    useState(true);

  const { selectedClaim, setIsLoading, triggerClaimRefresh } = useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();

  const isImeiChanged = selectedClaim?.imei_changed ? true : false;

  // Get document info for each type
  const repairInvoiceInfo = getDocumentInfo(selectedClaim, "16");
  const repairMobilePhotoInfo = getDocumentInfo(selectedClaim, "74");
  const replacementReceiptInfo = getDocumentInfo(selectedClaim, "75");

  // Assign values
  const isInvalidRepairInvoice = repairInvoiceInfo.isInvalid;
  const isInvalidRepairMobilePhoto = repairMobilePhotoInfo.isInvalid;
  const isInvalidReplacementReceipt = replacementReceiptInfo.isInvalid;

  const isInvalidRepairInvoiceReason = repairInvoiceInfo.invalidReason;
  const isInvalidRepairMobilePhotoReason = repairMobilePhotoInfo.invalidReason;
  const isInvalidReplacementReceiptReason =
    replacementReceiptInfo.invalidReason;

  const isInvalidRepairInvoiceStatus = repairInvoiceInfo.statusValue;
  const isInvalidRepairMobilePhotoStatus = repairMobilePhotoInfo.statusValue;
  const isInvalidReplacementReceiptStatus = replacementReceiptInfo.statusValue;

  const isValidRepairInvoice = repairInvoiceInfo.isValid;
  const isValidRepairMobilePhoto = repairMobilePhotoInfo.isValid;
  const isValidReplacementReceipt = replacementReceiptInfo.isValid;

  const isEditable =
    isInvalidRepairInvoice ||
    isInvalidRepairMobilePhoto ||
    (isImeiChanged && isInvalidReplacementReceipt) ||
    repairInvoiceInfo.statusValue === null ||
    repairMobilePhotoInfo.statusValue === null ||
    replacementReceiptInfo.statusValue === null;

  const showReuploadButton =
    isInvalidRepairInvoice ||
    isInvalidRepairMobilePhoto ||
    (isImeiChanged && isInvalidReplacementReceipt) ||
    repairInvoiceInfo.hasInvalidStatus ||
    repairMobilePhotoInfo.hasInvalidStatus ||
    replacementReceiptInfo.hasInvalidStatus;

  // document
  const finalDocuments = {
    repairInvoiceImage: selectedClaim?.documents?.["16"]?.url ?? "",
    repairMobilePhoto: selectedClaim?.documents?.["74"]?.url ?? "",
    replacementReceiptImage: selectedClaim?.documents?.["75"]?.url ?? "",
    isImeiChanged: isImeiChanged,
    shipmentReceipt: selectedClaim?.shipping_receipt ?? undefined,
  };

  const showSubmitButton =
    repairInvoiceInfo.statusValue != true ||
    repairMobilePhotoInfo.statusValue != true ||
    (replacementReceiptInfo.statusValue != true && isImeiChanged);

  const handleSubmit = async () => {
    const formData = new FormData();

    try {
      if (
        repairInvoice !== undefined &&
        repairInvoice.length === 0 &&
        !selectedClaim?.documents?.["16"]?.url
      ) {
        notifyError("Please Upload Repair Invoice");
        return;
      }
      if (
        (!repairedMobilePhotos || repairedMobilePhotos.length === 0) &&
        !selectedClaim?.documents?.["74"]?.url
      ) {
        notifyError("Please Upload Repair Mobile Images");
        return;
      }

      if (
        selectedClaim?.imei_changed &&
        isValidRepairMobilePhoto &&
        (!replacementReceipt || replacementReceipt.length === 0) &&
        !selectedClaim?.documents?.["75"]?.url
      ) {
        notifyError("Please Upload Replacement Receipt");
        return;
      }
      setIsLoading(true);

      // Helper function to append files in required format
      const appendFiles = (
        files: File[] | undefined,
        documentTypeId: number
      ) => {
        if (!files) return;
        files.forEach((file) => {
          formData.append(`${documentTypeId}[delete_existing_document]`, "1");
          formData.append(`${documentTypeId}[document]`, file);
          formData.append(
            `${documentTypeId}[document_type_id]`,
            documentTypeId.toString()
          );
        });
      };

      if (repairInvoice !== undefined) {
        appendFiles(repairInvoice, 16);
      }
      if (repairedMobilePhotos) {
        appendFiles(repairedMobilePhotos, 74);
      }
      if (selectedClaim?.imei_changed) {
        appendFiles(replacementReceipt, 75);
      }

      // Send formData to API
      const response = await uploadFinalDocuments(
        Number(selectedClaim?.id),
        formData
      );

      if (!response.data) {
        notifyError("Failed to upload documents. Please try again.");
      } else {
        triggerClaimRefresh();
        notifySuccess("Final documents uploaded successfully!");
      }
    } catch (error) {
      console.error("Error submitting final documents:", error);
      notifyError("Failed to upload documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepairInvoiceUpload = (files: File[]) => {
    setRepairInvoice(files);
    setRepairInvoiceError(false);
  };

  const handleReplacementReceiptUpload = (files: File[]) => {
    setReplacementReceipt(files);
    setReplacementReceiptError(false);
  };

  useEffect(() => {
    setReuploadMobile(false);
    setReuploadFinalDocs(false);
  }, [selectedClaim]);

  return {
    // State
    repairInvoice,
    replacementReceipt,
    repairedMobilePhotos,
    setRepairedMobilePhotos,
    reuploadMobile,
    setReuploadMobile,
    reuploadFinalDocs,
    setReuploadFinalDocs,
    repairInvoiceError,
    setRepairInvoiceError,
    repairMobilePhotoError,
    setRepairMobilePhotoError,
    replacementReceiptError,
    setReplacementReceiptError,
    showRepairInvoiceError,
    setShowRepairInvoiceError,
    showRepairMobilePhotoError,
    setShowRepairMobilePhotoError,
    showReplacementReceiptError,
    setShowReplacementReceiptError,

    // Document info
    isImeiChanged,
    isInvalidRepairInvoice,
    isInvalidRepairMobilePhoto,
    isInvalidReplacementReceipt,
    isInvalidRepairInvoiceReason,
    isInvalidRepairMobilePhotoReason,
    isInvalidReplacementReceiptReason,
    isInvalidRepairInvoiceStatus,
    isInvalidRepairMobilePhotoStatus,
    isInvalidReplacementReceiptStatus,
    isValidRepairInvoice,
    isValidRepairMobilePhoto,
    isValidReplacementReceipt,
    isEditable,
    showReuploadButton,
    finalDocuments,
    showSubmitButton,

    // Handlers
    handleSubmit,
    handleRepairInvoiceUpload,
    handleReplacementReceiptUpload,
  };
}; 