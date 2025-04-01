"use client";

import { CustomerDocumentsTabProps } from "@/interfaces/ClaimInterface";

import { useEffect, useState } from "react";
import ImageUpload from "@/components/ui/ImageUpload";
import { useNotification } from "@/context/NotificationProvider";
import { useGlobalStore } from "@/store/store";
import { uploadCustomerDocuments } from "@/services/claimService";
import GalleryPopup from "@/components/ui/GalleryPopup";

const CustomerDocumentsTab: React.FC<CustomerDocumentsTabProps> = ({
  documents,
}) => {
  const { notifySuccess, notifyError } = useNotification();
  const {
    isLoading,
    setIsLoading,
    selectedClaim,
    triggerClaimRefresh,
    claimStatus,
  } = useGlobalStore();

  // State for document selection
  const [aadharFrontSideImage, setAadharFrontSideImage] = useState<File[]>([]);
  const [aadharBackSideImage, setAadharBackSideImage] = useState<File[]>([]);
  const [bankDetailImage, setBankDetailImage] = useState<File[]>([]);
  const [panCardImage, setPanCardImage] = useState<File[]>([]);
  const [accessoriesProvided, setAccessoriesProvided] = useState<string | null>(
    documents?.accessoriesProvided ?? null
  );
  const [reupload, setReupload] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    setReupload(false);
  }, [selectedClaim]);

  // Utility function to get document status
  const getDocumentStatus = (
    status?: number | string | null,
    url?: string | null
  ) => {
    return status == 1 && url
      ? "valid"
      : status == 0 && url
      ? "invalid"
      : "pending";
  };

  // Utility function to check if a document is valid
  const isValidDocument = (
    status?: number | string | null,
    url?: string | null
  ) => status == 1 && !!url;

  // Utility function to get invalid reason
  const getInvalidReason = (reason?: string | null) => reason || "";

  // Extract document URLs
  const { aadharDocuments, bankDetails, panCard } = documents || {};
  const aadharFrontImageUrl = aadharDocuments?.documents?.[0];
  const aadharBackImageUrl = aadharDocuments?.documents?.[1];
  const bankDetailImageUrl = bankDetails?.url;
  const pancardImageUrl = panCard?.url;

  // Validate Documents
  const isValidAadharFrontImage = isValidDocument(
    aadharDocuments?.[76]?.status,
    aadharFrontImageUrl
  );
  const isValidAadharBackImage = isValidDocument(
    aadharDocuments?.[76]?.status,
    aadharBackImageUrl
  );
  const isValidBankDetail = isValidDocument(
    bankDetails?.status,
    bankDetailImageUrl
  );

  // Get Invalid Reasons
  const invalidAadharFrontImageReason = getInvalidReason(
    aadharDocuments?.[76]?.status_reason
  );
  const invalidAadharBackImageReason = getInvalidReason(
    aadharDocuments?.[76]?.status_reason
  );
  const invalidBankDetailReason = getInvalidReason(bankDetails?.status_reason);
  const invalidPancardReason = getInvalidReason(panCard?.status_reason);

  // Get Document Status
  const aadharFrontImageStatus = getDocumentStatus(
    aadharDocuments?.[76]?.status,
    aadharFrontImageUrl
  );
  const aadharBackImageStatus = getDocumentStatus(
    aadharDocuments?.[76]?.status,
    aadharBackImageUrl
  );
  const bankDetailsStatus = getDocumentStatus(
    bankDetails?.status,
    bankDetailImageUrl
  );
  const panCardStatus = getDocumentStatus(panCard?.status, pancardImageUrl);

  // Show Reupload Button Condition
  const showReuploadButton =
    aadharDocuments?.[76]?.status_reason ||
    bankDetails?.status_reason ||
    (panCard?.status_reason && pancardImageUrl) ||
    aadharFrontImageStatus == "invalid" ||
    aadharBackImageStatus == "invalid" ||
    bankDetailsStatus == "invalid";

  const appendFiles = (
    files: File[],
    documentTypeId: number | string,
    formData: FormData,
    subTypes?: string[]
  ) => {
    files.forEach((file, index) => {
      if (subTypes) {
        // ✅ Properly index front & back with `index`
        formData.append(
          `documents[${documentTypeId}][${index}][document_type_id]`,
          `${documentTypeId}_${subTypes[index]}`
        );
        formData.append(`documents[${documentTypeId}][${index}][file]`, file);
      } else {
        // ✅ Single document case
        formData.append(
          `documents[${documentTypeId}][document_type_id]`,
          documentTypeId.toString()
        );
        formData.append(`documents[${documentTypeId}][file]`, file);
      }
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      // ✅ Ensure claim_id is valid
      if (selectedClaim?.id) {
        formData.append("claim_id", String(selectedClaim.id));
      }

      // ✅ Append Aadhar Front & Back with correct indices
      const aadharImages: File[] = [];
      const aadharSubTypes: string[] = [];

      if (aadharFrontSideImage.length > 0) {
        aadharImages.push(aadharFrontSideImage[0]);
        aadharSubTypes.push("front");
      }

      if (aadharBackSideImage.length > 0) {
        aadharImages.push(aadharBackSideImage[0]);
        aadharSubTypes.push("back");
      }

      if (aadharImages.length > 0) {
        appendFiles(aadharImages, 76, formData, aadharSubTypes);
      }

      // ✅ Append Bank Details
      if (bankDetailImage) {
        appendFiles(bankDetailImage, 77, formData);
      }

      // ✅ Append PAN Card if available
      if (panCardImage.length > 0) {
        appendFiles(panCardImage, 78, formData);
      }

      // ✅ Append Accessories Provided
      formData.append("accessory_provided", accessoriesProvided || "no");

      const response = await uploadCustomerDocuments(
        Number(selectedClaim?.id),
        formData
      );

      if (response.success) {
        notifySuccess("Documents uploaded successfully!");
        triggerClaimRefresh();
      } else {
        notifyError("Failed to upload documents.");
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      notifyError("An error occurred while uploading documents.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (documents?.accessoriesProvided !== undefined) {
      setAccessoriesProvided(documents.accessoriesProvided);
    }
  }, [documents?.accessoriesProvided]);

  useEffect(() => {
    setAccessoriesProvided(documents?.accessoriesProvided ?? null);
  }, [documents?.accessoriesProvided]);

  const handleAccessoriesClick = (value: string) => {
    setAccessoriesProvided(value);
  };

  const isFormEditable = true;

  useEffect(() => {
    const allMandatoryValid =
      aadharFrontImageStatus === "valid" &&
      aadharBackImageStatus === "valid" &&
      bankDetailsStatus === "valid";

    const allMandatoryUploaded =
      (aadharFrontSideImage?.length > 0 ||
        aadharFrontImageStatus === "valid") &&
      (aadharBackSideImage?.length > 0 || aadharBackImageStatus === "valid") &&
      (bankDetailImage?.length > 0 || bankDetailsStatus === "valid");

    const validatePanCard =
      panCardImage?.length > 0 && panCardStatus === "invalid";

    setIsSubmitDisabled(
      (allMandatoryUploaded &&
        !allMandatoryValid &&
        accessoriesProvided !== null) ||
        validatePanCard
    );
  }, [
    aadharFrontSideImage,
    aadharBackSideImage,
    bankDetailImage,
    accessoriesProvided,
    aadharFrontImageStatus,
    aadharBackImageStatus,
    bankDetailsStatus,
    reupload,
    panCardStatus,
    panCardImage,
    triggerClaimRefresh,
  ]);

  const showButtonSection =
    aadharFrontImageStatus != "valid" ||
    aadharBackImageStatus != "valid" ||
    bankDetailsStatus != "valid";

  const handleAadharFrontImageUpload = (files: File[]) => {
    if (files.length > 0) {
      setAadharFrontSideImage([files[files.length - 1]]);
    } else {
      setAadharFrontSideImage([]);
    }
  };

  const handleAadharBackImageUpload = (files: File[]) => {
    if (files.length > 0) {
      setAadharBackSideImage([files[files.length - 1]]);
    } else {
      setAadharBackSideImage([]);
    }
  };

  const handleBankDetailImageUpload = (files: File[]) => {
    if (files.length > 0) {
      setBankDetailImage([files[files.length - 1]]);
    } else {
      setBankDetailImage([]);
    }
  };

  const handlePanCardUpload = (files: File[]) => {
    if (files.length > 0) {
      setPanCardImage([files[files.length - 1]]);
    } else {
      setPanCardImage([]);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Upload Customer Documents</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Aadhar Front & Back */}
        <div className="col-span-2">
          <h3 className="text-sm font-medium mb-2 text-primaryDark">
            Aadhar (Front and Back) <span className="text-red-500">*</span>
          </h3>
          <div className="flex gap-4">
            <div className="w-1/2">
              {isFormEditable &&
              reupload &&
              aadharFrontImageStatus != "valid" &&
              aadharFrontImageStatus != "pending" ? (
                <ImageUpload
                  label="(Front side)"
                  images={aadharFrontSideImage}
                  setImages={handleAadharFrontImageUpload}
                />
              ) : aadharFrontImageUrl ? (
                <div>
                  <label className="text-xs">(Front side)</label>
                  {aadharFrontImageUrl && (
                    <GalleryPopup images={[String(aadharFrontImageUrl)]} />
                  )}

                  {invalidAadharFrontImageReason ? (
                    <span className=" p-2 text-[#EB5757] text-xxs font-semibold">
                      Invalid Receipt : {invalidAadharFrontImageReason}
                    </span>
                  ) : aadharFrontImageStatus === "pending" ? (
                    <span className=" p-2 text-[#FF9548] text-xxs font-semibold">
                      Uploaded (Under Review)
                    </span>
                  ) : isValidAadharFrontImage ? (
                    <span className="p-2 text-[#19AD61] text-xxs font-semibold">
                      Valid
                    </span>
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
                <ImageUpload
                  label="(Front side)"
                  images={aadharFrontSideImage}
                  setImages={handleAadharFrontImageUpload}
                />
              )}
            </div>

            <div className="w-1/2">
              {isFormEditable &&
              reupload &&
              aadharBackImageStatus != "valid" &&
              aadharBackImageStatus != "pending" ? (
                <ImageUpload
                  label="(Back side)"
                  images={aadharBackSideImage}
                  setImages={handleAadharBackImageUpload}
                />
              ) : aadharBackImageUrl ? (
                <div>
                  <label className="text-xs">(Back side)</label>
                  {aadharBackImageUrl && (
                    <GalleryPopup images={[String(aadharBackImageUrl)]} />
                  )}

                  {invalidAadharBackImageReason ? (
                    <span className=" p-2 text-[#EB5757] text-xxs font-semibold">
                      Invalid Receipt : {invalidAadharBackImageReason}
                    </span>
                  ) : aadharBackImageStatus === "pending" ? (
                    <span className=" p-2 text-[#FF9548] text-xxs font-semibold">
                      Uploaded (Under Review)
                    </span>
                  ) : isValidAadharBackImage ? (
                    <span className="p-2 text-[#19AD61] text-xxs font-semibold">
                      Valid
                    </span>
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
                <ImageUpload
                  label="(Back side)"
                  images={aadharBackSideImage}
                  setImages={handleAadharBackImageUpload}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="col-span-1">
          <h3 className="text-sm font-medium mb-2 text-primaryDark">
            Bank Details <span className="text-red-500">*</span>
          </h3>

          {isFormEditable &&
          reupload &&
          bankDetailsStatus != "valid" &&
          bankDetailsStatus != "pending" ? (
            <ImageUpload
              label="(Cancelled Cheque/Passbook)"
              images={bankDetailImage}
              setImages={handleBankDetailImageUpload}
            />
          ) : bankDetailImageUrl ? (
            <div>
              <label className="text-xs">(Cancelled Cheque/Passbook)</label>
              {bankDetailImageUrl && (
                <GalleryPopup images={[String(bankDetailImageUrl)]} />
              )}

              {invalidBankDetailReason ? (
                <span className=" p-2 text-[#EB5757] text-xxs font-semibold">
                  Invalid Receipt : {invalidBankDetailReason}
                </span>
              ) : bankDetailsStatus === "pending" ? (
                <span className=" p-2 text-[#FF9548] text-xxs font-semibold">
                  Uploaded (Under Review)
                </span>
              ) : isValidBankDetail ? (
                <span className="p-2 text-[#19AD61] text-xxs font-semibold">
                  Valid
                </span>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <ImageUpload
              label="(Cancelled Cheque/Passbook)"
              images={bankDetailImage}
              setImages={handleBankDetailImageUpload}
            />
          )}
        </div>

        {/* PAN Card (Optional) */}
        <div className="col-span-1">
          {isFormEditable &&
          reupload &&
          panCardStatus != "valid" &&
          panCardStatus != "pending" ? (
            <ImageUpload
              label="Pan Card (Optional)"
              images={panCardImage}
              setImages={handlePanCardUpload}
            />
          ) : pancardImageUrl ? (
            <div>
              <label className="text-xs">Pan Card (Optional)</label>
              {pancardImageUrl && (
                <GalleryPopup images={[String(pancardImageUrl)]} />
              )}

              {invalidPancardReason ? (
                <span className=" p-2 text-[#EB5757] text-xxs font-semibold">
                  Invalid Receipt : {invalidPancardReason}
                </span>
              ) : panCardStatus === "pending" ? (
                <span className=" p-2 text-[#FF9548] text-xxs font-semibold">
                  Uploaded (Under Review)
                </span>
              ) : panCardStatus === "valid" ? (
                <span className="p-2 text-[#19AD61] text-xxs font-semibold">
                  Valid
                </span>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <ImageUpload
              label="Pan Card (Optional)"
              images={panCardImage}
              setImages={handlePanCardUpload}
            />
          )}
        </div>
      </div>

      {/* Accessories Provided */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2 text-primaryDark">
          Accessories Provided:
        </h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="accessoriesProvided"
              value="yes"
              className="radio checked:bg-primaryBlue w-[20px] h-[20px]"
              checked={accessoriesProvided === "yes"}
              onChange={() => handleAccessoriesClick("yes")}
            />
            <span>Yes</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="accessoriesProvided"
              value="no"
              className="radio checked:bg-primaryBlue w-[20px] h-[20px]"
              checked={accessoriesProvided === "no"}
              onChange={() => handleAccessoriesClick("no")}
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      {showButtonSection && (
        <>
          {claimStatus === "BER SETTLE" && showReuploadButton && !reupload ? (
            <button
              className={`btn mt-6 px-6 py-2 rounded-md bg-primaryBlue text-white hover:bg-blue-700`}
              onClick={() => {
                setReupload(true);
              }}
            >
              Upload Again
            </button>
          ) : (
            <button
              className={`btn mt-6 px-6 py-2 rounded-md ${
                !isSubmitDisabled
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-primaryBlue text-white hover:bg-blue-700"
              }`}
              disabled={!isSubmitDisabled || isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Uploading..." : "Submit Documents"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerDocumentsTab;
