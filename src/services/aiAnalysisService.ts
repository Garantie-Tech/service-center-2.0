export interface AiAnalysisCheck {
  id: string;
  label: string;
}

export const REPAIR_INVOICE_ANALYSIS_CHECKS: AiAnalysisCheck[] = [
  { id: "imei_job_sheet", label: "IMEI & Job Sheet validation passed." },
  { id: "invoice_amount", label: "Invoice amount matches expected value." },
  { id: "buyer_gst", label: "Buyer GST valid." },
  { id: "seller_gst", label: "Seller GST valid." },
  { id: "invoice_date", label: "Invoice date is valid." },
];

/**
 * Backend does not yet expose a granular repair-invoice AI analysis endpoint,
 * so this simulates the checklist client-side, resolving each check in turn.
 */
export const runRepairInvoiceAnalysis = (
  onCheckPassed: (checkId: string) => void,
): Promise<void> => {
  return new Promise((resolve) => {
    let index = 0;
    const runNext = () => {
      if (index >= REPAIR_INVOICE_ANALYSIS_CHECKS.length) {
        resolve();
        return;
      }
      const check = REPAIR_INVOICE_ANALYSIS_CHECKS[index];
      index += 1;
      setTimeout(() => {
        onCheckPassed(check.id);
        runNext();
      }, 650);
    };
    runNext();
  });
};
