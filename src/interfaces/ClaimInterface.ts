import {
  DocumentItem,
  pickupTrackingInterface,
} from "@/interfaces/GlobalInterface";

export default interface Claim {
  id: number;
  name: string;
  status: string;
  date: string;
  estimated_date: string;
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
      date_of_damage?: string;
    };
    replacement_payment?: {
      replace_payment_successful: boolean;
      replace_razorpay_order_id: string;
      replace_payment_link: string;
      replace_payment_link_create_date: string;
      replace_amount: number;
    };
    accessory_provided?: string | boolean;
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
    "76"?: DocumentItem;
    "77"?: DocumentItem;
    "78"?: DocumentItem;
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
  service_centre_name: string;
  aadhar_photos?: string[];
  utr_number?: string;
  payment_date?: string;
  payment_amount?: string;
  plan_number?: string;
  plan_start_date?: string;
  plan_end_date?: string;
  model_name?: string;
  model_price?: string | number;
  copay_refunded?: boolean;
  copay_refunded_date?: string;
  copay_refunded_id?: string;
  copay_refunded_amount?: string | number;
  isActionRequired?: boolean;
  claim_type?: string;
  is_tvs_claim?: boolean;
  customer_pickup_details: CustomerPickupDetails | null;
  pickup_photos: string[] | null;
  pickup_video: string | null;
  pickup_tracking?: null | pickupTrackingInterface;
  shipping_receipt?: null | string;
  repaired_mobile_images?: string[] | null;
  shipping_info?: ShippingInfo | null;
  final_documents?: string;
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
    service_centre_name: string;
    damageDate?: string;
    pickup_details?: {
      is_tvs_claim?: boolean;
      customer_pickup_details: CustomerPickupDetails | null;
      pickup_photos: string[] | null;
      pickup_video: string | null;
    };
    shipping_info?: ShippingInfo | null;
  };
}

export interface ClaimResponse {
  success: boolean;
  code: number;
  locale: string;
  message: string;
  data: {
    claims: Claim[];
    totalCount?: number;
  };
}

export interface CustomerDocuments {
  aadharDocuments: {
    "76": DocumentItem | undefined;
    documents: string[] | undefined;
  };
  bankDetails: DocumentItem | undefined;
  panCard: DocumentItem | undefined;
  accessoriesProvided: string | undefined;
}

export interface CustomerDocumentsTabProps {
  documents: CustomerDocuments;
}

export interface SettlementDetailsProps {
  utr_number: string;
  payment_date: string;
  payment_amount: string;
}

export interface CustomerPickupDetails {
  id: number;
  claim_id: number;
  imei_number: string;
  pickup_address: string;
  pickup_landmark: string;
  pickup_alternate_mobile: number;
  pickup_pincode: number;
  created_at: string;
  updated_at: string;
}

export interface RepairedMobileSectionProps {
  repairedMobilePhotos: File[];
  setRepairedMobilePhotos: (files: File[]) => void;
  reuploadMobile: boolean;
  setReuploadMobile: (value: boolean) => void;
  repairMobilePhotoError: boolean;
  setRepairMobilePhotoError?: (value: boolean) => void;
  isInvalidRepairMobilePhoto: boolean;
  isInvalidRepairMobilePhotoReason: string;
  isInvalidRepairMobilePhotoStatus: boolean | null;
  finalDocuments: {
    repairMobilePhoto: string[] | null;
  };
  isMinThreeRepairImageRequired:boolean;
}

export interface FinalDocumentsSectionProps {
  repairInvoice: File[] | undefined;
  replacementReceipt: File[];
  handleRepairInvoiceUpload: (files: File[]) => void;
  handleReplacementReceiptUpload: (files: File[]) => void;
  reuploadFinalDocs: boolean;
  isInvalidRepairInvoice: boolean;
  isInvalidRepairInvoiceReason: string;
  isInvalidRepairInvoiceStatus: boolean | null;
  isValidRepairInvoice: boolean;
  isInvalidReplacementReceipt: boolean;
  isInvalidReplacementReceiptReason: string;
  isInvalidReplacementReceiptStatus: boolean | null;
  isValidReplacementReceipt: boolean;
  isImeiChanged: boolean;
  finalDocuments: {
    repairInvoiceImage: string;
    replacementReceiptImage: string;
    isImeiChanged: boolean;
  };
  repairInvoiceError: boolean;
  replacementReceiptError: boolean;
}

