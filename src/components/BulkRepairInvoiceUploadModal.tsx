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
  invoiceNo: string;
  severity: BulkRepairInvoiceSeverity;
  claimId: number | null;
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
  invoiceNo: "N/A",
  severity: "queued",
  claimId: null,
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

const firstFilled = (...values: Array<string | null | undefined>): string | null => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

const invoiceNoFromResult = (result: BulkRepairInvoiceUploadResult): string =>
  firstFilled(
    result.invoice_no,
    result.invoice_number,
    result.extracted?.invoice_no,
    result.extracted?.invoice_number,
  ) ?? "N/A";

const BulkRepairInvoiceUploadModal: React.FC<
  BulkRepairInvoiceUploadModalProps
> = ({ isOpen, onClose, onComplete }) => {
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
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
  const canRunUpload = rows.length > 0 && hasQueuedRows;

  const updateRow = (id: string, changes: Partial<UploadRow>) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id ? { ...row, ...changes } : row,
      ),
    );
  };

  const addFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

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
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));

    if (event.target) {
      event.target.value = "";
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isProcessing) return;
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    if (isProcessing) return;
    addFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const processUploads = async () => {
    const rowsToProcess = rows.filter((row) => row.severity === "queued");

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
          invoiceNo: invoiceNoFromResult(result),
          claimId: result.claim_id ?? null,
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
                onClick={processUploads}
                disabled={isProcessing || !canRunUpload}
                className="rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:translate-y-0 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Upload"}
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
            <table className="min-w-[980px] text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-500 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold">Invoice No.</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">claim id</th>
                  <th className="px-4 py-3 font-semibold">Job Sheet / IMEI</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      <div
                        onClick={() => !isProcessing && inputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mx-auto max-w-sm cursor-pointer rounded-lg border border-dashed px-6 py-8 transition ${
                          isDraggingOver
                            ? "border-primaryBlue bg-blue-50"
                            : "border-slate-300 bg-slate-50 hover:border-primaryBlue hover:bg-blue-50/40"
                        }`}
                      >
                        <p className="font-semibold text-slate-700">
                          No invoices selected
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Drag and drop repair invoice PDFs here, or click to select files.
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
                      <td className="max-w-[260px] px-4 py-4 font-medium text-slate-900">
                        <span className="break-words">{row.invoiceNo}</span>
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
                        <p>{row.jobSheetNumber ?? "-"}</p>
                        <p className="text-[11px] text-slate-500">
                          {row.imei ?? ""}
                        </p>
                      </td>
                      <td className="min-w-[320px] px-4 py-4 text-slate-700">
                        {row.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 0 && (
            <div
              onClick={() => !isProcessing && inputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-lg border border-dashed px-6 py-8 text-center transition ${
                isDraggingOver
                  ? "border-primaryBlue bg-blue-50"
                  : "border-slate-300 bg-slate-50 hover:border-primaryBlue hover:bg-blue-50/40"
              } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
            >
              <p className="font-semibold text-slate-700">
                Add more repair invoices
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Drag and drop repair invoice PDFs here, or click to select files.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkRepairInvoiceUploadModal;
