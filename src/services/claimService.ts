import { ClaimResponse } from "@/interfaces/ClaimInterface";
import type { AdditionalDocumentSubType } from "@/interfaces/ClaimInterface";
import {
  BerDecision,
  CancelClaim,
  ClaimFetchPayload,
  ClaimTimeline,
  GenerateLinkPaymentBody,
  GeneratePaymentLink,
  ImeiApi,
  PickupTrackingResponse,
  PolicyApiResponse,
  RemarkPayload,
  RemarksApiResponse,
  ServiceCenterProfileResponse,
  SubmitEstimate,
  UploadCustomerDocuments,
  UploadFinalDocuments,
} from "@/interfaces/GlobalInterface";
import { getRequest, postRequest } from "@/utils/api";

interface ClaimCancelReasonResponse {
  success: boolean;
  data: Record<string, string>;
}

export interface NoidaOfficeShipmentBatchResponse {
  success: boolean;
  status?: boolean;
  message: string;
  data?: {
    queued?: boolean;
    batch?: {
      id: number;
      batch_ref: string;
      status: string;
      requested_count: number;
      processed_count: number;
      success_count: number;
      failed_count: number;
      skipped_count: number;
    };
    result?: {
      claim_id?: number;
      success?: boolean;
      success_count?: number;
      failed_count?: number;
      skipped_count?: number;
      results?: Array<{
        claim_id?: number;
        success?: boolean;
        message?: string;
        reason_type?: string;
      }>;
      message?: string;
    };
  };
}

export interface NoidaOfficeShipmentCancelResponse {
  success: boolean;
  status?: boolean;
  status_code?: number;
  message: string;
  data?: {
    success?: boolean;
    already_cancelled?: boolean;
    claim_ids?: number[];
    shipment?: {
      id: number;
      status: string;
      order_id?: string | null;
      awb_number?: string | null;
    };
    response?: Record<string, unknown>;
  };
}

export interface NoidaOfficeShipmentConfig {
  destination: {
    name: string;
    address_line_one: string;
    address_line_two: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    alternate_phone: string;
    email: string;
  };
  source_addresses: ShipmentAddressForm[];
  allowed_source_states: string[];
  eligible_status_bodies: string[];
  batch_limit: number;
  shipment_defaults?: {
    weight?: number | string;
    length?: number | string;
    width?: number | string;
    height?: number | string;
    order_amount?: number | string;
    type_of_package?: string;
    rov_type?: string;
    no_of_box?: number | string;
  };
  configured: boolean;
}

export interface NoidaOfficeShipmentConfigResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: NoidaOfficeShipmentConfig;
}

export interface ServiceCentreDetail {
  id: number;
  title: string;
  value: number;
  name: string;
  mobile: string;
  email: string;
  address: Record<string, unknown>;
  address_line_one: string;
  address_line_two: string;
  city: string;
  state: string;
  pincode: string;
  state_id: number | null;
}

export interface ServiceCentreDetailResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: ServiceCentreDetail;
}

export interface ShipmentAddressForm {
  address_title: string;
  service_centre_id?: number | null;
  state_id?: number | null;
  name: string;
  phone: string;
  alternate_phone: string;
  email: string;
  address_line_one: string;
  address_line_two: string;
  pincode: string;
  city: string;
  state: string;
}

export interface ShipmentBuilderPayload {
  destination: ShipmentAddressForm;
  source_address?: ShipmentAddressForm;
  source_addresses?: Record<number, ShipmentAddressForm>;
  selected_courier_id?: number;
  selected_courier?: NoidaOfficeShipmentCourier;
  process_now?: boolean;
}

export interface NoidaOfficeShipmentCourier {
  id: number;
  name: string;
  total_charges: number;
  estimated_delivery?: string | number | null;
}

export interface NoidaOfficeShipmentCourierResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    couriers: NoidaOfficeShipmentCourier[];
    package: {
      claim_ids: number[];
      claim_count: number;
      weight: number;
      pickup_pincode: string;
      delivery_pincode: string;
    };
  };
}

export const fetchClaims = async (
  _params?: Record<string, string | number | boolean> | ClaimFetchPayload,
) => {
  return await getRequest<ClaimResponse>("claims", _params);
};

export const fetchShipmentEligibleClaims = async (
  params?: Record<string, string | number | boolean> | ClaimFetchPayload,
) => {
  return await getRequest<ClaimResponse>("noida-office-shipment/eligible-claims", {
    ...(params ?? {}),
    shipment_mode: true,
  });
};

export const fetchNoidaOfficeShipmentConfig = async () => {
  return await getRequest<NoidaOfficeShipmentConfigResponse>(
    "noida-office-shipment/config",
  );
};

export const fetchNoidaOfficeShipmentCouriers = async (
  claimIds: number[],
  payload: Pick<ShipmentBuilderPayload, "destination" | "source_address">,
) => {
  return await postRequest<NoidaOfficeShipmentCourierResponse>(
    "noida-office-shipment/couriers",
    {
      claim_ids: claimIds,
      ...payload,
    },
  );
};

