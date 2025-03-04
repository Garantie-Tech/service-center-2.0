import { DocumentItem } from "@/interfaces/GlobalInterface";

export default interface Claim {
  id: number;
  name: string;
  status: string;
  date: string;
  srn?: string;
  followUp?: string;
  time?: string;
  created_at: string;
  product: string;
  imei_number: string;
  copayment_amount: string | number;
  data?: {
    inputs?: {
      damage_details?: string;
      estimate_details?: string;
    };
  };
  claimed_amount?: string;
  job_sheet_number?: string;
  imei_changed?: boolean;
  mobile_damage_photos?: File[];
  documents?: {
    "15"?: DocumentItem;
    "73"?: DocumentItem;
    "16"?: DocumentItem;
    "74"?: DocumentItem;
    "75"?: DocumentItem;
  };
  approved_amount?: string;
  approval_date?: string;
  repair_amount?: number;
  repair_payment_successful?: boolean;
  repair_payment_link?: string;
  repair_razorpay_order_id?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  revisable?: boolean;
  cancellable?: boolean;
  is_rejected?: boolean;
  rejection_reason?: string;
  service_centre_id: number;
}

export interface ClaimDetailsProps {
  data: {
    claimDate: string;
    planType: string;
    imei: string;
    coPay: {
      amount: string | number;
    };
    claimDetails?: string;
  };
}

// export interface ClaimEstimateViewProps {
//   estimateAmount:string;
//   jobSheetNumber: string;
//   estimateDetails: string;
//   replacementConfirmed: "yes" | "no" | null;
//   damagePhotos: (string | File)[];
//   estimateDocument: File | string | null;
// }
