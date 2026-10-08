import { useState, useEffect, useRef } from "react";
import { useGlobalStore } from "@/store/store";
import { useNotification } from "@/context/NotificationProvider";
import {
  extractRepairInvoiceJobSheet,
  uploadFinalDocuments,
} from "@/services/claimService";
import { getDocumentInfo, isIMEIFormat } from "@/helpers/globalHelper";

type PlainObject = Record<string, unknown>;

const JOB_SHEET_MISMATCH_REASONS = [
  "Due no-response from the customer",
  "Due to shortage of spare parts",
  "Due to special approval given by the claims.",
  "Due to Part Failure Post Repair",
] as const;

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
  const [jobSheetMismatchReason, setJobSheetMismatchReason] = useState("");
  const [newJobSheetNumber, setNewJobSheetNumber] = useState("");
  const [jobSheetMismatchReasonError, setJobSheetMismatchReasonError] =
    useState<string | null>(null);
  const [newJobSheetNumberError, setNewJobSheetNumberError] = useState<
    string | null
  >(null);
  const [isRepairInvoiceExtracting, setIsRepairInvoiceExtracting] =
    useState(false);
  const [extractedRepairInvoiceJobSheetNumber, setExtractedRepairInvoiceJobSheetNumber] =
    useState<string | null>(null);
  const [
    extractedRepairInvoiceJobSheetMatched,
    setExtractedRepairInvoiceJobSheetMatched,
  ] = useState<boolean | null>(null);
  const [repairInvoiceExtractError, setRepairInvoiceExtractError] = useState<
    string | null
  >(null);
  const [repairInvoiceExtractStatus, setRepairInvoiceExtractStatus] = useState<
    "success" | "warning" | "error" | null
  >(null);
  const [repairInvoiceExtractMessage, setRepairInvoiceExtractMessage] =
    useState<string | null>(null);
  const repairInvoiceExtractRequestIdRef = useRef(0);

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
  const canSubmitDeviceReplacementUpdate =
    showDeviceReplacementSection && !isValidRepairMobilePhoto;
  const isSubmitDisabledByDeviceReplacement =
    canSubmitDeviceReplacementUpdate &&
    isDeviceReplaced &&
    (!newImei ||
      newImei.length !== 15 ||
      !imeiUpdateReason ||
      (repairedMobilePhotos.length === 0 && !hasRepairMobileImagesOnServer));
  const savedJobSheetMismatchReason =
    selectedClaim?.job_sheet_mismatch_reason ??
    selectedClaim?.data?.inputs?.job_sheet_mismatch_reason ??
    "";
  const jobSheetMismatchReasons =
    selectedClaim?.job_sheet_mismatch_reasons &&
    selectedClaim.job_sheet_mismatch_reasons.length > 0
      ? selectedClaim.job_sheet_mismatch_reasons
      : JOB_SHEET_MISMATCH_REASONS;
  const hasLocalRepairInvoiceExtract =
    repairInvoice !== undefined &&
    repairInvoice.length > 0 &&
    (extractedRepairInvoiceJobSheetMatched !== null ||
      !!extractedRepairInvoiceJobSheetNumber ||
      !!repairInvoiceExtractError);
  const serverRepairInvoiceJobSheetMismatch =
    selectedClaim?.repair_invoice_job_sheet_matched === false &&
    (!isValidRepairInvoice || !!savedJobSheetMismatchReason);
  const isRepairInvoiceJobSheetMismatch =
    (hasLocalRepairInvoiceExtract &&
      extractedRepairInvoiceJobSheetMatched === false) ||
    (!reuploadFinalDocs && serverRepairInvoiceJobSheetMismatch);
  const repairInvoiceJobSheetNumber =
    hasLocalRepairInvoiceExtract && extractedRepairInvoiceJobSheetNumber
      ? extractedRepairInvoiceJobSheetNumber
      : reuploadFinalDocs
        ? null
      : selectedClaim?.repair_invoice_job_sheet_number;
  const repairInvoiceJobSheetError =
    hasLocalRepairInvoiceExtract && repairInvoiceExtractError
      ? repairInvoiceExtractError
      : reuploadFinalDocs
        ? null
      : selectedClaim?.repair_invoice_job_sheet_error;
  const isSubmitDisabledByJobSheetMismatch =
    isRepairInvoiceJobSheetMismatch &&
    !isValidRepairInvoice &&
    (!jobSheetMismatchReason || !newJobSheetNumber.trim());

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
    (replacementReceiptApplicable && isInvalidReplacementReceipt);

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

      if (isRepairInvoiceJobSheetMismatch) {
        if (!jobSheetMismatchReason) {
          setJobSheetMismatchReasonError("Please select a reason");
          notifyError("Please select the reason for job sheet mismatch.");
          return;
        }
        if (!newJobSheetNumber.trim()) {
          setNewJobSheetNumberError("Please enter the new job sheet number");
          notifyError("Please enter the new job sheet number.");
          return;
        }
        setJobSheetMismatchReasonError(null);
        setNewJobSheetNumberError(null);
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

      if (isRepairInvoiceJobSheetMismatch) {
        formData.append("job_sheet_mismatch_reason", jobSheetMismatchReason);
        formData.append("new_job_sheet_number", newJobSheetNumber.trim());
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
          apiPayload?.data?.error_msg?.imei_update_reason?.[0] ||
          apiPayload?.data?.error_msg?.new_job_sheet_number?.[0] ||
          apiPayload?.data?.error_msg?.job_sheet_mismatch_reason?.[0];
        const msg =
          fieldMsg ||
          apiPayload?.message ||
          response.error ||
          "Failed to upload documents. Please try again.";

        if (fieldMsg?.toLowerCase().includes("imei")) {
          setNewImeiError(fieldMsg);
        }
        if (fieldMsg?.toLowerCase().includes("job sheet")) {
          setNewJobSheetNumberError(fieldMsg);
        }
        if (fieldMsg?.toLowerCase().includes("reason")) {
          setJobSheetMismatchReasonError(fieldMsg);
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

  const getNestedValue = (source: unknown, paths: string[]): unknown => {
    for (const path of paths) {
      const value = path.split(".").reduce<unknown>((current, key) => {
        if (current && typeof current === "object" && key in current) {
          return (current as PlainObject)[key];
        }

        return undefined;
      }, source);

      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }

    return undefined;
  };

  const normalizeJobSheetNumber = (value: string | null | undefined) =>
    (value ?? "").trim().toLowerCase();

  const resetRepairInvoiceExtractState = () => {
    repairInvoiceExtractRequestIdRef.current += 1;
    setIsRepairInvoiceExtracting(false);
    setExtractedRepairInvoiceJobSheetNumber(null);
    setExtractedRepairInvoiceJobSheetMatched(null);
    setRepairInvoiceExtractError(null);
    setRepairInvoiceExtractStatus(null);
    setRepairInvoiceExtractMessage(null);
  };

  const hasFailedJobSheetCheck = (validationRules: unknown) => {
    if (!validationRules || typeof validationRules !== "object") {
      return false;
    }

    const checks = (validationRules as PlainObject).checks;
    if (!checks || typeof checks !== "object") {
      return false;
    }

    return Object.entries(checks as PlainObject).some(([key, value]) => {
      if (!value || typeof value !== "object") {
        return false;
      }

      const check = value as PlainObject;
      const status = check.status;
      const failed =
        status === false ||
        status === 0 ||
        String(status).toLowerCase() === "false" ||
        String(status).toLowerCase() === "0";
      const text = [
        key,
        check.message,
        check.label,
        check.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        failed &&
        (text.includes("job sheet") ||
          text.includes("jobsheet") ||
          text.includes("job_sheet"))
      );
    });
  };

  const handleRepairInvoiceUpload = async (files: File[]) => {
    setRepairInvoice(files);
    setRepairInvoiceError(false);
    setJobSheetMismatchReasonError(null);
    setNewJobSheetNumberError(null);
    resetRepairInvoiceExtractState();

    const repairInvoiceFile = files[0];
    if (!repairInvoiceFile || !selectedClaim?.id) {
      return;
    }

    const requestId = repairInvoiceExtractRequestIdRef.current + 1;
    repairInvoiceExtractRequestIdRef.current = requestId;
    setIsRepairInvoiceExtracting(true);

    const formData = new FormData();
    formData.append("claim_id", String(selectedClaim.id));
    formData.append(
      "job_sheet_number",
      selectedClaim.estimate_job_sheet_number ??
        selectedClaim.job_sheet_number ??
        selectedClaim.data?.inputs?.job_sheet_number ??
        "",
    );
    formData.append("16[delete_existing_document]", "1");
    formData.append("16[document]", repairInvoiceFile);
    formData.append("16[document_type_id]", "16");

    try {
      const response = await extractRepairInvoiceJobSheet(formData);

      if (repairInvoiceExtractRequestIdRef.current !== requestId) {
        return;
      }

      const payload = response.data;
      const apiSucceeded =
        response.success &&
        (payload?.success === undefined || payload.success === true);

      if (!apiSucceeded) {
        setRepairInvoiceExtractStatus("error");
        setRepairInvoiceExtractMessage(
          payload?.message ||
            response.error ||
            "Repair invoice could not be checked right now.",
        );
        setRepairInvoiceExtractError(null);
        setExtractedRepairInvoiceJobSheetMatched(null);
        return;
      }

      const extractedJobSheetRaw = getNestedValue(payload, [
        "data.data.invoice_obj.job_sheet_number",
        "data.data.invoice_obj.qr_data.JobSheetNumber",
        "data.data.invoice_obj.qr_data.job_sheet_number",
        "data.data.invoice_obj.qr_data.jobsheet_number",
        "data.data.job_sheet_number",
        "data.data.repair_invoice_job_sheet_number",
        "data.data.repair_invoice_detail.job_sheet_number",
        "data.data.qr_data.JobSheetNumber",
        "data.data.qr_data.job_sheet_number",
        "data.data.qr_data.jobsheet_number",
        "data.invoice_obj.job_sheet_number",
        "data.invoice_obj.qr_data.JobSheetNumber",
        "data.invoice_obj.qr_data.job_sheet_number",
        "data.invoice_obj.qr_data.jobsheet_number",
        "data.job_sheet_number",
        "data.repair_invoice_job_sheet_number",
        "data.repair_invoice_detail.job_sheet_number",
        "data.qr_data.JobSheetNumber",
        "data.qr_data.job_sheet_number",
        "data.qr_data.jobsheet_number",
        "invoice_obj.job_sheet_number",
        "invoice_obj.qr_data.JobSheetNumber",
        "invoice_obj.qr_data.job_sheet_number",
        "invoice_obj.qr_data.jobsheet_number",
        "job_sheet_number",
        "repair_invoice_job_sheet_number",
        "qr_data.JobSheetNumber",
        "qr_data.job_sheet_number",
        "qr_data.jobsheet_number",
      ]);
      const extractedJobSheet =
        typeof extractedJobSheetRaw === "string"
          ? extractedJobSheetRaw.trim()
          : extractedJobSheetRaw !== undefined
            ? String(extractedJobSheetRaw).trim()
            : "";
      const matchedRaw = getNestedValue(payload, [
        "data.data.invoice_obj.is_job_sheet_number",
        "data.data.invoice_obj.repair_invoice_job_sheet_matched",
        "data.data.validation_results.checks.imei_and_job_sheet_match.status",
        "data.data.validation_results.overall_status",
        "data.data.repair_invoice_job_sheet_matched",
        "data.data.is_job_sheet_number",
        "data.data.job_sheet_matched",
        "data.data.validation.is_job_sheet_number",
        "data.invoice_obj.is_job_sheet_number",
        "data.invoice_obj.repair_invoice_job_sheet_matched",
        "data.validation_results.checks.imei_and_job_sheet_match.status",
        "data.validation_results.overall_status",
        "data.repair_invoice_job_sheet_matched",
        "data.is_job_sheet_number",
        "data.job_sheet_matched",
        "data.validation.is_job_sheet_number",
        "invoice_obj.is_job_sheet_number",
        "invoice_obj.repair_invoice_job_sheet_matched",
        "validation_results.checks.imei_and_job_sheet_match.status",
        "validation_results.overall_status",
        "repair_invoice_job_sheet_matched",
        "is_job_sheet_number",
        "job_sheet_matched",
      ]);
      const validationRules = getNestedValue(payload, [
        "data.data.validation_results",
        "data.data.invoice_obj.validation_results",
        "data.data.validation_rules",
        "data.data.repair_invoice_detail.validation_rules",
        "data.validation_results",
        "data.invoice_obj.validation_results",
        "data.validation_rules",
        "data.repair_invoice_detail.validation_rules",
        "validation_results",
        "invoice_obj.validation_results",
        "validation_rules",
      ]);
      const claimJobSheet =
        selectedClaim.estimate_job_sheet_number ??
        selectedClaim.job_sheet_number ??
        selectedClaim.data?.inputs?.job_sheet_number ??
        "";

      let matched: boolean | null = null;
      if (typeof matchedRaw === "boolean") {
        matched = matchedRaw;
      } else if (
        typeof matchedRaw === "string" &&
        ["true", "false", "1", "0"].includes(matchedRaw.toLowerCase())
      ) {
        matched = ["true", "1"].includes(matchedRaw.toLowerCase());
      } else if (extractedJobSheet && claimJobSheet) {
        matched =
          normalizeJobSheetNumber(extractedJobSheet) ===
          normalizeJobSheetNumber(claimJobSheet);
      } else if (hasFailedJobSheetCheck(validationRules)) {
        matched = false;
      }

      setExtractedRepairInvoiceJobSheetNumber(extractedJobSheet || null);

      if (!extractedJobSheet) {
        setExtractedRepairInvoiceJobSheetMatched(null);
        setRepairInvoiceExtractStatus("warning");
        setRepairInvoiceExtractMessage(
          "Job sheet number could not be read from the repair invoice.",
        );
        setRepairInvoiceExtractError(
          "We could not verify the job sheet number at this time. You may proceed with submission; the document will be reviewed during the standard validation process.",
        );
        return;
      }

      setRepairInvoiceExtractError(null);
      setExtractedRepairInvoiceJobSheetMatched(matched);

      if (matched === false) {
        setRepairInvoiceExtractStatus("warning");
        setRepairInvoiceExtractMessage(
          "Job sheet mismatch found. Please select a reason before submitting.",
        );
        setNewJobSheetNumber(extractedJobSheet);
      } else if (matched === true) {
        setRepairInvoiceExtractStatus("success");
        setRepairInvoiceExtractMessage(
          "Repair invoice job sheet matched successfully.",
        );
      } else {
        setRepairInvoiceExtractStatus("warning");
        setRepairInvoiceExtractMessage(
          "Repair invoice checked. Job sheet match will be confirmed during final validation.",
        );
      }
    } catch {
      if (repairInvoiceExtractRequestIdRef.current !== requestId) {
        return;
      }

      setRepairInvoiceExtractStatus("error");
      setRepairInvoiceExtractMessage(
        "Repair invoice could not be checked right now.",
      );
      setRepairInvoiceExtractError(null);
      setExtractedRepairInvoiceJobSheetMatched(null);
    } finally {
      if (repairInvoiceExtractRequestIdRef.current === requestId) {
        setIsRepairInvoiceExtracting(false);
      }
    }
  };

  const handleReplacementReceiptUpload = (files: File[]) => {
    setReplacementReceipt(files);
    setReplacementReceiptError(false);
  };

  const beginFinalDocumentsReupload = () => {
    setReuploadFinalDocs(true);
    setRepairInvoice(undefined);
    setRepairInvoiceError(true);
    setJobSheetMismatchReason("");
    setNewJobSheetNumber("");
    setJobSheetMismatchReasonError(null);
    setNewJobSheetNumberError(null);
    resetRepairInvoiceExtractState();
  };

  useEffect(() => {
    setReuploadMobile(false);
    setReuploadFinalDocs(false);
    resetRepairInvoiceExtractState();
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
      setJobSheetMismatchReason(
        selectedClaim.job_sheet_mismatch_reason ??
          selectedClaim.data?.inputs?.job_sheet_mismatch_reason ??
          "",
      );
      const hasSavedJobSheetCorrection = !!(
        selectedClaim.job_sheet_mismatch_reason ||
        selectedClaim.data?.inputs?.job_sheet_mismatch_reason
      );
      setNewJobSheetNumber(
        hasSavedJobSheetCorrection
          ? (selectedClaim.corrected_job_sheet_number ??
              selectedClaim.data?.inputs?.corrected_job_sheet_number ??
              "")
          : (selectedClaim.repair_invoice_job_sheet_number ?? ""),
      );
      setJobSheetMismatchReasonError(null);
      setNewJobSheetNumberError(null);
    }
  }, [
    selectedClaim,
    selectedClaim?.id,
    showDeviceReplacementSection,
    selectedClaim?.is_imei_updated,
    selectedClaim?.imei_changed,
    selectedClaim?.new_imei_number,
    selectedClaim?.imei_update_reason,
    selectedClaim?.data?.replacement_imei,
    selectedClaim?.data?.imei_update_reason,
    selectedClaim?.job_sheet_number,
    selectedClaim?.corrected_job_sheet_number,
    selectedClaim?.data?.inputs?.corrected_job_sheet_number,
    selectedClaim?.repair_invoice_job_sheet_number,
    selectedClaim?.job_sheet_mismatch_reason,
    selectedClaim?.data?.inputs?.job_sheet_mismatch_reason,
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
    beginFinalDocumentsReupload,
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
    jobSheetMismatchReason,
    setJobSheetMismatchReason,
    newJobSheetNumber,
    setNewJobSheetNumber,
    jobSheetMismatchReasonError,
    setJobSheetMismatchReasonError,
    newJobSheetNumberError,
    setNewJobSheetNumberError,
    jobSheetMismatchReasons,

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
    isRepairInvoiceJobSheetMismatch,
    isSubmitDisabledByJobSheetMismatch,
    isRepairInvoiceExtracting,
    repairInvoiceExtractStatus,
    repairInvoiceExtractMessage,
    repairInvoiceJobSheetNumber,
    repairInvoiceJobSheetError,

    // Handlers
    handleSubmit,
    handleRepairInvoiceUpload,
    handleReplacementReceiptUpload,
    repairMobilePhotoInfo,
  };
};
