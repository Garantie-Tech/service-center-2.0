"use client";

import ImageUpload from "@/components/ui/ImageUpload";
import Image from "next/image";
import GalleryPopup from "@/components/ui/GalleryPopup";
import { useGlobalStore } from "@/store/store";
import { useNotification } from "@/context/NotificationProvider";
import { uploadFinalDocuments } from "@/services/claimService";
import { compressImage } from "@/utils/compressImage";
import { useState } from "react";
import { RepairedMobileSectionProps } from "@/interfaces/ClaimInterface";

const RepairedMobileSection: React.FC<RepairedMobileSectionProps> = ({
  repairedMobilePhotos,
  setRepairedMobilePhotos,
  reuploadMobile,
  setReuploadMobile,
  repairMobilePhotoError,
  setRepairMobilePhotoError,
  isInvalidRepairMobilePhoto,
  isInvalidRepairMobilePhotoReason,
  isInvalidRepairMobilePhotoStatus,
  finalDocuments,
}) => {
  const { selectedClaim, setIsLoading, triggerClaimRefresh } = useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();

  const handleSingleImageSelect = async (
    files: File[],
    setter: (fileArray: File[]) => void,
    setError?: (val: boolean) => void
  ) => {
    if (files.length > 0) {
      try {
        const latestFile = files[files.length - 1];
        const compressed = await compressImage(latestFile);

        if (setError) setError(false);
        setter([compressed]);
      } catch (err) {
        console.error("Image compression failed:", err);
        if (setError) setError(true);
      }
    } else {
      setter([]);
    }
  };

  const handleMobilePhotoUpload = async () => {
    if (!repairedMobilePhotos || repairedMobilePhotos.length === 0) {
      notifyError("Please select a repaired mobile image to upload.");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    repairedMobilePhotos.forEach((file) => {
      formData.append(`74[delete_existing_document]`, "1");
      formData.append(`74[document]`, file);
      formData.append(`74[document_type_id]`, "74");
    });
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
      notifySuccess("Repaired mobile image uploaded successfully!");
    }
  };

  return (
    <div className="w-1/2">
      {reuploadMobile ? (
        <>
          <ImageUpload
            label="Repaired Mobile (Add repaired mobile photo)"
            images={repairedMobilePhotos}
            setImages={(files: File[]) =>
              handleSingleImageSelect(
                files,
                setRepairedMobilePhotos,
                setRepairMobilePhotoError
              )
            }
          />
          {selectedClaim?.is_tvs_claim ? (
            <button
              className="btn w-1/2 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2"
              onClick={handleMobilePhotoUpload}
            >
              Ready For Pickup
            </button>
          ) : (
            <button
              className="btn w-1/2 bg-primaryBlue hover:bg-lightPrimaryBlue text-white mt-2"
              onClick={handleMobilePhotoUpload}
            >
              Submit
            </button>
          )}
        </>
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