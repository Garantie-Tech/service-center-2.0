"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  type BulkRepairInvoiceSeverity,
  type BulkRepairInvoiceUploadResult,
  uploadBulkRepairInvoice,
} from "@/services/claimService";
import { useNotification } from "@/context/NotificationProvider";

type UploadRow = {
  id: string;
  file: File;
  severity: BulkRepairInvoiceSeverity;
  claimId: number | null;
  matchStatus: string | null;
  uploadStatus: string | null;
  message: string;
  jobSheetNumber: string | null;
  imei: string | null;
};

interface BulkRepairInvoiceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const makeRow = (file: File, index: number): UploadRow => ({
  id: `${file.name}-${file.lastModified}-${index}`,
  file,
  severity: "queued",
  claimId: null,
  matchStatus: null,
  uploadStatus: null,
  message: "Queued",
  jobSheetNumber: null,
  imei: null,
});

const statusStyles: Record<BulkRepairInvoiceSeverity, string> = {
  queued: "bg-slate-100 text-slate-700 ring-slate-200",
  processing: "bg-blue-50 text-blue-700 ring-blue-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  error: "bg-red-50 text-red-700 ring-red-200",
};

const statusLabel: Record<BulkRepairInvoiceSeverity, string> = {
  queued: "Queued",
  processing: "Processing",
  success: "Uploaded",
  warning: "Success with warning",
  error: "Failed",
};

