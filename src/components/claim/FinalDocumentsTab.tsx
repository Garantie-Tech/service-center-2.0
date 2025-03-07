import ImageUpload from "@/components/ui/ImageUpload";
import PdfUpload from "@/components/ui/PdfUpload";
import { useNotification } from "@/context/NotificationProvider";
import { uploadFinalDocuments } from "@/services/claimService";
import { useGlobalStore } from "@/store/store";
import { useEffect, useState } from "react";
import FinalDocumentsView from "@/components/claim/view/FinalDocumentsView";
import ErrorAlert from "@/components/ui/ErrorAlert";
import Image from "next/image";
import GalleryPopup from "@/components/ui/GalleryPopup";
import { getDocumentInfo } from "@/helpers/globalHelper";

const FinalDocumentsTab: React.FC = () => {
  const [repairInvoice, setRepairInvoice] = useState<File[]>([]);
  const [replacementReceipt, setReplacementReceipt] = useState<File[]>([]);
  const [repairedMobilePhotos, setRepairedMobilePhotos] = useState<File[]>([]);
  const { selectedClaim, setIsLoading, triggerClaimRefresh } = useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();
  const [showRepairInvoiceError, setShowRepairInvoiceError] = useState(true);
  const [showRepairMobilePhotoError, setShowRepairMobilePhotoError] =
    useState(true);
  const [showReplacementReceiptError, setShowReplacementReceiptError] =
    useState(true);

  const [reupload, setReupload] = useState(false);

  useEffect(() => {
    setReupload(false);
  }, [selectedClaim]);

  const handleSubmit = async () => {
    const formData = new FormData();

    try {
      if (
        (!repairInvoice || repairInvoice.length === 0) &&
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
        (!replacementReceipt || replacementReceipt.length === 0) &&
        !selectedClaim?.documents?.["75"]?.url
      ) {
        notifyError("Please Upload Replacement Receipt");
        return;
      }
      setIsLoading(true);

      // Helper function to append files in required format
      const appendFiles = (files: File[], documentTypeId: number) => {
        files.forEach((file) => {
          formData.append(`${documentTypeId}[delete_existing_document]`, "1");
          formData.append(`${documentTypeId}[document]`, file);
          formData.append(
            `${documentTypeId}[document_type_id]`,
            documentTypeId.toString()
          );
        });
      };

      if (repairInvoice) {
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
  };

  return isEditable ? (
    <div>
      <h2 className="text-lg font-semibold mb-4">Final Invoice Documents</h2>

      {isInvalidRepairInvoice && showRepairInvoiceError && (
        <ErrorAlert
          message={isInvalidRepairInvoiceReason}
          onClose={() => setShowRepairInvoiceError(false)}
        />
      )}

      {isInvalidRepairMobilePhoto && showRepairMobilePhotoError && (
        <ErrorAlert
          message={isInvalidRepairMobilePhotoReason}
          onClose={() => setShowRepairMobilePhotoError(false)}
        />
      )}

      {isInvalidReplacementReceipt &&
        isImeiChanged &&
        showReplacementReceiptError && (
          <ErrorAlert
            message={isInvalidReplacementReceiptReason}
            onClose={() => setShowReplacementReceiptError(false)}
          />
        )}

      <div className="flex gap-8">
        {/* Repair Invoice PDF */}
        <div className="w-1/2">
          {(!isValidRepairInvoice && reupload) ||
          !finalDocuments?.repairInvoiceImage ? (
            <PdfUpload
              label="Repair Invoice(Please add Invoice document)"
              pdfs={repairInvoice}
              setPdfs={setRepairInvoice}
            />
          ) : finalDocuments.repairInvoiceImage.endsWith(".pdf") ? (
            <>
              <h3 className="text-sm font-medium mb-2">Repair Invoice</h3>
              <div className="relative bg-inputBg w-[60px] h-[60px] flex items-center justify-center border border-[#EEEEEE]">
                <a
                  href={finalDocuments.repairInvoiceImage}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/images/pdf-icon.svg"
                    alt="Repair Invoice PDF"
                    width={30}
                    height={50}
                  />
                </a>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-medium mb-2">Repair Invoice</h3>
              <GalleryPopup images={[finalDocuments.repairInvoiceImage]} />
            </>
          )}

          {isInvalidRepairInvoice ? (
            <span className=" p-2 text-[#EB5757] text-xxs font-semibold">
              Invalid Invoice : {isInvalidRepairInvoiceReason}
            </span>
          ) : !isInvalidRepairInvoiceStatus &&
            finalDocuments?.repairInvoiceImage ? (
            <span className=" p-2 text-[#FF9548] text-xxs font-semibold">
              Uploaded (Under Review)
            </span>
          ) : finalDocuments?.repairInvoiceImage ? (
            <span className=" p-2 text-[#19AD61] text-xxs font-semibold">
              Valid
            </span>
          ) : (
            <></>
          )}
        </div>

        {/* Repaired Mobile Photos */}
        <div className="w-1/2">
          {(!isValidRepairMobilePhoto && reupload) ||
          !finalDocuments?.repairMobilePhoto ? (
            <ImageUpload
              label="Repaired Mobile( Add repaired mobile photo)"
              images={repairedMobilePhotos}
              setImages={setRepairedMobilePhotos}
              multiple
            />
          ) : finalDocuments.repairMobilePhoto.endsWith(".pdf") ? (
            <>
              <h3 className="text-sm font-medium mb-2">Repaired Mobile</h3>
              <div className="relative bg-inputBg w-[60px] h-[60px] flex items-center justify-center border border-[#EEEEEE]">
                <a
                  href={finalDocuments.repairMobilePhoto}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/images/pdf-icon.svg"
                    alt="Repair Invoice PDF"
                    width={30}
                    height={50}
                  />
                </a>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-medium mb-2">Repaired Mobile</h3>
              <GalleryPopup images={[finalDocuments.repairMobilePhoto]} />
            </>
          )}

          {isInvalidRepairMobilePhoto ? (
            <span className=" p-2 text-[#EB5757] text-xxs font-semibold">
              Invalid Photo : {isInvalidRepairMobilePhotoReason}
            </span>
          ) : !isInvalidRepairMobilePhotoStatus &&
            finalDocuments?.repairMobilePhoto ? (
            <span className=" p-2 text-[#FF9548] text-xxs font-semibold">
              Uploaded (Under Review)
            </span>
          ) : finalDocuments?.repairMobilePhoto ? (
            <span className=" p-2 text-[#19AD61] text-xxs font-semibold">
              Valid
            </span>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="flex gap-8">
        <div className="w-1/2">
          {/* Replacement Receipt PDF */}
          {isImeiChanged && (
            <div className="">
              {(!isValidReplacementReceipt && reupload) ||
              !finalDocuments?.replacementReceiptImage ? (
                <PdfUpload
                  label="Replacement Receipt( Add replacement receipts)"
                  pdfs={replacementReceipt}
                  setPdfs={setReplacementReceipt}
                />
              ) : finalDocuments.replacementReceiptImage.endsWith(".pdf") ? (
                <>
                  <h3 className="text-sm font-medium mb-2">
                    Replacement Receipt
                  </h3>
                  <div className="relative bg-inputBg w-[60px] h-[60px] flex items-center justify-center border border-[#EEEEEE]">
                    <a
                      href={finalDocuments.replacementReceiptImage}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src="/images/pdf-icon.svg"
                        alt="Repair Invoice PDF"
                        width={30}
                        height={50}
                      />
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-medium mb-2">
                    Replacement Receipt
                  </h3>
                  <GalleryPopup
                    images={[finalDocuments.replacementReceiptImage]}
                  />
                </>
              )}

              {isInvalidReplacementReceipt ? (
                <span className=" p-2 text-[#EB5757] text-xxs font-semibold">
                  Invalid Receipt : {isInvalidReplacementReceiptReason}
                </span>
              ) : !isInvalidReplacementReceiptStatus &&
                finalDocuments?.replacementReceiptImage &&
                finalDocuments?.isImeiChanged ? (
                <span className=" p-2 text-[#FF9548] text-xxs font-semibold">
                  Uploaded (Under Review)
                </span>
              ) : finalDocuments?.replacementReceiptImage ? (
                <span className="p-2 text-[#19AD61] text-xxs font-semibold">
                  Valid
                </span>
              ) : (
                <></>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-8">
        {showReuploadButton && !reupload ? (
          <button
            className={`btn w-1/4 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-6`}
            onClick={() => setReupload(true)}
          >
            Reupload
          </button>
        ) : (
          <button
            className={`btn w-1/4 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-6`}
            onClick={handleSubmit}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  ) : (
    <div>
      <FinalDocumentsView finalDocuments={finalDocuments} />
    </div>
  );
};

export default FinalDocumentsTab;
