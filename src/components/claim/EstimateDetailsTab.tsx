"use client";

import Image from "next/image";
import { useGlobalStore } from "@/store/store";
import {
  getEstimateButtonLabel,
  isEstimateEditable,
} from "@/helpers/globalHelper";
import EstimateTabViewComponent from "@/components/claim/view/EstimateTabView";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { useEffect, useState } from "react";
import GalleryPopup from "@/components/ui/GalleryPopup";
import {
  MAX_DAMAGE_IMAGES,
  MAX_FILE_SIZE,
  MIN_DAMAGE_IMAGES,
} from "@/globalConstant";
import { urlToFile, fileToBase64 } from "@/helpers/fileHelper";
import { compressImage } from "@/utils/compressImage";
import {
  validateEstimateDocument,
  validateImeiFromImage,
} from "@/services/claimService";

interface EstimateDetailsTabProps {
  onSubmit: (formData: FormData) => void;
}

const EstimateDetailsTab: React.FC<EstimateDetailsTabProps> = ({
  onSubmit,
}) => {
  const [damagePhotosError, setDamagePhotosError] = useState<string | null>(
    null
  );

  const [estimateDocumentError, setEstimateDocumentError] = useState<
    string | null
  >("");

  const [showImeiImageUpload, setShowImeiImageUpload] = useState<boolean>(true);
  const [isValidatingDamageImei, setIsValidatingDamageImei] =
    useState<boolean>(false);
  const [imeiDamageImageError, setImeiDamageImageError] = useState<
    string | null
  >("");
  const [damageImeiValidationMessage, setDamageImeiValidationMessage] =
    useState<string | null>("");

  const {
    selectedClaim,
    estimateDetailsState,
    setEstimateDetailsState,
    claimStatus,
    claimRevised,
    setClaimRevised,
  } = useGlobalStore();
  const [showDamageImagesError, setShowDamageImagesError] = useState(true);
  const [showEstimateDocumentError, setShowEstimateDocumentError] =
    useState(true);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [showReplacementConfirmation, setShowReplacementConfirmation] =
    useState(false);
  const [pendingReplacementValue, setPendingReplacementValue] = useState<
    boolean | string | null
  >(null);
  const [isReplacementConfirmed, setIsReplacementConfirmed] = useState(false);
  const [showEstimateDocValidationError, setShowEstimateDocValidationError] =
    useState(true);
  const [showDamageMobImageError, setShowDamageMobImageError] = useState(true);
  const [isValidatingDocument, setIsValidatingDocument] = useState(false);
  const [documentValidationMessage, setDocumentValidationMessage] = useState<
    string | null
  >(null);

  useEffect(() => {
    setIsFormDisabled(
      claimStatus === "Claim Submitted" ||
        claimStatus === "Invalid Documents" ||
        claimStatus === "Estimate Revised"
    );
  }, [claimStatus, selectedClaim]);

  useEffect(() => {
    if (selectedClaim) {
      // Reset estimateDetailsState whenever selectedClaim changes
      const isImeiChangedCheckbox =
        claimStatus === "Claim Initiated" || claimRevised
          ? null
          : selectedClaim?.imei_changed;
      setEstimateDetailsState({
        estimateAmount:
          selectedClaim?.claimed_amount && !claimRevised
            ? selectedClaim?.claimed_amount
            : "",
        jobSheetNumber:
          selectedClaim?.job_sheet_number && !claimRevised
            ? selectedClaim?.job_sheet_number
            : "",
        estimateDetails:
          selectedClaim?.data?.inputs?.estimate_details && !claimRevised
            ? selectedClaim?.data?.inputs?.estimate_details
            : "",
        replacementConfirmed: isImeiChangedCheckbox,
        damagePhotos:
          selectedClaim?.mobile_damage_photos &&
          !claimRevised &&
          claimStatus != "Claim Initiated"
            ? selectedClaim?.mobile_damage_photos
            : [],
        estimateDocument:
          selectedClaim?.documents?.["15"]?.url && !claimRevised
            ? selectedClaim?.documents?.["15"]?.url
            : null,
      });
      setIsReplacementConfirmed(false);
    }
  }, [selectedClaim, setEstimateDetailsState, claimRevised]);

  // ✅ Handle Replacement Confirmation
  const handleReplacementSelection = (value: boolean) => {
    setPendingReplacementValue(value);
    setShowReplacementConfirmation(true);
  };

  const confirmReplacementSelection = () => {
    if (pendingReplacementValue != null) {
      setEstimateDetailsState({
        replacementConfirmed: pendingReplacementValue,
      });
      setIsReplacementConfirmed(true);
    }
    setShowReplacementConfirmation(false);
  };

  const cancelReplacementSelection = () => {
    setPendingReplacementValue(null);
    setShowReplacementConfirmation(false);
  };

  const isFormEditable = isEstimateEditable(claimStatus);

  const isInvalidDocument = selectedClaim?.documents?.["15"]?.status_reason_id
    ? true
    : false;
  const invalidDocumentReason = selectedClaim?.documents?.["15"]?.status_reason
    ? selectedClaim?.documents?.["15"]?.status_reason
    : "";
  const isInvalidImages = selectedClaim?.documents?.["73"]?.status_reason_id
    ? true
    : false;
  const invalidImagesReason = selectedClaim?.documents?.["73"]?.status_reason
    ? selectedClaim?.documents?.["73"]?.status_reason
    : "";

  const estimateDocStatus =
    selectedClaim?.documents?.["15"]?.status == 1 ? true : false;
  const damageImageStatus =
    selectedClaim?.documents?.["73"]?.status == 1 ? true : false;

  const {
    estimateAmount,
    jobSheetNumber,
    estimateDetails,
    replacementConfirmed,
    damagePhotos,
    estimateDocument,
  } = estimateDetailsState;

  const handleInputChange = <K extends keyof typeof estimateDetailsState>(
    key: K,
    value: (typeof estimateDetailsState)[K]
  ) => {
    setEstimateDetailsState({ [key]: value });
  };

  const handleDamagePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setShowDamageMobImageError(false);

      if (damagePhotos.length + newFiles.length > MAX_DAMAGE_IMAGES) {
        setDamagePhotosError(
          `You can upload a maximum of ${MAX_DAMAGE_IMAGES} images.`
        );
        return;
      }

      try {
        // Compress all files
        const compressedFiles = await Promise.all(
          newFiles.map((file) => compressImage(file))
        );

        const updatedPhotos = [...damagePhotos, ...compressedFiles];

        setEstimateDetailsState({
          damagePhotos: updatedPhotos,
        });

        // Show error if still below minimum after adding
        if (updatedPhotos.length < MIN_DAMAGE_IMAGES) {
          setDamagePhotosError(
            `Please upload Minimum ${MIN_DAMAGE_IMAGES} images.`
          );
        } else {
          setDamagePhotosError(null);
        }

        event.target.value = "";
      } catch (err) {
        console.error("Image compression failed:", err);
        setDamagePhotosError("Failed to process images. Please try again.");
      }
    }
  };

  const handleImeiDamagePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      setIsValidatingDamageImei(true);
      const newFiles = Array.from(event.target.files);
      setShowDamageMobImageError(false);

      try {
        // Compress all files
        const compressedFiles = await Promise.all(
          newFiles.map((file) => compressImage(file))
        );

        const updatedPhotos = [...damagePhotos, ...compressedFiles];

        setEstimateDetailsState({
          damagePhotos: updatedPhotos,
        });

        // Show error if still below minimum after adding
        if (updatedPhotos.length < 1) {
          setDamagePhotosError(`Please upload Minimum 1 image.`);
        } else {
          setDamagePhotosError(null);
        }

        event.target.value = "";
        const validationResponse = await validateImeiFromImage(
          Number(selectedClaim?.id),
          updatedPhotos[0]
        );

        if (validationResponse.is_image_valid) {
          setImeiDamageImageError(null);
          if (validationResponse.message) {
            setDamageImeiValidationMessage(
              validationResponse.message ?? "Imei Found in Image"
            );
            setTimeout(() => setDamageImeiValidationMessage(null), 5000);
          }
          setShowImeiImageUpload(false);
        } else {
          setImeiDamageImageError(
            validationResponse.message ?? "Damage Image Imei validation failed."
          );
          setDamageImeiValidationMessage(null);
          setShowImeiImageUpload(false);
          setIsValidatingDamageImei(false);
        }
      } catch (err) {
        console.error("Image compression failed:", err);
        setDamagePhotosError("Failed to process images. Please try again.");
        setShowImeiImageUpload(true);
        setIsValidatingDamageImei(false);
      }
    }
  };

  const handleEstimateDocumentUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setShowEstimateDocValidationError(false);

      // Check if file size exceeds 2MB
      if (file.size > MAX_FILE_SIZE) {
        setEstimateDetailsState({ estimateDocument: null });
        setEstimateDocumentError("File size must be less than 2MB.");
        event.target.value = "";
        return;
      }

      // Check if file is PDF
      if (file.type !== "application/pdf") {
        setEstimateDetailsState({ estimateDocument: null });
        setEstimateDocumentError("Please upload a PDF file.");
        event.target.value = "";
        return;
      }

      setIsValidatingDocument(true);
      setDocumentValidationMessage(null); // Clear any previous messages
      // Convert PDF to base64
      const base64Pdf = await fileToBase64(file);

      // Validate document with API
      const validationResponse = await validateEstimateDocument(
        Number(selectedClaim?.id),
        base64Pdf
      );

      if (validationResponse.success) {
        // Document is valid, update state
        setEstimateDetailsState({ estimateDocument: file });
        setEstimateDocumentError(null);
        // Show success message from API response
        if (validationResponse.message) {
          setDocumentValidationMessage(validationResponse.message);
          // Clear the success message after 5 seconds
          setTimeout(() => setDocumentValidationMessage(null), 5000);
        }
      } else {
        // Document validation failed
        setEstimateDetailsState({ estimateDocument: null });
        setEstimateDocumentError(
          validationResponse.message || "Document validation failed."
        );
        setDocumentValidationMessage(null);
      }

      setIsValidatingDocument(false);

      event.target.value = "";
    }
  };

  const handleRemoveDamagePhoto = (index: number) => {
    const updatedPhotos = damagePhotos.filter((_, i) => i !== index);
    if (updatedPhotos?.length == 0) {
      setShowImeiImageUpload(true);
      setIsValidatingDamageImei(false);
    }
    setEstimateDetailsState({ damagePhotos: updatedPhotos });
    if (updatedPhotos?.length < MIN_DAMAGE_IMAGES) {
      setDamagePhotosError(
        `Please upload Minimum ${MIN_DAMAGE_IMAGES} images.`
      );
      return;
    }
    if (!updatedPhotos) {
      setShowDamageMobImageError(true);
    }
  };

  const handleRemoveEstimateDocument = () => {
    setEstimateDetailsState({ estimateDocument: null });
    setShowEstimateDocValidationError(true);
  };

  const isSubmitDisabled =
    !estimateAmount ||
    Number(estimateAmount) < 0 ||
    !jobSheetNumber ||
    !estimateDetails ||
    !isReplacementConfirmed ||
    !estimateDocument ||
    damagePhotos.length < 5 ||
    damagePhotos.length > 11;

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("claimed_amount", estimateAmount);
    formData.append("estimate_details", estimateDetails);
    formData.append("job_sheet_number", jobSheetNumber);
    formData.append(
      "replacement_confirmed",
      replacementConfirmed === true ? "yes" : "no"
    );

    if (estimateDocument) {
      formData.append("estimate_document", estimateDocument);
    }

    // Attach damage photos
    if (damageImageStatus == false || claimRevised === true) {
      for (let index = 0; index < damagePhotos.length; index++) {
        const photo = damagePhotos[index];
        if (typeof photo !== "string") {
          formData.append(`mobile_damage_photos[${index}]`, photo);
        } else {
          const file = await urlToFile(photo, `damage_${index}`);
          formData.append(`mobile_damage_photos[${index}]`, file);
        }
      }
    }

    try {
      onSubmit(formData);
    } catch (error) {
      setIsFormDisabled(false);
      console.error("Failed to fetch reasons:", error);
    }

    // setClaimStatus("Claim Submitted");
    setClaimRevised(false);
  };

  const handleEditButtonClick = () => {
    setIsFormDisabled(false);
    const updates: Partial<typeof estimateDetailsState> = {};
    updates.replacementConfirmed = null;

    if (isInvalidImages == true) {
      updates.damagePhotos = [];
    }

    if (isInvalidDocument == true) {
      updates.estimateDocument = null;
    }

    setEstimateDetailsState({
      ...estimateDetailsState,
      ...updates,
    });
  };

  return isFormEditable ? (
    <div>
      <h2 className="text-lg font-semibold mb-4">Estimate Details</h2>
      {isInvalidDocument && showDamageImagesError == true && isFormDisabled && (
        <ErrorAlert
          message={invalidDocumentReason}
          onClose={() => setShowDamageImagesError(false)}
        />
      )}

      {isInvalidImages &&
        showEstimateDocumentError == true &&
        isFormDisabled && (
          <ErrorAlert
            message={invalidImagesReason}
            onClose={() => setShowEstimateDocumentError(false)}
          />
        )}

      <div className="flex gap-8">
        <div className="w-1/2">
          <label className="block text-xs font-medium mb-1">
            Estimate Amount *
          </label>
          <input
            type="number"
            value={estimateAmount}
            onChange={(e) =>
              handleInputChange("estimateAmount", e.target.value)
            }
            className="input text-sm input-bordered w-full mb-4 bg-inputBg"
            placeholder="Ex: 9000"
            disabled={isFormDisabled}
          />

          <label className="block text-xs font-medium mb-1">
            Job Sheet Number *
          </label>
          <input
            type="text"
            value={jobSheetNumber}
            onChange={(e) =>
              handleInputChange("jobSheetNumber", e.target.value)
            }
            className="input text-sm input-bordered w-full mb-4 bg-inputBg"
            placeholder="Ex: JDHSJKF3248204"
            disabled={isFormDisabled}
          />

          <label className="block text-xs font-medium mb-1">
            Estimate Details *
          </label>
          <textarea
            value={estimateDetails}
            onChange={(e) =>
              handleInputChange("estimateDetails", e.target.value)
            }
            className="textarea text-sm textarea-bordered w-full mb-4 bg-inputBg"
            placeholder="Enter estimate details"
            disabled={isFormDisabled}
          ></textarea>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-2">
              Motherboard/Phone is getting replaced?
            </label>

            <div className="flex items-center gap-4">
              {/* Yes Option */}
              <button
                type="button"
                className={`flex border border-[#EEEEEE] items-center justify-center w-[24px] h-[24px] rounded-md text-white ${
                  isFormDisabled
                    ? "bg-[#c9c9c9]"
                    : replacementConfirmed === true
                    ? "bg-checkboxCheckedBg"
                    : "bg-inputBg"
                }`}
                onClick={() => handleReplacementSelection(true)}
                disabled={isFormDisabled}
              >
                {replacementConfirmed == true && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <span className="text-sm">Yes</span>

              {/* No Option */}
              <button
                type="button"
                className={`flex border border-[#EEEEEE] items-center justify-center w-[24px] h-[24px] rounded-md text-white ${
                  isFormDisabled
                    ? "bg-[#c9c9c9]"
                    : replacementConfirmed === false
                    ? "bg-checkboxCheckedBg"
                    : "bg-inputBg"
                }`}
                onClick={() => handleReplacementSelection(false)}
                disabled={isFormDisabled}
              >
                {replacementConfirmed == false && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <span className="text-sm">No</span>
            </div>
            {/* // setIsFormDisabled */}
          </div>
          {isFormDisabled ? (
            <button
              className={`btn w-1/2 hover:bg-blue-700 bg-primaryBlue text-white`}
              onClick={() => handleEditButtonClick()}
            >
              Edit Estimate
            </button>
          ) : (
            <button
              className={`btn w-1/2 hover:bg-blue-700 ${
                isSubmitDisabled
                  ? "bg-btnDisabledBg text-btnDisabledText"
                  : "bg-primaryBlue text-white"
              }`}
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
            >
              {getEstimateButtonLabel(claimStatus)}
            </button>
          )}
        </div>

        <div className="w-1/2">
          {/* Upload document */}
          <label className="block text-xs font-medium mb-2">
            Estimate Document (pdf)
          </label>
          <div className="mb-4">
            {!isFormDisabled && estimateDocStatus == false && (
              <div className="space-y-2">
                <label
                  className={`w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded px-[10px] ${
                    isValidatingDocument
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleEstimateDocumentUpload}
                    className="hidden"
                    disabled={isValidatingDocument}
                  />
                  <span className="text-grayFont text-sm">
                    {isValidatingDocument ? "Validating..." : "Add Document"}
                  </span>
                  {isValidatingDocument ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primaryBlue"></div>
                  ) : (
                    <Image
                      src="/images/upload-icon.svg"
                      alt="Upload"
                      width={20}
                      height={20}
                    />
                  )}
                </label>
                {isValidatingDocument && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span>Validating document...</span>
                  </div>
                )}
              </div>
            )}

            {estimateDocument && (
              <div className="relative bg-inputBg w-[60px] h-[50px] flex items-center justify-center border border-[#EEEEEE] mt-2">
                {estimateDocument ? (
                  typeof estimateDocument === "string" ? (
                    estimateDocument.endsWith(".pdf") ? (
                      <a
                        href={estimateDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src="/images/pdf-icon.svg"
                          alt="Estimate Upload"
                          width={30}
                          height={50}
                          className="h-[100%]"
                        />
                      </a>
                    ) : (
                      <Image
                        src={estimateDocument}
                        alt="Estimate Document"
                        width={30}
                        height={50}
                        className="rounded border h-[100%]"
                      />
                    )
                  ) : estimateDocument.type === "application/pdf" ? (
                    <Image
                      src="/images/pdf-icon.svg"
                      alt="Estimate Upload"
                      width={30}
                      height={50}
                      className="h-[100%]"
                    />
                  ) : (
                    <Image
                      src={URL.createObjectURL(estimateDocument)}
                      alt="Estimate Document"
                      width={30}
                      height={50}
                      className="rounded border h-[100%]"
                    />
                  )
                ) : (
                  <></>
                )}
                {!isFormDisabled && estimateDocStatus != true && (
                  <button
                    type="button"
                    className="absolute top-[-4px] right-[-4px] bg-crossBg rounded-full p-[1px]"
                    onClick={handleRemoveEstimateDocument}
                  >
                    <Image
                      src="/images/x-close.svg"
                      alt="Remove"
                      width={12}
                      height={12}
                    />
                  </button>
                )}
              </div>
            )}

            {estimateDocumentError && (
              <div className="mt-2">
                <ErrorAlert
                  message={estimateDocumentError}
                  onClose={() => setEstimateDocumentError(null)}
                />
              </div>
            )}
            {documentValidationMessage && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2 h-2 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-green-800 font-medium">
                    {documentValidationMessage}
                  </span>
                </div>
              </div>
            )}

            {isInvalidDocument && showEstimateDocValidationError ? (
              <span className="text-[#EB5757] text-xxs font-semibold">
                Invalid Document : {invalidDocumentReason}
              </span>
            ) : (claimStatus === "Claim Submitted" ||
                claimStatus === "Estimate Revised") &&
              estimateDocStatus == false ? (
              <span className="text-[#FF9548] text-xxs font-semibold">
                Under Review
              </span>
            ) : claimStatus === "Documents Verified" ||
              estimateDocStatus == true ? (
              <span className="text-[#19AD61] text-xxs font-semibold">
                Valid
              </span>
            ) : (
              <></>
            )}
          </div>

          {/* Upload damage images */}
          <label className="block text-xs font-medium mb-2">
            {showImeiImageUpload
              ? "Damage Mobile Imei Image"
              : "Damage Mobile Photo (Upload at least 5 images)"}
          </label>
          <div className="mb-4">
            {!isFormDisabled &&
              damageImageStatus == false &&
              showImeiImageUpload == false && (
                <label className="w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded cursor-pointer px-[10px]">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleDamagePhotoUpload}
                    className="hidden"
                    disabled={damagePhotos.length >= MAX_DAMAGE_IMAGES}
                  />
                  <span className="text-grayFont text-sm">Add Photo</span>
                  <Image
                    src="/images/upload-icon.svg"
                    alt="Upload"
                    width={20}
                    height={20}
                  />
                </label>
              )}

            {!isFormDisabled &&
              damageImageStatus == false &&
              showImeiImageUpload == true && (
                <div className="space-y-2">
                  <label className="w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded cursor-pointer px-[10px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImeiDamagePhotoUpload}
                      className="hidden"
                      disabled={damagePhotos.length >= 1}
                    />
                    <span className="text-grayFont text-sm">Add Photo</span>
                    <Image
                      src="/images/upload-icon.svg"
                      alt="Upload"
                      width={20}
                      height={20}
                    />
                  </label>
                  {isValidatingDamageImei && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      <span>Validating Image...</span>
                    </div>
                  )}
                </div>
              )}

            {damagePhotos && (
              <div className="flex justify-start align-center w-4/5 flex flex-wrap gap-2">
                <GalleryPopup
                  images={estimateDetailsState?.damagePhotos}
                  onRemoveImage={handleRemoveDamagePhoto}
                  allowRemoval={!isFormDisabled && damageImageStatus != true}
                />
              </div>
            )}

            {imeiDamageImageError && (
              <div className="mt-2">
                <ErrorAlert
                  message={imeiDamageImageError}
                  onClose={() => setImeiDamageImageError(null)}
                />
              </div>
            )}

            {damageImeiValidationMessage && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2 h-2 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-green-800 font-medium">
                    {damageImeiValidationMessage}
                  </span>
                </div>
              </div>
            )}

            {damagePhotosError && (
              <ErrorAlert
                message={damagePhotosError}
                onClose={() => setDamagePhotosError(null)}
              />
            )}

            {isInvalidImages && showDamageMobImageError ? (
              <span className="text-[#EB5757] text-xxs font-semibold">
                Invalid Images : {invalidImagesReason}
              </span>
            ) : (claimStatus === "Claim Submitted" ||
                claimStatus === "Estimate Revised") &&
              damageImageStatus == false ? (
              <span className="text-[#FF9548] text-xxs font-semibold">
                Under Review
              </span>
            ) : claimStatus === "Documents Verified" ||
              damageImageStatus == true ? (
              <span className="text-[#19AD61] text-xxs font-semibold">
                Valid
              </span>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>

      {showReplacementConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center p-[40px]">
            <h2 className="text-center text-xl font-semibold text-[#181D27]">
              Are you sure?
            </h2>
            {pendingReplacementValue == true ? (
              <p className="text-center text-base text-[#414651] font-medium my-4">
                Motherboard/Phone is getting replaced.
              </p>
            ) : (
              <p className="text-center text-base text-[#414651] font-medium my-4">
                Motherboard/Phone is not getting replace.
              </p>
            )}
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="w-1/2 border border-gray-300 px-4 py-2 rounded-md text-[#414651] hover:bg-gray-100 transition-all duration-200 h-[50px]"
                onClick={cancelReplacementSelection}
              >
                Cancel
              </button>

              <button
                className="w-1/2 h-[50px] px-4 py-2 rounded-md bg-primaryBlue text-white hover:bg-lightPrimaryBlue"
                onClick={confirmReplacementSelection}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : claimRevised ? (
    <>
      <div className="flex gap-8">
        <div className="w-1/2">
          <label className="block text-xs font-medium mb-1">
            Estimate Amount *
          </label>
          <input
            type="number"
            onChange={(e) =>
              handleInputChange("estimateAmount", e.target.value)
            }
            className="input text-sm input-bordered w-full mb-4 bg-inputBg"
            placeholder="Ex: 9000"
            disabled={isFormDisabled}
          />

          <label className="block text-xs font-medium mb-1">
            Job Sheet Number *
          </label>
          <input
            type="text"
            onChange={(e) =>
              handleInputChange("jobSheetNumber", e.target.value)
            }
            className="input text-sm input-bordered w-full mb-4 bg-inputBg"
            placeholder="Ex: JDHSJKF3248204"
            disabled={isFormDisabled}
          />

          <label className="block text-xs font-medium mb-1">
            Estimate Details *
          </label>
          <textarea
            onChange={(e) =>
              handleInputChange("estimateDetails", e.target.value)
            }
            className="textarea text-sm textarea-bordered w-full mb-4 bg-inputBg"
            placeholder="Enter estimate details"
            disabled={isFormDisabled}
          ></textarea>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-2">
              Motherboard/Phone is getting replaced?
            </label>

            <div className="flex items-center gap-4">
              {/* Yes Option */}
              <button
                type="button"
                className={`flex border border-[#EEEEEE] items-center justify-center w-[24px] h-[24px] rounded-md text-white ${
                  replacementConfirmed == true
                    ? "bg-checkboxCheckedBg"
                    : "bg-inputBg"
                }`}
                onClick={() => handleReplacementSelection(true)}
                disabled={isFormDisabled}
              >
                {replacementConfirmed == true && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <span className="text-sm">Yes</span>

              {/* No Option */}
              <button
                type="button"
                className={`flex border border-[#EEEEEE] items-center justify-center w-[24px] h-[24px] rounded-md text-white ${
                  replacementConfirmed == false
                    ? "bg-checkboxCheckedBg"
                    : "bg-inputBg"
                }`}
                onClick={() => handleReplacementSelection(false)}
                disabled={isFormDisabled}
              >
                {replacementConfirmed == false && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <span className="text-sm">No</span>
            </div>
            {/* // setIsFormDisabled */}
          </div>

          <button
            className={`btn w-1/2 hover:bg-blue-700 bg-primaryBlue text-white`}
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            Revise Estimate
          </button>
        </div>

        <div className="w-1/2">
          {/* Upload document */}
          <label className="block text-xs font-medium mb-2">
            Estimate Document (pdf)
          </label>
          <div className="mb-4">
            <div className="space-y-2">
              <label
                className={`w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded px-[10px] ${
                  isValidatingDocument
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleEstimateDocumentUpload}
                  className="hidden"
                  disabled={isValidatingDocument}
                />
                <span className="text-grayFont text-sm">
                  {isValidatingDocument ? "Validating..." : "Add Document"}
                </span>
                {isValidatingDocument ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primaryBlue"></div>
                ) : (
                  <Image
                    src="/images/upload-icon.svg"
                    alt="Upload"
                    width={20}
                    height={20}
                  />
                )}
              </label>
              {isValidatingDocument && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  <span>Validating document...</span>
                </div>
              )}
            </div>

            {estimateDocument && (
              <div className="relative bg-inputBg w-[60px] h-[50px] flex items-center justify-center border border-[#EEEEEE] mt-2">
                {estimateDocument ? (
                  typeof estimateDocument === "string" ? (
                    estimateDocument.endsWith(".pdf") ? (
                      <a
                        href={estimateDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src="/images/pdf-icon.svg"
                          alt="Estimate Upload"
                          width={30}
                          height={50}
                          className="h-[100%]"
                        />
                      </a>
                    ) : (
                      <Image
                        src={estimateDocument}
                        alt="Estimate Document"
                        width={30}
                        height={50}
                        className="rounded border h-[100%]"
                      />
                    )
                  ) : estimateDocument.type === "application/pdf" ? (
                    <Image
                      src="/images/pdf-icon.svg"
                      alt="Estimate Upload"
                      width={30}
                      height={50}
                      className="h-[100%]"
                    />
                  ) : (
                    <Image
                      src={URL.createObjectURL(estimateDocument)}
                      alt="Estimate Document"
                      width={30}
                      height={50}
                      className="rounded border h-[100%]"
                    />
                  )
                ) : (
                  <></>
                )}
                <button
                  type="button"
                  className="absolute top-[-4px] right-[-4px] bg-crossBg rounded-full p-[1px]"
                  onClick={handleRemoveEstimateDocument}
                >
                  <Image
                    src="/images/x-close.svg"
                    alt="Remove"
                    width={12}
                    height={12}
                  />
                </button>
              </div>
            )}

            {estimateDocumentError && (
              <div className="mt-2">
                <ErrorAlert
                  message={estimateDocumentError}
                  onClose={() => setEstimateDocumentError(null)}
                />
              </div>
            )}
            {documentValidationMessage && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2 h-2 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-green-800 font-medium">
                    {documentValidationMessage}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Upload damage images */}
          <label className="block text-xs font-medium mb-2">
            Damage Mobile Photo (Upload at least 5 images)
          </label>
          <div className="mb-4">
            {showImeiImageUpload == false && (
              <label className="w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded cursor-pointer px-[10px]">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleDamagePhotoUpload}
                  className="hidden"
                  disabled={damagePhotos.length >= MAX_DAMAGE_IMAGES}
                />
                <span className="text-grayFont text-sm">Add Photo</span>
                <Image
                  src="/images/upload-icon.svg"
                  alt="Upload"
                  width={20}
                  height={20}
                />
              </label>
            )}

            {showImeiImageUpload == true && (
              <div className="space-y-2">
                <label className="w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded cursor-pointer px-[10px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImeiDamagePhotoUpload}
                    className="hidden"
                    disabled={damagePhotos.length >= 1}
                  />
                  <span className="text-grayFont text-sm">Add Photo</span>
                  <Image
                    src="/images/upload-icon.svg"
                    alt="Upload"
                    width={20}
                    height={20}
                  />
                </label>
                {isValidatingDamageImei && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span>Validating Image...</span>
                  </div>
                )}
              </div>
            )}

            {damagePhotos && (
              <div className="flex justify-start align-center w-4/5 flex flex-wrap gap-2">
                <GalleryPopup
                  images={estimateDetailsState?.damagePhotos}
                  onRemoveImage={handleRemoveDamagePhoto}
                  allowRemoval={true}
                />
              </div>
            )}

            {imeiDamageImageError && (
              <div className="mt-2">
                <ErrorAlert
                  message={imeiDamageImageError}
                  onClose={() => setImeiDamageImageError(null)}
                />
              </div>
            )}

            {damageImeiValidationMessage && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2 h-2 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-green-800 font-medium">
                    {damageImeiValidationMessage}
                  </span>
                </div>
              </div>
            )}

            {damagePhotosError && (
              <ErrorAlert
                message={damagePhotosError}
                onClose={() => setDamagePhotosError(null)}
              />
            )}
          </div>
        </div>
      </div>

      {showReplacementConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center p-[40px]">
            <h2 className="text-center text-xl font-semibold text-[#181D27]">
              Are you sure?
            </h2>
            {pendingReplacementValue == true ? (
              <p className="text-center text-base text-[#414651] font-medium my-4">
                Motherboard/Phone is getting replaced.
              </p>
            ) : (
              <p className="text-center text-base text-[#414651] font-medium my-4">
                Motherboard/Phone is not getting replace.
              </p>
            )}
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="w-1/2 border border-gray-300 px-4 py-2 rounded-md text-[#414651] hover:bg-gray-100 transition-all duration-200 h-[50px]"
                onClick={cancelReplacementSelection}
              >
                Cancel
              </button>

              <button
                className="w-1/2 h-[50px] px-4 py-2 rounded-md bg-primaryBlue text-white hover:bg-lightPrimaryBlue"
                onClick={confirmReplacementSelection}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <>
      <EstimateTabViewComponent {...estimateDetailsState} />
    </>
  );
};

export default EstimateDetailsTab;