const cleanMessage = (message: string | undefined): string => {
  const cleaned = (message || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Repair invoice could not be processed.";

  if (/502 bad gateway|bad gateway|nginx/i.test(cleaned)) {
    return "Repair invoice mapping service is temporarily unavailable. Please retry this invoice.";
  }

  return cleaned;
};

const unwrapResult = (
  payload: unknown,
): BulkRepairInvoiceUploadResult | null => {
  if (!payload || typeof payload !== "object") return null;

  const direct = payload as BulkRepairInvoiceUploadResult;
  if ("severity" in direct) return direct;

  const nested = payload as { data?: BulkRepairInvoiceUploadResult };
  if (nested.data && "severity" in nested.data) return nested.data;

  return null;
};

const BulkRepairInvoiceUploadModal: React.FC<
  BulkRepairInvoiceUploadModalProps
> = ({ isOpen, onClose, onComplete }) => {
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { notifyError, notifySuccess } = useNotification();

  if (!isOpen) return null;

  const summary = rows.reduce(
    (counts, row) => {
      counts[row.severity] += 1;
      return counts;
    },
    {
      queued: 0,
      processing: 0,
      success: 0,
      warning: 0,
      error: 0,
    } satisfies Record<BulkRepairInvoiceSeverity, number>,
  );
  const hasQueuedRows = summary.queued > 0;
  const hasFailedRows = summary.error > 0;
  const canRunUpload = rows.length > 0 && (hasQueuedRows || hasFailedRows);
  const uploadActionLabel = hasQueuedRows ? "Upload" : "Retry Failed";

  const updateRow = (id: string, changes: Partial<UploadRow>) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id ? { ...row, ...changes } : row,
      ),
    );
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const pdfFiles = selectedFiles.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
    );

    if (pdfFiles.length !== selectedFiles.length) {
      notifyError("Only PDF repair invoices can be uploaded.");
    }

    setRows((currentRows) => [
      ...currentRows,
      ...pdfFiles.map((file, index) =>
        makeRow(file, currentRows.length + index),
      ),
    ]);

    if (event.target) {
      event.target.value = "";
    }
  };

  const removeRow = (id: string) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== id));
  };

  const processUploads = async () => {
    const rowsToProcess = hasQueuedRows
      ? rows.filter((row) => row.severity === "queued")
      : rows.filter((row) => row.severity === "error");

    if (rowsToProcess.length === 0) {
      notifyError("Please select at least one repair invoice PDF.");
      return;
    }

    setIsProcessing(true);

    for (const row of rowsToProcess) {
      updateRow(row.id, {
        severity: "processing",
        message: "Processing invoice...",
      });

      const formData = new FormData();
      formData.append("invoice", row.file);

      try {
        const response = await uploadBulkRepairInvoice(formData);
        const result = unwrapResult(response.data);

        if (!response.success || !result) {
          updateRow(row.id, {
            severity: "error",
            message: cleanMessage(
              response.error ||
                "Repair invoice could not be processed. Please try again.",
            ),
          });
          continue;
        }

        updateRow(row.id, {
          severity: result.severity,
          claimId: result.claim_id ?? null,
          matchStatus: result.match_status ?? null,
          uploadStatus: result.upload_status ?? null,
          message: cleanMessage(result.message || "Repair invoice processed."),
          jobSheetNumber: result.extracted?.job_sheet_number ?? null,
          imei: result.extracted?.imei ?? null,
        });
      } catch (error) {
        updateRow(row.id, {
          severity: "error",
          message: `Upload failed. ${error}`,
        });
      }
    }

    setIsProcessing(false);
    onComplete();
    notifySuccess("Bulk repair invoice upload completed.");
  };

  const clearRows = () => {
    if (isProcessing) return;
    setRows([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10">
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold text-slate-950">
                Bulk Upload Repair Invoices
              </h2>
              {rows.length > 0 && (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {rows.length} selected
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Select PDF invoices and process them one by one with live status updates.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-md p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:opacity-50"
            aria-label="Close"
          >
            <Image
              src="/images/x-close.svg"
              alt="Close"
              width={18}
              height={18}
            />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isProcessing}
                className="rounded-md bg-primaryBlue px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md disabled:translate-y-0 disabled:opacity-50"
              >
                Select PDFs
              </button>
              <button
                type="button"
                onClick={processUploads}
                disabled={isProcessing || !canRunUpload}
                className="rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:translate-y-0 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : uploadActionLabel}
              </button>
              <button
                type="button"
                onClick={clearRows}
                disabled={isProcessing || rows.length === 0}
                className="rounded-md bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                Queued {summary.queued}
              </span>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                Processing {summary.processing}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                Uploaded {summary.success}
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                Warnings {summary.warning}
              </span>
              <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700">
                Failed {summary.error}
              </span>
            </div>
          </div>

          <div className="max-h-[58vh] overflow-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-[1120px] text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-500 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold">File</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Claim</th>
                  <th className="px-4 py-3 font-semibold">Match</th>
                  <th className="px-4 py-3 font-semibold">Upload</th>
                  <th className="px-4 py-3 font-semibold">Extracted</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      <div className="mx-auto max-w-sm rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-8">
                        <p className="font-semibold text-slate-700">
                          No invoices selected
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Select repair invoice PDFs to begin processing.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-slate-100 align-top transition hover:bg-slate-50"
                    >
                      <td className="max-w-[220px] px-4 py-4 font-medium text-slate-900">
                        <span className="break-words">{row.file.name}</span>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {(row.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusStyles[row.severity]}`}
                        >
                          {row.severity === "processing" && (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" />
                          )}
                          {statusLabel[row.severity]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {row.claimId ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {row.matchStatus ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {row.uploadStatus ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        <p>{row.jobSheetNumber ?? "-"}</p>
                        <p className="text-[11px] text-slate-500">
                          {row.imei ?? ""}
                        </p>
                      </td>
                      <td className="min-w-[260px] px-4 py-4 text-slate-700">
                        {row.message}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          disabled={isProcessing}
                          className="font-semibold text-slate-400 transition hover:text-red-600 disabled:opacity-40"
                          aria-label={`Remove ${row.file.name}`}
                          title="Remove this row from the popup only. It does not delete uploaded documents."
                        >
                          {row.severity === "queued" ? "Remove" : "Dismiss"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkRepairInvoiceUploadModal;
