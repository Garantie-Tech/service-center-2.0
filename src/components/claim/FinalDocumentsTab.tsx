import { useGlobalStore } from "@/store/store";
import { useEffect } from "react";
import FinalDocumentsView from "@/components/claim/view/FinalDocumentsView";
import ShipmentDetailsSection from "@/components/claim/ShipmentDetailsSection";
import RepairedMobileSection from "@/components/claim/RepairedMobileSection";
import FinalDocumentsSection from "@/components/claim/FinalDocumentsSection";
import DocumentErrorAlerts from "@/components/claim/DocumentErrorAlerts";
import DocumentActionButtons from "@/components/claim/DocumentActionButtons";
import { useFinalDocuments } from "@/hooks/useFinalDocuments";

const FinalDocumentsTab: React.FC = () => {
  const { selectedClaim } = useGlobalStore();
  
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
    repairMobilePhotoInfo
  } = useFinalDocuments();

  // const approvedStatuses = [
  //   "Approved",
  //   "BER Approved",
  //   "BER Replacement Approved",
  //   "BER Repair Approved",
  // ];
  // const isApprovedStatus = approvedStatuses.includes(selectedClaim?.status || "");

  useEffect(() => {
    if(repairMobilePhotoInfo?.statusValue != true && selectedClaim?.repaired_mobile_images?.length == 0){
      setReuploadMobile(true);
    }
    setReuploadFinalDocs(false);
  }, [selectedClaim]);

  // const handlePickupTracking = async (pickup_type: string) => {
  //   if (pickup_type == "ready") {
  //     if (!repairedMobilePhotos || repairedMobilePhotos.length === 0) {
  //       notifyError(
  //         "Please upload repaired mobile image before marking as ready for pickup."
  //       );
  //       return;
  //     }
  //     try {
  //       setIsLoading(true);
  //       const formData = new FormData();
  //       repairedMobilePhotos.forEach((file: File) => {
  //         formData.append(`74[delete_existing_document]`, "1");
  //         formData.append(`74[document]`, file);
  //         formData.append(`74[document_type_id]`, "74");
  //       });
  //       const uploadResponse = await uploadFinalDocuments(
  //         Number(selectedClaim?.id),
  //         formData
  //       );
  //       if (!uploadResponse.data) {
  //         notifyError(
  //           "Failed to upload repaired mobile images. Please try again."
  //         );
  //         setIsLoading(false);
  //         return;
  //       }
  //       const response = await handlePickupTrackingStatus(
  //         Number(selectedClaim?.id),
  //         String(pickup_type)
  //       );

  //       if (!response.success) {
  //         notifyError("Failed to mark ready for pickup !");
  //       } else {
  //         triggerClaimRefresh();
  //         notifySuccess("Marked as ready for pickup ");
  //       }
  //     } catch (error) {
  //       notifyError(`Failed to mark ready for pickup ! ${error}`);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }

  //   if (pickup_type == "picked") {
  //     try {
  //       setIsLoading(true);
  //       const response = await handlePickupTrackingStatus(
  //         Number(selectedClaim?.id),
  //         String(pickup_type)
  //       );

  //       if (!response.success) {
  //         notifyError("Failed to mark as picked up !");
  //       } else {
  //         triggerClaimRefresh();
  //         notifySuccess("Marked as picked up ");
  //       }
  //     } catch (error) {
  //       notifyError(`Failed to mark as picked up ! ${error}`);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  // };

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
          />
          <div className="w-1/2">
            {/* shipment details  */}
            {selectedClaim?.is_tvs_claim && (
              <ShipmentDetailsSection
                isValidRepairMobilePhoto={isValidRepairMobilePhoto}
                repairedMobilePhotos={repairedMobilePhotos}
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
            isInvalidReplacementReceiptReason={isInvalidReplacementReceiptReason}
            isInvalidReplacementReceiptStatus={isInvalidReplacementReceiptStatus}
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