export const fetchServiceCentreDetail = async (serviceCentreId: number) => {
  return await getRequest<ServiceCentreDetailResponse>(
    `service-centres/${serviceCentreId}`,
  );
};

export interface ServiceCentreOption {
  title: string;
  value: number;
}

export interface ServiceCentreResponse {
  success: boolean;
  status?: boolean;
  message: string;
  data: ServiceCentreOption[];
}

export const fetchServiceCentres = async (stateIds: string[]) => {
  return await getRequest<ServiceCentreResponse>("service-centres", {
    state_id: stateIds.join(","),
  });
};

export const fetchServiceHeadServiceCentres = async (stateIds: string[]) => {
  return await getRequest<ServiceCentreResponse>("head/service-centres", {
    state_id: stateIds.join(","),
  });
};

export const initiateNoidaOfficeShipment = async (
  claimId: number,
  payload?: Partial<ShipmentBuilderPayload>,
) => {
  return await postRequest<NoidaOfficeShipmentBatchResponse>(
    "noida-office-shipment",
    {
      claim_id: claimId,
      ...(payload ?? {}),
    },
  );
};

export const bulkInitiateNoidaOfficeShipment = async (
  claimIds: number[],
  payload?: Partial<ShipmentBuilderPayload>,
) => {
  return await postRequest<NoidaOfficeShipmentBatchResponse>(
    "noida-office-shipment/bulk",
    {
      claim_ids: claimIds,
      ...(payload ?? {}),
    },
  );
};

export const cancelNoidaOfficeShipment = async (claimId: number) => {
  return await postRequest<NoidaOfficeShipmentCancelResponse>(
    `noida-office-shipment/${claimId}/cancel`,
    {},
  );
};

export const submitEstimate = async (claimID: number, body: FormData) => {
  const endpoint = `estimate/submit/${claimID}`;
  return await postRequest<SubmitEstimate>(endpoint, body);
};

export const handleBerDecision = async (
  claimID: number,
  berDecision: string,
  newDeviceAmount?: string,
) => {
  const endpoint = `claim/${claimID}/ber-decision`;
  const body: Record<string, string> = {
    update_type: "ber_decision",
    ber_decision: berDecision,
  };

  if (newDeviceAmount) {
    body.new_device_amount = newDeviceAmount;
  }

  try {
    const response = await postRequest<BerDecision>(endpoint, body);
    return response;
  } catch (error) {
    console.error("Error updating BER decision:", error);
    throw error;
  }
};

export const fetchClaimCancelReason =
  async (): Promise<ClaimCancelReasonResponse> => {
    try {
      const response = await getRequest("claims/cancel-reasons");

      if (response && response.success) {
        return response as ClaimCancelReasonResponse; // Explicitly cast response
      }

      return { success: false, data: {} };
    } catch (error) {
      console.error("Error fetching claim cancel reasons:", error);
      return { success: false, data: {} };
    }
  };

/** Device replacement details sent with final-document/submit API */
export interface DeviceReplacementForSubmit {
  is_imei_updated: boolean;
  new_imei_number?: string;
  imei_update_reason?: string;
}

export const uploadFinalDocuments = async (claimID: number, body: FormData) => {
  const endpoint = `final-document/submit/${claimID}`;
  return await postRequest<UploadFinalDocuments>(endpoint, body);
};

export interface DeviceReplacementPayload {
  imei_changed: boolean;
  new_imei_number?: string;
  imei_update_reason?: string;
}

export const submitDeviceReplacement = async (
  claimID: number,
  body: DeviceReplacementPayload,
) => {
  const endpoint = `final-document/device-replacement/${claimID}`;
  return await postRequest<{
    success: boolean;
    data?: { imei_changed: boolean; new_imei_number: string | null };
  }>(endpoint, body);
};

export const handleCancelClaim = async (claimID: number, reason: string) => {
  const endpoint = `claim/${claimID}/cancel`;
  const body: Record<string, string> = {
    cancellation_reason: reason,
    cancelled_by: "Service Centre",
    update_type: "cancel_claim",
  };

  try {
    const response = await postRequest<CancelClaim>(endpoint, body);
    return response;
  } catch (error) {
    console.error("Error Canceling Claim:", error);
    throw error;
  }
};

export const generatePaymentLink = async (
  claimID: number,
  paymentType: string,
  type: string,
) => {
  const endpoint = `repair/payments/link`;
  const body: GenerateLinkPaymentBody = {
    entity_id: claimID,
    payment_type: paymentType,
    entity: type,
    is_monthly: false,
    is_recurring: false,
    payment_method: false,
  };

  try {
    const response = await postRequest<GeneratePaymentLink>(endpoint, body);
    return response;
  } catch (error) {
    console.error("Error Generating Payment Link:", error);
    throw error;
  }
};

export const fetchTimeline = async (
  claimId: string | number,
  _params?: Record<string, string | number | boolean> | ClaimFetchPayload,
) => {
  return await getRequest<ClaimTimeline>(`claims/${claimId}/timeline`, _params);
};

