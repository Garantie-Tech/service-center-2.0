"use client";

import Image from "next/image";
import { useGlobalStore } from "@/store/store";
import {
  getEstimateButtonLabel,
  isEstimateEditable,
} from "@/helpers/globalHelper";
import EstimateTabViewComponent from "@/components/claim/view/EstimateTabView";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { useState } from "react";

interface EstimateDetailsTabProps {
  onSubmit: (formData: FormData) => void;
}

const EstimateDetailsTab: React.FC<EstimateDetailsTabProps> = ({
  onSubmit,
}) => {
  const {
    selectedClaim,
    estimateDetailsState,
    setEstimateDetailsState,
    claimStatus,
    setClaimStatus,
  } = useGlobalStore();
  const [showError, setShowError] = useState(true);

  const isFormDisabled = false;
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
      setEstimateDetailsState({
        damagePhotos: [
          ...estimateDetailsState.damagePhotos,
          ...Array.from(event.target.files),
        ],
      });
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
    !jobSheetNumber ||
    !estimateDetails ||
    !replacementConfirmed ||
    !estimateDocument ||
    damagePhotos.length < 5;

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

    onSubmit(formData);
    setClaimStatus("Claim Submitted");
  };

  return isFormEditable ? (
    <div>
      <h2 className="text-lg font-semibold mb-4">Estimate Form</h2>
      {isInvalidDocument && showError == true && (
        <ErrorAlert
          message={invalidDocumentReason}
          onClose={() => setShowError(false)}
        />
      )}

      {isInvalidImages && showError == true && (
        <ErrorAlert
          message={invalidImagesReason}
          onClose={() => setShowError(false)}
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
            placeholder="₹ 9000"
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
            placeholder="JDHSJKF3248204"
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
                onClick={() => handleInputChange("replacementConfirmed", "yes")}
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
                onClick={() => handleInputChange("replacementConfirmed", "no")}
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
          </div>

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
        </div>
        <div className="w-1/2">
          {/* Upload document */}
          <label className="block text-xs font-medium mb-2">
            Estimate Document (jpeg, png, pdf)
          </label>
          <div className="mb-4">
            {estimateDocument && (
              <div className="relative bg-inputBg w-[60px] h-[50px] flex items-center justify-center border border-[#EEEEEE]">
                {estimateDocument ? (
                  typeof estimateDocument === "string" ? (
                    estimateDocument.endsWith(".pdf") ? (
                      <Image
                        src="/images/pdf-icon.svg"
                        alt="Estimate Upload"
                        width={30}
                        height={50}
                        className="h-[100%]"
                      />
                    ) : (
                      <Image
                        src={estimateDocument} // Direct URL from API
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
                      src={URL.createObjectURL(estimateDocument)} // Convert File to preview
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
            {!estimateDocument && (
              <label className="w-[185px] h-[45px] flex items-center justify-between bg-inputBg border rounded cursor-pointer px-[10px]">
                <input
                  type="file"
                  accept=".jpeg, .png, .pdf"
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
            {isInvalidDocument ? (
              <span className="text-[#EB5757] text-xxs font-semibold">
                Invalid Document : {invalidDocumentReason}
              </span>
            ) : claimStatus === "Claim Submitted" ||
              claimStatus === "Estimate Revised" ? (
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
            <div className="flex justify-start align-center gap-2">
              {damagePhotos.map((photo, index) => (
                <div
                  key={index}
                  className="relative bg-inputBg w-[60px] h-[50px] mt-2 flex items-center justify-center border border-[#EEEEEE]"
                >
                  <Image
                    src={
                      typeof photo === "string"
                        ? photo
                        : URL.createObjectURL(photo)
                    }
                    alt="Damage Image"
                    width={50}
                    height={40}
                    className="rounded h-[100%]"
                  />
                  {!isFormDisabled && (
                    <button
                      type="button"
                      className="absolute top-[-4px] right-[-4px] bg-crossBg rounded-full p-[1px]"
                      onClick={() => handleRemoveDamagePhoto(index)}
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
              ))}
            </div>
            {isInvalidImages ? (
              <span className="text-[#EB5757] text-xxs font-semibold">
                Invalid Images : {invalidImagesReason}
              </span>
            ) : claimStatus === "Claim Submitted" ||
              claimStatus === "Estimate Revised" ? (
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
    </div>
  ) : (
    <>
      <EstimateTabViewComponent {...estimateDetailsState} />
    </>
  );
};

export default EstimateDetailsTab;
