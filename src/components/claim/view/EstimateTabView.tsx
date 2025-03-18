"use client";

import GalleryPopup from "@/components/ui/GalleryPopup";
import { EstimateDetailsState } from "@/interfaces/GlobalInterface";
import Image from "next/image";

const EstimateTabViewComponent: React.FC<EstimateDetailsState> = (
  estimateDetailsState
) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-8">
        {/* Claim Date */}
        <div>
          <h4 className="text-xs text-gray-500">Estimate Amount</h4>
          <p className="text-sm font-semibold">
            {estimateDetailsState.estimateAmount}
          </p>
        </div>

        {/* Plan Type */}
        <div>
          <h4 className="text-xs text-gray-500">Job Sheet Number</h4>
          <p className="text-sm font-semibold">
            {estimateDetailsState.jobSheetNumber}
          </p>
        </div>

        {/* Claim Details */}
        <div>
          <h4 className="text-xs text-gray-500">Estimate Details</h4>
          <p className="text-sm text-gray-700">
            {estimateDetailsState.estimateDetails}
          </p>
        </div>
        <div>
          <h4 className="text-xs text-gray-500">Is Motherboard Replaced ?</h4>
          <p className="text-sm text-gray-700">
            {estimateDetailsState.replacementConfirmed == 'yes' ? "yes" : "no"}
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* Estimate Document*/}
        <div>
          <h4 className="text-xs text-gray-500">Estimate Document</h4>
          <div className="mb-4">
            {estimateDetailsState?.estimateDocument && (
              <div className="relative bg-inputBg w-[60px] h-[50px] flex items-center justify-center border border-[#EEEEEE]">
                {estimateDetailsState?.estimateDocument ? (
                  typeof estimateDetailsState?.estimateDocument === "string" ? (
                    estimateDetailsState?.estimateDocument.endsWith(".pdf") ? (
                      <a
                        href={estimateDetailsState?.estimateDocument}
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
                      <GalleryPopup
                        images={[estimateDetailsState?.estimateDocument]}
                      />
                    )
                  ) : estimateDetailsState?.estimateDocument.type ===
                    "application/pdf" ? (
                    <Image
                      src="/images/pdf-icon.svg"
                      alt="Estimate Upload"
                      width={30}
                      height={50}
                      className="h-[100%]"
                    />
                  ) : (
                    <Image
                      src={URL.createObjectURL(
                        estimateDetailsState?.estimateDocument
                      )} // Convert File to preview
                      alt="Estimate Document"
                      width={30}
                      height={50}
                      className="rounded border h-[100%]"
                    />
                  )
                ) : (
                  <></>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Damage Mobile Photo */}
        <div>
          <h4 className="text-xs text-gray-500">Damage Mobile Photo</h4>
          <GalleryPopup images={estimateDetailsState?.damagePhotos} />
        </div>
      </div>
    </div>
  );
};

export default EstimateTabViewComponent;