export const uploadCustomerDocuments = async (
  claimID: number,
  body: FormData,
) => {
  const endpoint = `customer-documents/submit/${claimID}`;
  return await postRequest<UploadCustomerDocuments>(endpoint, body);
};

export const fetchAdditionalDocumentSubTypes = async () => {
  const endpoint = "additional-document-subtypes";
  return await getRequest<{
    success: boolean;
    data: { sub_document_types: AdditionalDocumentSubType[] };
  }>(endpoint);
};

export const uploadAdditionalDocuments = async (
  claimID: number,
  body: FormData,
) => {
  const endpoint = `claims/${claimID}/additional-documents`;
  return await postRequest<{
    success: boolean;
    data: { claim_id: number; additional_documents: unknown };
  }>(endpoint, body);
};

export const fetchRemarks = async (
  claimId: string | number,
  _params?:
    | Record<string, string | number | boolean>
    | ClaimFetchPayload
    | RemarksApiResponse,
) => {
  return await getRequest<RemarksApiResponse>(
    `claims/${claimId}/remarks`,
    _params,
  );
};

export const addRemark = async (
  claimId: number,
  addedBy: string,
  remark: string,
) => {
  const endpoint = `claims/${claimId}/remarks`;
  const body: RemarkPayload = {
    added_by_platform: addedBy,
    remark: remark,
  };

  try {
    const response = await postRequest<{ success: boolean }>(endpoint, body);
    return response;
  } catch (error) {
    console.error("Error Adding Remark:", error);
    throw error;
  }
};

export const getServiceCenterProfileData = async () => {
  return await getRequest<ServiceCenterProfileResponse>("detail");
};

export const fetchPlans = async (
  _params?:
    | Record<string, string | number | boolean>
    | ClaimFetchPayload
    | { string: "search_plan" },
) => {
  return await getRequest<PolicyApiResponse>(`orders`, _params);
};

// New function to validate estimate document
export const validateEstimateDocument = async (
  claimId: number,
  base64Pdf: string,
) => {
  try {
    const { externalApiRequest } = await import("@/utils/api");

    const EXTERNAL_API_BASE_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL_PY || "https://pyqa.garantie.in/api";

    const response = await externalApiRequest<{
      success: boolean;
      message: string;
      status: string;
    }>(EXTERNAL_API_BASE_URL, "verify-estimate-document", "POST", {
      claim_id: claimId,
      doc_type: "claim",
      is_verify_doc: true,
      base64_pdf: base64Pdf,
    });

    if (!response.success) {
      return {
        success: false,
        message: response.error || "Document validation failed",
        status: "error",
      };
    }

    // Check if the API response indicates failure
    if (response.data?.status === "failure") {
      return {
        success: false,
        message: response.data?.message || "Document validation failed",
        status: "failure",
      };
    }

    return {
      success: response.data?.success || false,
      message: response.data?.message || "Document validation failed",
      status: response.data?.status || "error",
    };
  } catch (error) {
    console.error("Error validating document:", error);
    throw error;
  }
};

export const handlePickupTrackingStatus = async (
  claimID: number,
  pickup_status: string,
) => {
  const endpoint = `handle-pickup/${claimID}`;
  const body: Record<string, string> = {
    pickup_status: pickup_status,
  };

  try {
    const response = await postRequest<PickupTrackingResponse>(endpoint, body);
    return response;
  } catch (error) {
    console.error("Error marking ready for pickup:", error);
    throw error;
  }
};

export const validateImeiFromImage = async (
  claimId: number,
  file: File | string,
) => {
  try {
    const { externalApiRequest } = await import("@/utils/api");

    const EXTERNAL_API_BASE_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL_PY || "https://pyqa.garantie.in/api";

    const formData = new FormData();
    formData.append("claim_id", String(claimId));
    formData.append("damage_image", file);
    formData.append("flag", "DAMAGE_IMAGE");

    const response = await externalApiRequest<ImeiApi>(
      EXTERNAL_API_BASE_URL,
      "aws-fetch-imei-damage-image",
      "POST",
      formData,
    );

    if (!response.success) {
      return {
        success: false,
        message: response.error || "Document validation failed",
        status: "error",
        imeis: [],
        is_image_valid: false,
      };
    }

    const res = response.data;
    const { imeis, is_image_valid, status, message } = res || {};

    return {
      success: status === "success" && is_image_valid === true,
      message: message || "Document validation failed",
      status: status || "error",
      imeis: imeis || [],
      is_image_valid: is_image_valid ?? false,
    };
  } catch (error) {
    console.error("Error validating document:", error);
    return {
      success: false,
      message: "Error validating document",
      status: "error",
      imeis: [],
      is_image_valid: false,
    };
  }
};

export const saveAccessoryProvided = async (
  claimID: number,
  accessoryProvided: "yes" | "no",
) => {
  const endpoint = `customer-documents/accessory-provided/${claimID}`;
  return await postRequest<UploadCustomerDocuments>(endpoint, {
    accessory_provided: accessoryProvided,
  });
};
