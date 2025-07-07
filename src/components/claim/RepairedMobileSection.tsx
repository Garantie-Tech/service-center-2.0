"use client";

import ImageUpload from "@/components/ui/ImageUpload";
import GalleryPopup from "@/components/ui/GalleryPopup";
import { useGlobalStore } from "@/store/store";
import { useNotification } from "@/context/NotificationProvider";
import { uploadFinalDocuments } from "@/services/claimService";
import { compressImage } from "@/utils/compressImage";
import { RepairedMobileSectionProps } from "@/interfaces/ClaimInterface";

const RepairedMobileSection: React.FC<RepairedMobileSectionProps> = ({
  repairedMobilePhotos,
  setRepairedMobilePhotos,
  reuploadMobile,
  setReuploadMobile,
  repairMobilePhotoError,
  isInvalidRepairMobilePhoto,
  isInvalidRepairMobilePhotoReason,
  isInvalidRepairMobilePhotoStatus,
  finalDocuments,
}) => {
  const { selectedClaim, setIsLoading, triggerClaimRefresh } = useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();

  const handleMobilePhotoUpload = async () => {
    if (!repairedMobilePhotos || repairedMobilePhotos.length < 3) {
      notifyError("Please select at least 3 repaired mobile images to upload.");
      return;
    }
    if (repairedMobilePhotos.length > 5) {
      notifyError("You can upload a maximum of 5 repaired mobile images.");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append(`74[delete_existing_document]`, "1");
    formData.append(`74[document_type_id]`, "74");

    // Compress images > 1MB before appending
    for (const file of repairedMobilePhotos) {
      let fileToUpload = file;
      if (file.size > 1024 * 1024) { // 1MB
        try {
          fileToUpload = await compressImage(file);
        } catch (e) {
          notifyError("Failed to compress an image. Uploading original."+e);
        }
      }
      formData.append(`74[document][]`, fileToUpload);
    }

    const uploadResponse = await uploadFinalDocuments(
      Number(selectedClaim?.id),
      formData
    );
    setIsLoading(false);
    if (!uploadResponse.data) {
      notifyError("Failed to upload repaired mobile images. Please try again.");
    } else {
      triggerClaimRefresh();
      setReuploadMobile(false);
      notifySuccess("Repaired mobile images uploaded successfully!");
    }
  };

  return (
    <div className="w-1/2">
      {reuploadMobile ? (
        <>
          <ImageUpload
            label="Repaired Mobile (Add repaired mobile photos)"
            images={repairedMobilePhotos}
            setImages={setRepairedMobilePhotos}
            multiple={true}
          />
          <div className="text-xs text-gray-500 mt-1">Minimum 3 and maximum 5 images required.</div>
          {repairedMobilePhotos.length > 0 && (
            <div className={`text-xs mt-1 ${repairedMobilePhotos.length < 3 || repairedMobilePhotos.length > 5 ? 'text-red-500' : 'text-green-600'}`}>{
              repairedMobilePhotos.length < 3
                ? `You have selected ${repairedMobilePhotos.length}. Please select at least 3 images.`
                : repairedMobilePhotos.length > 5
                ? `You have selected ${repairedMobilePhotos.length}. Maximum 5 images allowed.`
                : `You have selected ${repairedMobilePhotos.length} images.`
            }</div>
          )}
          {selectedClaim?.is_tvs_claim ? (
            <button
              className="btn w-1/2 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2"
              onClick={handleMobilePhotoUpload}
              disabled={repairedMobilePhotos.length < 3 || repairedMobilePhotos.length > 5}
            >
              Ready For Pickup
            </button>
          ) : (
            <button
              className="btn w-1/2 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2"
              onClick={handleMobilePhotoUpload}
              disabled={repairedMobilePhotos.length < 3 || repairedMobilePhotos.length > 5}
            >
              Submit
            </button>
          )}
        </>
      ) : (
        <>
          <h3 className="text-sm font-medium mb-2">Repaired Mobile</h3>
          <GalleryPopup images={finalDocuments.repairMobilePhoto ?? []} />
        </>
      )}

      <div>
        {isInvalidRepairMobilePhoto && repairMobilePhotoError ? (
          <span className=" p-2 text-[#EB5757] text-xxs font-semibold">
            Invalid Photo : {isInvalidRepairMobilePhotoReason}
          </span>
        ) : !reuploadMobile &&
          isInvalidRepairMobilePhotoStatus == null &&
          finalDocuments?.repairMobilePhoto ? (
          <span className=" p-2 text-[#FF9548] text-xxs font-semibold">
            Uploaded (Under Review)
          </span>
        ) : isInvalidRepairMobilePhotoStatus == true ? (
          <span className=" p-2 text-[#19AD61] text-xxs font-semibold">
            Valid
          </span>
        ) : (
          <></>
        )}
      </div>

      {/* Upload Again button for under review */}
      {isInvalidRepairMobilePhotoStatus == null &&
        finalDocuments?.repairMobilePhoto &&
        !reuploadMobile && (
          <button
            className="btn w-1/2 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2"
            onClick={() => setReuploadMobile(true)}
          >
            Upload Again
          </button>
        )}
    </div>
  );
};

export default RepairedMobileSection; 