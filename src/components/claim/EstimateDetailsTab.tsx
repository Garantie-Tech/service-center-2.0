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

interface EstimateDetailsTabProps {
  onSubmit: (formData: FormData) => void;
}

const EstimateDetailsTab: React.FC<EstimateDetailsTabProps> = ({
  onSubmit,
}) => {
  const MAX_DAMAGE_IMAGES = 11;
  const [damagePhotosError, setDamagePhotosError] = useState<string | null>(
    null
  );

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
    string | null
  >(null);
  const [isReplacementConfirmed, setIsReplacementConfirmed] = useState(false);

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
      setEstimateDetailsState({
        estimateAmount: selectedClaim?.claimed_amount || "",
        jobSheetNumber: selectedClaim?.job_sheet_number || "",
        estimateDetails: selectedClaim?.data?.inputs?.estimate_details || "",
        replacementConfirmed: "",
        damagePhotos:
          selectedClaim?.mobile_damage_photos && !claimRevised
            ? selectedClaim?.mobile_damage_photos
            : [],
        estimateDocument:
          selectedClaim?.documents?.["15"]?.url && !claimRevised
            ? selectedClaim?.documents?.["15"]?.url
            : null,
      });
      setIsReplacementConfirmed(false);
    }
  }, [selectedClaim, setEstimateDetailsState]);

  // ✅ Handle Replacement Confirmation
  const handleReplacementSelection = (value: string) => {
    setPendingReplacementValue(value);
    setShowReplacementConfirmation(true);
  };

  const confirmReplacementSelection = () => {
    if (pendingReplacementValue) {
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

  const handleDamagePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);

      if (damagePhotos.length + newFiles.length > MAX_DAMAGE_IMAGES) {
        setDamagePhotosError(
          `You can upload up to ${MAX_DAMAGE_IMAGES} images.`
        );
        return;
      }

      setEstimateDetailsState({
        damagePhotos: [...damagePhotos, ...newFiles],
      });
      setDamagePhotosError(null);
    }
  };

  const handleEstimateDocumentUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setEstimateDetailsState({ estimateDocument: event.target.files[0] });
    }
  };

  const handleRemoveDamagePhoto = (index: number) => {
    const updatedPhotos = damagePhotos.filter((_, i) => i !== index);
    setEstimateDetailsState({ damagePhotos: updatedPhotos });
  };

  const handleRemoveEstimateDocument = () => {
    setEstimateDetailsState({ estimateDocument: null });
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

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("claimed_amount", estimateAmount);
    formData.append("estimate_details", estimateDetails);
    formData.append("job_sheet_number", jobSheetNumber);
    formData.append("replacement_confirmed", replacementConfirmed || "No");

    if (estimateDocument) {
      formData.append("estimate_document", estimateDocument);
    }

    damagePhotos.forEach((photo, index) => {
      if (typeof photo === "string") {
        formData.append(`mobile_damage_photos_urls[${index}]`, photo);
      } else {
        formData.append(`mobile_damage_photos[${index}]`, photo);
      }
    });

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
    setEstimateDetailsState({ ...estimateDetailsState, damagePhotos: [] });
    setEstimateDetailsState({ estimateDocument: null });
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
            placeholder="Ex: ₹ 9000"
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
                  replacementConfirmed === "yes"
                    ? "bg-checkboxCheckedBg"
                    : "bg-inputBg"
                }`}
                onClick={() => handleReplacementSelection("yes")}
                disabled={isFormDisabled}
              >
                {replacementConfirmed === "yes" && (
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
                  replacementConfirmed === "no"
                    ? "bg-checkboxCheckedBg"
                    : "bg-inputBg"
                }`}
                onClick={() => handleReplacementSelection("no")}
                disabled={isFormDisabled}
              >
                {replacementConfirmed === "no" && (
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
            {!isFormDisabled && (
              <label className="w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded cursor-pointer px-[10px]">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleEstimateDocumentUpload}
                  className="hidden"
                />
                <span className="text-grayFont text-sm">Add Document</span>
                <Image
                  src="/images/upload-icon.svg"
                  alt="Upload"
                  width={20}
                  height={20}
                />
              </label>
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
                {!isFormDisabled && (
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

            {isInvalidDocument ? (
              <span className="text-[#EB5757] text-xxs font-semibold">
                Invalid Document : {invalidDocumentReason}
              </span>
            ) : (claimStatus === "Claim Submitted" ||
                claimStatus === "Estimate Revised") &&
              isFormDisabled ? (
              <span className="text-[#FF9548] text-xxs font-semibold">
                Under Review
              </span>
            ) : claimStatus === "Documents Verified" ? (
              <span className="text-[#19AD61] text-xxs font-semibold">
                Valid
              </span>
            ) : (
              <></>
            )}
          </div>

          {/* Upload damage images */}
          <label className="block text-xs font-medium mb-2">
            Damage Mobile Photo (Upload at least 5 images)
          </label>
          <div className="mb-4">
            {!isFormDisabled && (
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

            {damagePhotos && (
              <div className="flex justify-start align-center w-4/5 flex flex-wrap gap-2">
                <GalleryPopup
                  images={estimateDetailsState?.damagePhotos}
                  onRemoveImage={handleRemoveDamagePhoto}
                  allowRemoval={!isFormDisabled}
                />
              </div>
            )}

            {damagePhotosError && (
              <ErrorAlert
                message={damagePhotosError}
                onClose={() => setDamagePhotosError(null)}
              />
            )}

            {isInvalidImages ? (
              <span className="text-[#EB5757] text-xxs font-semibold">
                Invalid Images : {invalidImagesReason}
              </span>
            ) : (claimStatus === "Claim Submitted" ||
                claimStatus === "Estimate Revised") &&
              isFormDisabled ? (
              <span className="text-[#FF9548] text-xxs font-semibold">
                Under Review
              </span>
            ) : claimStatus === "Documents Verified" ? (
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
            {pendingReplacementValue == "yes" ? (
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
            placeholder="Ex: ₹ 9000"
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
                  replacementConfirmed === "yes"
                    ? "bg-checkboxCheckedBg"
                    : "bg-inputBg"
                }`}
                onClick={() => handleReplacementSelection("yes")}
                disabled={isFormDisabled}
              >
                {replacementConfirmed === "yes" && (
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
                  replacementConfirmed === "no"
                    ? "bg-checkboxCheckedBg"
                    : "bg-inputBg"
                }`}
                onClick={() => handleReplacementSelection("no")}
                disabled={isFormDisabled}
              >
                {replacementConfirmed === "no" && (
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
            <label className="w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded cursor-pointer px-[10px]">
              <input
                type="file"
                accept=".pdf"
                onChange={handleEstimateDocumentUpload}
                className="hidden"
              />
              <span className="text-grayFont text-sm">Add Document</span>
              <Image
                src="/images/upload-icon.svg"
                alt="Upload"
                width={20}
                height={20}
              />
            </label>

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
          </div>

          {/* Upload damage images */}
          <label className="block text-xs font-medium mb-2">
            Damage Mobile Photo (Upload at least 5 images)
          </label>
          <div className="mb-4">
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

            {damagePhotos && (
              <div className="flex justify-start align-center w-4/5 flex flex-wrap gap-2">
                <GalleryPopup
                  images={estimateDetailsState?.damagePhotos}
                  onRemoveImage={handleRemoveDamagePhoto}
                  allowRemoval={true}
                />
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
            {pendingReplacementValue == "yes" ? (
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
