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
  const [imeiUpdateReason, setImeiUpdateReason] = useState("");
  const [imeiUpdateReasonError, setImeiUpdateReasonError] = useState<
    string | null
  >(null);

  const { selectedClaim, setIsLoading, triggerClaimRefresh } = useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();

  // If estimate flow already marked motherboard/phone replaced (imei_changed=true),
  // do not show/submit the Final Documents "Device replaced?" section.
  const showDeviceReplacementSection =
    selectedClaim?.show_device_replacement_section === true &&
    selectedClaim?.imei_changed !== true;
  const isImeiChanged = showDeviceReplacementSection && isDeviceReplaced;
  const isImeiChangedFromServer = !!(
    selectedClaim?.is_imei_updated || selectedClaim?.imei_changed
  );

  // Get document info for each type (needed early for hasRepairMobileImagesOnServer)
  const repairInvoiceInfo = getDocumentInfo(selectedClaim, "16");
  const repairMobilePhotoInfo = getDocumentInfo(selectedClaim, "74");
  const replacementReceiptInfo = getDocumentInfo(selectedClaim, "75");

  // const hasValidNewImei =
  //   showDeviceReplacementSection &&
  //   isDeviceReplaced &&
  //   newImei.trim().length === 15 &&
  //   isIMEIFormat(newImei.trim());

  const hasRepairMobileImagesOnServer =
    repairMobilePhotoInfo.isValid === true ||
    (Array.isArray(selectedClaim?.repaired_mobile_images) &&
      selectedClaim.repaired_mobile_images.length > 0);

  const isSubmitDisabledByDeviceReplacement =
    showDeviceReplacementSection &&
    isDeviceReplaced &&
    (!newImei ||
      newImei.length !== 15 ||
      !imeiUpdateReason ||
      (repairedMobilePhotos.length === 0 && !hasRepairMobileImagesOnServer));

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
    repairInvoiceDateInfo: selectedClaim?.documents?.["16"] ?? null,
    repairMobilePhotoDateInfo: selectedClaim?.documents?.["74"] ?? null,
    replacementReceiptDateInfo: selectedClaim?.documents?.["75"] ?? null,
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

      const canSubmitDeviceReplacementUpdate =
        showDeviceReplacementSection && !isValidRepairMobilePhoto;

      const deviceReplacementFromServer =
        !!(
          selectedClaim?.is_imei_updated ||
          selectedClaim?.imei_changed ||
          selectedClaim?.new_imei_number ||
          selectedClaim?.data?.replacement_imei
        );

      if (canSubmitDeviceReplacementUpdate && isDeviceReplaced) {
        const trimmedImei = newImei.trim();
        const claimImei = (selectedClaim?.imei_number || "").trim();
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
        if (claimImei && trimmedImei === claimImei) {
          setNewImeiError("New IMEI cannot be same as current IMEI");
          notifyError("New IMEI cannot be same as current IMEI.");
          return;
        }
        if (!imeiUpdateReason) {
          setImeiUpdateReasonError("Please select a reason");
          notifyError("Please select the reason for IMEI update.");
          return;
        }
        setNewImeiError(null);
        setImeiUpdateReasonError(null);
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

      if (showDeviceReplacementSection) {
        if (canSubmitDeviceReplacementUpdate) {
          // Editable: send full device replacement payload
          formData.append("is_imei_updated", isDeviceReplaced ? "1" : "0");
          if (isDeviceReplaced && newImei.trim()) {
            formData.append("new_imei_number", newImei.trim());
          }
          if (isDeviceReplaced && imeiUpdateReason) {
            formData.append("imei_update_reason", imeiUpdateReason);
          }
        } else {
          // View-only: send only the flag, keep existing new IMEI + reason intact
          formData.append(
            "is_imei_updated",
            deviceReplacementFromServer ? "1" : "0",
          );
        }
      }

      const response = await uploadFinalDocuments(
        Number(selectedClaim?.id),
        formData,
      );

      const apiPayload = response.data as
        | undefined
        | {
            success?: boolean;
            message?: string;
            data?: {
              error_msg?: Record<string, string[]>;
            };
          };

      const backendSuccess =
        !!apiPayload && (apiPayload.success === undefined || apiPayload.success === true);

      if (!response.data || !backendSuccess) {
        const fieldMsg =
          apiPayload?.data?.error_msg?.new_imei_number?.[0] ||
          apiPayload?.data?.error_msg?.imei_update_reason?.[0];
        const msg =
          fieldMsg ||
          apiPayload?.message ||
          response.error ||
          "Failed to upload documents. Please try again.";

        if (fieldMsg?.toLowerCase().includes("imei")) {
          setNewImeiError(fieldMsg);
        }
        notifyError(msg);
        return;
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
      if (!showDeviceReplacementSection) {
        setIsDeviceReplaced(false);
        setNewImei("");
        setNewImeiError(null);
        setImeiUpdateReason("");
        setImeiUpdateReasonError(null);
      } else {
        setIsDeviceReplaced(
          !!(selectedClaim.is_imei_updated || selectedClaim.imei_changed),
        );
        setNewImei(
          (selectedClaim.new_imei_number ||
            selectedClaim.data?.replacement_imei) ??
            "",
        );
        setImeiUpdateReason(
          selectedClaim.imei_update_reason ??
            selectedClaim.data?.imei_update_reason ??
            "",
        );
        setImeiUpdateReasonError(null);
      }
    }
  }, [
    selectedClaim?.id,
    showDeviceReplacementSection,
    selectedClaim?.is_imei_updated,
    selectedClaim?.imei_changed,
    selectedClaim?.new_imei_number,
    selectedClaim?.imei_update_reason,
    selectedClaim?.data?.replacement_imei,
    selectedClaim?.data?.imei_update_reason,
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
    imeiUpdateReason,
    setImeiUpdateReason,
    imeiUpdateReasonError,
    setImeiUpdateReasonError,

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
