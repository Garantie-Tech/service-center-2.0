"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { AdditionalDocumentItem } from "@/interfaces/ClaimInterface";
import { uploadAdditionalDocuments } from "@/services/claimService";
import { useGlobalStore } from "@/store/store";
import { useNotification } from "@/context/NotificationProvider";
import GalleryPopup from "@/components/ui/GalleryPopup";
import { getFileSizeError } from "@/utils/fileSizeValidation";

function isPdfUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".pdf") || path.includes(".pdf?");
  } catch {
    return url.toLowerCase().includes(".pdf");
  }
}

const MAX_FILES = 5;
const SOURCE_LABELS: Record<string, string> = {
  final: "Additional Documents",
  customer: "Additional Documents",
};

interface AdditionalDocumentsSectionProps {
  source: "final" | "customer";
  documents: AdditionalDocumentItem[];
}

function getFileName(file: File): string {
  return file.name?.trim() || `File`;
}

export default function AdditionalDocumentsSection({
  source,
  documents,
}: AdditionalDocumentsSectionProps) {
  const {
    selectedClaim,
    setIsLoading,
    triggerClaimRefresh,
    additionalDocumentSubTypes: subTypes,
    loadAdditionalDocumentSubTypes,
  } = useGlobalStore();
  const { notifySuccess, notifyError } = useNotification();
  const [selectedSubTypeId, setSelectedSubTypeId] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileSizeError, setFileSizeError] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  useEffect(() => {
    loadAdditionalDocumentSubTypes();
  }, [loadAdditionalDocumentSubTypes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    setFileSizeError("");

    const sizeError = getFileSizeError(chosen);
    if (sizeError) {
      setFileSizeError(sizeError);
      return;
    }

    const combined = [...files, ...chosen].slice(0, MAX_FILES);
    if (combined.length > MAX_FILES) {
      notifyError(`Maximum ${MAX_FILES} files allowed.`);
    }
    setFiles(combined);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileSizeError("");
  };

  const handleUpload = async () => {
    if (!selectedClaim?.id || !selectedSubTypeId || files.length === 0) {
      notifyError("Please select a document type and at least one file.");
      return;
    }
    setUploading(true);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("source", source);
      formData.append("sub_document_type_id", selectedSubTypeId);
      files.forEach((file) => {
        formData.append("additional_files[]", file);
      });
      const response = await uploadAdditionalDocuments(
        selectedClaim.id,
        formData,
      );
      const ok =
        (response as { success?: boolean; data?: { success?: boolean } })
          ?.success &&
        (response as { data?: { success?: boolean } })?.data?.success !== false;
      if (ok) {
        triggerClaimRefresh();
        notifySuccess("Additional documents uploaded successfully.");
        setSelectedSubTypeId("");
        setFiles([]);
      } else {
        const msg =
          (response as { data?: { message?: string }; error?: string })?.data
            ?.message ??
          (response as { error?: string })?.error ??
          "Failed to upload additional documents.";
        notifyError(msg);
      }
    } catch (err: unknown) {
      let message = "Failed to upload additional documents. Please try again.";

      if (err instanceof Error) {
        message += " " + err.message;
      }

      notifyError(message);
    } finally {
      setUploading(false);
      setIsLoading(false);
    }
  };

  const label = SOURCE_LABELS[source] ?? "Additional Documents";
  const hasExistingDocs = documents && documents.length > 0;
  const totalFiles =
    documents?.reduce((s, d) => s + (d.files?.length ?? 0), 0) ?? 0;

  return (
    <div className="mt-6 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => setAccordionOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/80 transition-colors"
        aria-expanded={accordionOpen}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primaryBlue/10">
            <Image
              src="/images/upload-icon.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-90"
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {hasExistingDocs
                ? `${documents.length} type(s), ${totalFiles} file(s) uploaded`
                : "Upload supporting documents"}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 transition-transform ${accordionOpen ? "rotate-180" : ""}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {/* Accordion body */}
      {accordionOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100 bg-gray-50/50">
          {/* Existing uploaded documents */}
          {hasExistingDocs && (
            <div className="mb-5 p-4 rounded-lg bg-white border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Uploaded documents
              </p>
              <ul className="space-y-4">
                {documents.map((doc, idx) => {
                  const files = doc.files ?? [];
                  const pdfUrls = files.filter((url) => isPdfUrl(url));
                  const imageUrls = files.filter((url) => !isPdfUrl(url));
                  return (
                    <li key={idx} className="text-sm">
                      <span className="font-medium text-gray-800 block mb-2">
                        {doc.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        {pdfUrls.map((url, i) => (
                          <a
                            key={`pdf-${i}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primaryBlue/30 transition-colors"
                            title="Open PDF"
                          >
                            <Image
                              src="/images/pdf-icon.svg"
                              alt="PDF"
                              width={36}
                              height={36}
                            />
                          </a>
                        ))}
                        {imageUrls.length > 0 && (
                          <div className="flex items-start">
                            <GalleryPopup
                              images={imageUrls}
                              allowRemoval={false}
                            />
                          </div>
                        )}
                        {files.length === 0 && (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Upload form */}
          <div className="space-y-4 p-4 rounded-lg bg-white border border-gray-100">
            <p className="text-sm font-medium text-gray-700">
              Upload new documents
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Document type
              </label>
              <select
                value={selectedSubTypeId}
                onChange={(e) => setSelectedSubTypeId(e.target.value)}
                className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primaryBlue/20 focus:border-primaryBlue"
              >
                <option value="">Select type</option>
                {subTypes.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Files (max {MAX_FILES}, PDF or image)
              </label>
              {fileSizeError && (
                <div className="mb-2 p-2 text-red-500 text-xs bg-red-50 border border-red-200 rounded">
                  {fileSizeError}
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Image
                  src="/images/upload-icon.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="opacity-70"
                />
                <span className="text-sm text-gray-600">Choose files</span>
                <input
                  type="file"
                  accept=".pdf,image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Selected files list with remove */}
            {files.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Selected ({files.length}/{MAX_FILES})
                </p>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-2 py-2 px-3 rounded-md bg-white border border-gray-100"
                    >
                      <span className="text-sm text-gray-800 truncate flex-1 min-w-0">
                        {getFileName(file)}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                        aria-label={`Remove ${getFileName(file)}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !selectedSubTypeId || files.length === 0}
              className="px-4 py-2.5 rounded-lg bg-primaryBlue text-white text-sm font-medium hover:bg-lightPrimaryBlue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Uploading..." : "Upload documents"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
