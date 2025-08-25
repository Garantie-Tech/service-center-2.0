import { useGlobalStore } from "@/store/store";
import { useEffect } from "react";
import FinalDocumentsView from "@/components/claim/view/FinalDocumentsView";
import ShipmentDetailsSection from "@/components/claim/ShipmentDetailsSection";
import RepairedMobileSection from "@/components/claim/RepairedMobileSection";
import FinalDocumentsSection from "@/components/claim/FinalDocumentsSection";
import DocumentErrorAlerts from "@/components/claim/DocumentErrorAlerts";
import DocumentActionButtons from "@/components/claim/DocumentActionButtons";
import { useFinalDocuments } from "@/hooks/useFinalDocuments";
import { useNotification } from "@/context/NotificationProvider";
import { handlePickupTrackingStatus } from "@/services/claimService";

const FinalDocumentsTab: React.FC = () => {
  const { selectedClaim, setIsLoading, triggerClaimRefresh } = useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();

  const {
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
    repairMobilePhotoError,
    setRepairMobilePhotoError,
    replacementReceiptError,
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

    // Handlers
    handleSubmit,
    handleRepairInvoiceUpload,
    handleReplacementReceiptUpload,
    repairMobilePhotoInfo,
  } = useFinalDocuments();

  // const approvedStatuses = [
  //   "Approved",
  //   "BER Approved",
  //   "BER Replacement Approved",
  //   "BER Repair Approved",
  // ];
  // const isApprovedStatus = approvedStatuses.includes(selectedClaim?.status || "");

  useEffect(() => {
    if (
      repairMobilePhotoInfo?.statusValue != true &&
      selectedClaim?.repaired_mobile_images?.length == 0
    ) {
      setReuploadMobile(true);
    }
    setReuploadFinalDocs(false);
  }, [selectedClaim]);

  // const readyToPickupStatus =
  //   selectedClaim?.is_tvs_claim &&
  //   isApprovedStatus &&
  //   selectedClaim?.customer_pickup_details != null &&
  //   selectedClaim?.pickup_tracking?.is_readyfor_pickup != true;

  // const isShipmentInitiated =
  //   selectedClaim?.is_tvs_claim &&
  //   isApprovedStatus &&
  //   selectedClaim?.customer_pickup_details != null &&
  //   selectedClaim?.pickup_tracking?.is_readyfor_pickup == true &&
  //   selectedClaim?.pickup_tracking?.is_picked != true;

  // const isShipmentCompleted =
  //   selectedClaim?.is_tvs_claim &&
  //   isApprovedStatus &&
  //   selectedClaim?.pickup_tracking != null &&
  //   selectedClaim?.pickup_tracking?.is_picked == true &&
  //   selectedClaim?.shipping_receipt != null;
  const isMinThreeRepairImageRequired =
    !!selectedClaim?.is_tvs_claim && !!selectedClaim?.customer_pickup_details;

  return isEditable ? (
    <div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Repair Mobile Images</h2>

        <DocumentErrorAlerts
          isInvalidRepairInvoice={isInvalidRepairInvoice}
          isInvalidRepairMobilePhoto={isInvalidRepairMobilePhoto}
          isInvalidReplacementReceipt={isInvalidReplacementReceipt}
          isImeiChanged={isImeiChanged}
          showRepairInvoiceError={showRepairInvoiceError}
          showRepairMobilePhotoError={showRepairMobilePhotoError}
          showReplacementReceiptError={showReplacementReceiptError}
          repairInvoiceError={repairInvoiceError}
          repairMobilePhotoError={repairMobilePhotoError}
          replacementReceiptError={replacementReceiptError}
          isInvalidRepairInvoiceReason={isInvalidRepairInvoiceReason}
          isInvalidRepairMobilePhotoReason={isInvalidRepairMobilePhotoReason}
          isInvalidReplacementReceiptReason={isInvalidReplacementReceiptReason}
          setShowRepairInvoiceError={setShowRepairInvoiceError}
          setShowRepairMobilePhotoError={setShowRepairMobilePhotoError}
          setShowReplacementReceiptError={setShowReplacementReceiptError}
        />

        {/* Repaired Mobile Photos and shipment details */}
        <div className="flex gap-8">
          <RepairedMobileSection
            repairedMobilePhotos={repairedMobilePhotos}
            setRepairedMobilePhotos={setRepairedMobilePhotos}
            reuploadMobile={reuploadMobile}
            setReuploadMobile={setReuploadMobile}
            repairMobilePhotoError={repairMobilePhotoError}
            setRepairMobilePhotoError={setRepairMobilePhotoError}
            isInvalidRepairMobilePhoto={isInvalidRepairMobilePhoto}
            isInvalidRepairMobilePhotoReason={isInvalidRepairMobilePhotoReason}
            isInvalidRepairMobilePhotoStatus={isInvalidRepairMobilePhotoStatus}
            finalDocuments={finalDocuments}
            isMinThreeRepairImageRequired={isMinThreeRepairImageRequired}
          />
          <div className="w-1/2">
            {/* shipment details  */}
            {selectedClaim?.is_tvs_claim && (
              <ShipmentDetailsSection
                isValidRepairMobilePhoto={isValidRepairMobilePhoto}
                repairedMobilePhotos={repairedMobilePhotos}
                isMinThreeRepairImageRequired={isMinThreeRepairImageRequired}
              />
            )}
          </div>
        </div>
      </div>

      {/* final invoice doc */}
      {isValidRepairMobilePhoto && (
        <div className="border-t py-[25px] border-[#e5e7eb] mt-[25px]">
          <h2 className="text-lg font-semibold mb-4">Final Documents</h2>

          <FinalDocumentsSection
            repairInvoice={repairInvoice}
            replacementReceipt={replacementReceipt}
            handleRepairInvoiceUpload={handleRepairInvoiceUpload}
            handleReplacementReceiptUpload={handleReplacementReceiptUpload}
            reuploadFinalDocs={reuploadFinalDocs}
            isInvalidRepairInvoice={isInvalidRepairInvoice}
            isInvalidRepairInvoiceReason={isInvalidRepairInvoiceReason}
            isInvalidRepairInvoiceStatus={isInvalidRepairInvoiceStatus}
            isValidRepairInvoice={isValidRepairInvoice}
            isInvalidReplacementReceipt={isInvalidReplacementReceipt}
            isInvalidReplacementReceiptReason={
              isInvalidReplacementReceiptReason
            }
            isInvalidReplacementReceiptStatus={
              isInvalidReplacementReceiptStatus
            }
            isValidReplacementReceipt={isValidReplacementReceipt}
            isImeiChanged={isImeiChanged}
            finalDocuments={finalDocuments}
            repairInvoiceError={repairInvoiceError}
            replacementReceiptError={replacementReceiptError}
          />

          {/* Add Upload Again and Submit buttons for reupload mode */}
          <DocumentActionButtons
            reuploadFinalDocs={reuploadFinalDocs}
            showReuploadButton={showReuploadButton}
            finalDocuments={finalDocuments}
            isImeiChanged={isImeiChanged}
            setReuploadFinalDocs={setReuploadFinalDocs}
            handleSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  ) : (
    <FinalDocumentsView finalDocuments={finalDocuments} />
  );
};

export default FinalDocumentsTab;
