"use client";

import Image from "next/image";
import { useGlobalStore } from "@/store/store";

interface EstimateDetailsTabProps {
  onSubmit: (formData: FormData) => void;
}

const EstimateDetailsTab: React.FC<EstimateDetailsTabProps> = ({
  onSubmit,
}) => {
  const { estimateDetailsState, setEstimateDetailsState } = useGlobalStore();

  const {
    estimateAmount,
    jobSheetNumber,
    estimateDetails,
    replacementConfirmed,
    damagePhotos,
    estimateDocument,
  } = estimateDetailsState;

  const handleInputChange = (
    key: keyof typeof estimateDetailsState,
    value: any
  ) => {
    setEstimateDetailsState({ [key]: value });
  };

  const handleDamagePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      setEstimateDetailsState({
        damagePhotos: [...damagePhotos, ...Array.from(event.target.files)],
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
      formData.append(`mobile_damage_photos[${index}]`, photo);
    });

    onSubmit(formData);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Estimate Form</h2>
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
            className={`btn w-1/2 ${
              isSubmitDisabled
                ? "bg-btnDisabledBg text-btnDisabledText"
                : "bg-primaryBlue text-white"
            }`}
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            Submit Estimate
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
                {estimateDocument.type === "application/pdf" ? (
                  <Image
                    src="/images/pdf-icon.svg"
                    alt="Estimate Upload"
                    width={30}
                    height={50}
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(estimateDocument)}
                    alt="Estimate Document"
                    className="w-20 h-20 rounded border"
                  />
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
              />
              <span className="text-grayFont text-sm">Add Photo</span>
              <Image
                src="/images/upload-icon.svg"
                alt="Upload"
                width={20}
                height={20}
              />
            </label>
            <div className="flex justify-start align-center gap-2">
              {damagePhotos.map((photo, index) => (
                <div
                  key={index}
                  className="relative bg-inputBg w-[60px] h-[50px] mt-2 flex items-center justify-center border border-[#EEEEEE]"
                >
                  <Image
                    src={URL.createObjectURL(photo)}
                    alt="Damage Image"
                    width={50}
                    height={40}
                  />
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateDetailsTab;
