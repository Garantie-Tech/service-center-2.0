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
    };
  };
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
