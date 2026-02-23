import { useState, useEffect } from "react";
import { useGlobalStore } from "@/store/store";
import { useNotification } from "@/context/NotificationProvider";
import { uploadFinalDocuments } from "@/services/claimService";
import { getDocumentInfo, isIMEIFormat } from "@/helpers/globalHelper";

export const useFinalDocuments = () => {
  const [repairInvoice, setRepairInvoice] = useState<File[] | undefined>(
    undefined,
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
  const [isDeviceReplaced, setIsDeviceReplaced] = useState(false);
  const [newImei, setNewImei] = useState("");
  const [newImeiError, setNewImeiError] = useState<string | null>(null);

  const { selectedClaim, setIsLoading, triggerClaimRefresh } = useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();

  const showDeviceReplacementSection =
    selectedClaim?.show_device_replacement_section === true;
  const isImeiChanged = showDeviceReplacementSection && isDeviceReplaced;
  const isImeiChangedFromServer = !!(
    selectedClaim?.is_imei_updated || selectedClaim?.imei_changed
  );

  const hasValidNewImei =
    showDeviceReplacementSection &&
    isDeviceReplaced &&
    newImei.trim().length === 15 &&
    isIMEIFormat(newImei.trim());
  const isSubmitDisabledByDeviceReplacement =
    showDeviceReplacementSection && isDeviceReplaced && !hasValidNewImei;

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

  const replacementReceiptApplicable = isImeiChangedFromServer || isImeiChanged;
  const isEditable =
    isInvalidRepairInvoice ||
    isInvalidRepairMobilePhoto ||
    (replacementReceiptApplicable && isInvalidReplacementReceipt) ||
    repairInvoiceInfo.statusValue === null ||
    repairMobilePhotoInfo.statusValue === null ||
    replacementReceiptInfo.statusValue === null;

  const showReuploadButton =
    isInvalidRepairInvoice ||
    isInvalidRepairMobilePhoto ||
    (replacementReceiptApplicable && isInvalidReplacementReceipt) ||
    repairInvoiceInfo.hasInvalidStatus ||
    repairMobilePhotoInfo.hasInvalidStatus ||
    replacementReceiptInfo.hasInvalidStatus;

  // document
  const finalDocuments = {
    repairInvoiceImage: selectedClaim?.documents?.["16"]?.url ?? "",
    repairMobilePhoto: selectedClaim?.repaired_mobile_images ?? [],
    replacementReceiptImage: selectedClaim?.documents?.["75"]?.url ?? "",
    isImeiChanged: isImeiChangedFromServer || isImeiChanged,
    new_imei_number: isImeiChanged
      ? ((newImei ||
          selectedClaim?.new_imei_number ||
          selectedClaim?.data?.replacement_imei) ??
        "")
      : "",
    shipmentReceipt: selectedClaim?.shipping_receipt ?? undefined,
  };

  const showSubmitButton =
    (repairInvoiceInfo.statusValue != true ||
      repairMobilePhotoInfo.statusValue != true ||
      (replacementReceiptInfo.statusValue != true &&
        replacementReceiptApplicable)) &&
    !isSubmitDisabledByDeviceReplacement;

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
        (!repairedMobilePhotos ||
          selectedClaim?.repaired_mobile_images?.length === 0) &&
        !selectedClaim?.documents?.["74"]?.status
      ) {
        notifyError("Please Upload Repair Mobile Images");
        return;
      }

      if (
        replacementReceiptApplicable &&
        isValidRepairMobilePhoto &&
        (!replacementReceipt || replacementReceipt.length === 0) &&
        !selectedClaim?.documents?.["75"]?.url
      ) {
        notifyError("Please Upload Replacement Receipt");
        return;
      }

      if (showDeviceReplacementSection && isDeviceReplaced) {
        const trimmedImei = newImei.trim();
        if (!trimmedImei) {
          setNewImeiError("Please enter the new IMEI number");
          notifyError("Please enter the New IMEI when device is replaced.");
          return;
        }
        if (!isIMEIFormat(trimmedImei)) {
          setNewImeiError("IMEI must be exactly 15 digits");
          notifyError("Please enter a valid 15-digit IMEI number.");
          return;
        }
        setNewImeiError(null);
      }

      setIsLoading(true);

      // Helper function to append files in required format
      const appendFiles = (
        files: File[] | undefined,
        documentTypeId: number,
      ) => {
        if (!files) return;
        files.forEach((file) => {
          formData.append(`${documentTypeId}[delete_existing_document]`, "1");
          formData.append(`${documentTypeId}[document]`, file);
          formData.append(
            `${documentTypeId}[document_type_id]`,
            documentTypeId.toString(),
          );
        });
      };

      if (repairInvoice !== undefined) {
        appendFiles(repairInvoice, 16);
      }
      if (repairedMobilePhotos) {
        appendFiles(repairedMobilePhotos, 74);
      }
      if (replacementReceiptApplicable) {
        appendFiles(replacementReceipt, 75);
      }

      // Device replacement: only when section is visible and user chose Yes
      if (showDeviceReplacementSection) {
        formData.append("is_imei_updated", isDeviceReplaced ? "1" : "0");
        if (isDeviceReplaced && newImei.trim()) {
          formData.append("new_imei_number", newImei.trim());
        }
      }

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

  useEffect(() => {
    if (selectedClaim) {
      const showSection =
        selectedClaim.show_device_replacement_section === true;
      if (!showSection) {
        setIsDeviceReplaced(false);
        setNewImei("");
        setNewImeiError(null);
      } else {
        setIsDeviceReplaced(
          !!(selectedClaim.is_imei_updated || selectedClaim.imei_changed),
        );
        setNewImei(
          (selectedClaim.new_imei_number ||
            selectedClaim.data?.replacement_imei) ??
            "",
        );
      }
    }
  }, [
    selectedClaim?.id,
    selectedClaim?.show_device_replacement_section,
    selectedClaim?.is_imei_updated,
    selectedClaim?.imei_changed,
    selectedClaim?.new_imei_number,
    selectedClaim?.data?.replacement_imei,
  ]);

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
    isDeviceReplaced,
    setIsDeviceReplaced,
    newImei,
    setNewImei,
    newImeiError,
    setNewImeiError,

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
    isImeiChangedFromServer,
    isSubmitDisabledByDeviceReplacement,

    // Handlers
    handleSubmit,
    handleRepairInvoiceUpload,
    handleReplacementReceiptUpload,
    repairMobilePhotoInfo,
  };
};