export interface DocumentErrorAlertsProps {
  isInvalidRepairInvoice: boolean;
  isInvalidRepairMobilePhoto: boolean;
  isInvalidReplacementReceipt: boolean;
  isImeiChanged: boolean;
  showRepairInvoiceError: boolean;
  showRepairMobilePhotoError: boolean;
  showReplacementReceiptError: boolean;
  repairInvoiceError: boolean;
  repairMobilePhotoError: boolean;
  replacementReceiptError: boolean;
  isInvalidRepairInvoiceReason: string;
  isInvalidRepairMobilePhotoReason: string;
  isInvalidReplacementReceiptReason: string;
  setShowRepairInvoiceError: (value: boolean) => void;
  setShowRepairMobilePhotoError: (value: boolean) => void;
  setShowReplacementReceiptError: (value: boolean) => void;
}

export interface DocumentActionButtonsProps {
  reuploadFinalDocs: boolean;
  showReuploadButton: boolean;
  finalDocuments: {
    repairInvoiceImage: string;
    replacementReceiptImage: string;
    isImeiChanged: boolean;
  };
  isImeiChanged: boolean;
  setReuploadFinalDocs: (value: boolean) => void;
  handleSubmit: () => void;
}

export interface FinalDocumentsViewProps {
  finalDocuments: {
    repairInvoiceImage?: string;
    repairMobilePhoto: string[] | null;
    replacementReceiptImage: string;
    isImeiChanged: boolean;
    shipmentReceipt?: string;
  };
}

export interface ShipmentDetailsSectionProps {
  isValidRepairMobilePhoto: boolean;
  repairedMobilePhotos: File[];
}

export interface EstimateDetailsTabProps {
  onSubmit: (formData: FormData) => void;
}

export interface ShippingInfo {
  shipment_id: number;
  shipment_claim_id: number;
  shipment_imei_number: string;
  shipment_model_name: string;
  shipment_issue_description: string;
  shipment_status: string;
  shipment_customer_id: number;
  shipment_customer_name: string;
  shipment_customer_phone: string;
  shipment_customer_alternate_phone: string;
  shipment_customer_email: string;
  shipment_customer_address_line_one: string;
  shipment_customer_address_landmark: string;
  shipment_customer_pincode: string;
  shipment_customer_city: string;
  shipment_customer_state: string;

  shipment_outbound_order_id: string;
  shipment_outbound_awb_number: string;
  shipment_outbound_courier_id: string;
  shipment_outbound_courier_name: string;
  shipment_outbound_warehouse_id: string;
  shipment_outbound_label_data: string;
  shipment_outbound_status: string;
  shipment_pickup_scheduled_date: string;

  shipment_inbound_order_id: string;
  shipment_inbound_awb_number: string;
  shipment_inbound_courier_id: string;
  shipment_inbound_courier_name: string;
  shipment_inbound_warehouse_id: string;
  shipment_inbound_label_data: string;
  shipment_inbound_status: string;

  shipment_delivery_scheduled_date: string;
  shipment_delivery_address_line_one: string;
  shipment_delivery_address_landmark: string;
  shipment_delivery_pincode: string;
  shipment_delivery_city: string;
  shipment_delivery_state: string;
  shipment_delivery_phone: string;
  shipment_delivery_alternate_phone: string;

  shipment_service_center_address_title: string;
  shipment_service_center_address_line_one: string;
  shipment_service_center_pin_code: string;
  shipment_service_center_city: string;
  shipment_service_center_state: string;
  shipment_service_center_phone: string;
  shipment_service_center_email: string;

  pickup_photos: string[];
}


