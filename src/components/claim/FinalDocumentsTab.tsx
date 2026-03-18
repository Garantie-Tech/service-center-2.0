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
    isImeiChangedFromServer,

    // Handlers
    handleSubmit,
    handleRepairInvoiceUpload,
    handleReplacementReceiptUpload,
    isSubmitDisabledByDeviceReplacement,
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
  //   selectedClaim?.available_for_pickup &&
  //   isApprovedStatus &&
  //   selectedClaim?.customer_pickup_details != null &&
  //   selectedClaim?.pickup_tracking?.is_readyfor_pickup != true;

  // const isShipmentInitiated =
  //   selectedClaim?.available_for_pickup &&
  //   isApprovedStatus &&
  //   selectedClaim?.customer_pickup_details != null &&
  //   selectedClaim?.pickup_tracking?.is_readyfor_pickup == true &&
  //   selectedClaim?.pickup_tracking?.is_picked != true;

  // const isShipmentCompleted =
  //   selectedClaim?.available_for_pickup &&
  //   isApprovedStatus &&
  //   selectedClaim?.pickup_tracking != null &&
  //   selectedClaim?.pickup_tracking?.is_picked == true &&
  //   selectedClaim?.shipping_receipt != null;
  const isMinThreeRepairImageRequired =
    !!selectedClaim?.available_for_pickup &&
    !!selectedClaim?.customer_pickup_details;

  const showReadyforPickupSection =
    selectedClaim?.available_for_pickup &&
    selectedClaim?.customer_pickup_details != null &&
    selectedClaim?.final_documents == "valid";

  // If estimate flow already marked motherboard/phone replaced (imei_changed=true),
  // do not show the Final Documents "Device replaced?" section.
  const showDeviceReplacementSection =
    selectedClaim?.show_device_replacement_section === true &&
    selectedClaim?.imei_changed !== true;

  const isDeviceReplacementViewMode =
    showDeviceReplacementSection && isValidRepairMobilePhoto;

  const viewModeDeviceReplaced =
    !!(
      selectedClaim?.is_imei_updated ||
      selectedClaim?.imei_changed ||
      selectedClaim?.new_imei_number
    );
  const viewModeNewImei =
    selectedClaim?.new_imei_number ?? selectedClaim?.data?.replacement_imei ?? "";
  const viewModeReason =
    selectedClaim?.imei_update_reason ??
    selectedClaim?.data?.imei_update_reason ??
    "";

  return isEditable || showReadyforPickupSection ? (
    <div>
      <div>
        {/* Device replacement - view mode when Repair Mobile Images are valid */}
        {showDeviceReplacementSection && isDeviceReplacementViewMode && (
          <div className="mb-4 rounded-lg border border-[#e5e7eb] bg-[#fafbfc] px-4 py-3">
            <h3 className="text-sm font-medium text-[#374151] mb-2">
              Device replaced
            </h3>
            {viewModeDeviceReplaced && (
              <div className="mt-2 space-y-1">
                {viewModeNewImei && (
                  <p className="text-sm text-[#6b7280]">
                    New IMEI: {viewModeNewImei}
                  </p>
                )}
                {viewModeReason && (
                  <p className="text-sm text-[#6b7280]">
                    Reason: {viewModeReason}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Device replacement - editable when Repair Mobile Images not yet valid */}
        {showDeviceReplacementSection && !isDeviceReplacementViewMode && (
          <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-3 rounded-lg border border-[#e5e7eb] bg-[#fafbfc] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#374151] whitespace-nowrap">
                Device replaced?
              </span>
              <div className="inline-flex rounded-full bg-[#e5e7eb] p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeviceReplaced(false);
                    setNewImeiError(null);
                    setImeiUpdateReason("");
                    setImeiUpdateReasonError(null);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    !isDeviceReplaced
                      ? "bg-white text-[#181D27] shadow-sm"
                      : "text-[#6b7280] hover:text-[#374151]"
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeviceReplaced(true)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    isDeviceReplaced
                      ? "bg-primaryBlue text-white shadow-sm"
                      : "text-[#6b7280] hover:text-[#374151]"
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>
            {isDeviceReplaced && (
              <div className="flex items-center gap-3 flex-wrap animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-[#374151] whitespace-nowrap">
                    New IMEI <span className="text-[#dc2626]">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="15 digits"
                    value={newImei}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setNewImei(v);
                      setNewImeiError(null);
                    }}
                    className={`min-w-[12rem] w-52 rounded-md border bg-white px-2.5 py-1.5 text-sm text-[#181D27] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-primaryBlue/40 ${
                      newImeiError
                        ? "border-[#dc2626] focus:border-[#dc2626]"
                        : "border-[#e5e7eb] focus:border-primaryBlue"
                    }`}
                  />
                  {newImei && (
                    <span className="text-[10px] text-[#6b7280] tabular-nums">
                      {newImei.length}/15
                    </span>
                  )}
                  {newImeiError && (
                    <span className="text-xs text-[#dc2626] font-medium max-w-[160px]">
                      {newImeiError}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-[#374151] whitespace-nowrap">
                    Reason <span className="text-[#dc2626]">*</span>
                  </label>
                  <select
                    value={imeiUpdateReason}
                    onChange={(e) => {
                      setImeiUpdateReason(e.target.value);
                      setImeiUpdateReasonError(null);
                    }}
                    className={`min-w-[14rem] w-64 rounded-md border bg-white px-2.5 py-1.5 text-sm text-[#181D27] focus:outline-none focus:ring-1 focus:ring-primaryBlue/40 ${
                      imeiUpdateReasonError
                        ? "border-[#dc2626] focus:border-[#dc2626]"
                        : "border-[#e5e7eb] focus:border-primaryBlue"
                    }`}
                  >
                    <option value="" disabled>
                      Select reason
                    </option>
                    <option value="Due to shortage of spare parts">
                      Due to shortage of spare parts
                    </option>
                    <option value="Motherboard changed">Motherboard changed</option>
                  </select>
                  {imeiUpdateReasonError && (
                    <span className="text-xs text-[#dc2626] font-medium max-w-[200px]">
                      {imeiUpdateReasonError}
                    </span>
                  )}
                </div>
              </div>
            )}
            {isDeviceReplaced && (
              <p className="text-[11px] text-[#6b7280] w-full mt-0.5">
                {isSubmitDisabledByDeviceReplacement
                  ? "Enter valid 15-digit New IMEI to enable Submit."
                  : "Replacement receipt required with final documents below."}
              </p>
            )}
          </div>
        )}

        <h2 className="text-lg font-semibold mb-4">Repair Mobile Images</h2>

        <DocumentErrorAlerts
          isInvalidRepairInvoice={isInvalidRepairInvoice}
          isInvalidRepairMobilePhoto={isInvalidRepairMobilePhoto}
          isInvalidReplacementReceipt={isInvalidReplacementReceipt}
          isImeiChanged={isImeiChangedFromServer || isImeiChanged}
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
            isSubmitDisabledByDeviceReplacement={
              isSubmitDisabledByDeviceReplacement
            }
            deviceReplacement={
              showDeviceReplacementSection && !isDeviceReplacementViewMode
                ? {
                    is_imei_updated: isDeviceReplaced,
                    new_imei_number:
                      isDeviceReplaced && newImei.trim()
                        ? newImei.trim()
                        : undefined,
                    imei_update_reason:
                      isDeviceReplaced && imeiUpdateReason
                        ? imeiUpdateReason
                        : undefined,
                  }
                : undefined
            }
          />
          <div className="w-1/2">
            {/* shipment details  */}
            {selectedClaim?.available_for_pickup &&
              selectedClaim?.customer_pickup_details != null && (
                <ShipmentDetailsSection
                  isValidRepairMobilePhoto={isValidRepairMobilePhoto}
                  repairedMobilePhotos={repairedMobilePhotos}
                  isMinThreeRepairImageRequired={isMinThreeRepairImageRequired}
                  isInvalidRepairMobilePhotoStatus={
                    isInvalidRepairMobilePhotoStatus
                  }
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
            isImeiChanged={isImeiChangedFromServer}
            showReplacementReceiptSection={
              isImeiChanged || isImeiChangedFromServer
            }
            finalDocuments={finalDocuments}
            repairInvoiceError={repairInvoiceError}
            replacementReceiptError={replacementReceiptError}
          />

          {/* Add Upload Again and Submit buttons for reupload mode */}
          <DocumentActionButtons
            reuploadFinalDocs={reuploadFinalDocs}
            showReuploadButton={showReuploadButton}
            finalDocuments={finalDocuments}
            isImeiChanged={isImeiChangedFromServer}
            setReuploadFinalDocs={setReuploadFinalDocs}
            handleSubmit={handleSubmit}
            isFinalDocValid={
              selectedClaim?.final_documents == "valid" ? true : false
            }
            isSubmitDisabledByDeviceReplacement={
              isSubmitDisabledByDeviceReplacement
            }
          />
        </div>
      )}
    </div>
  ) : (
    <FinalDocumentsView finalDocuments={finalDocuments} />
  );
};

export default FinalDocumentsTab;
