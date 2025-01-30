export default interface Claim {
  id: number;
  customer_name: string;
  status: string;
  date: string;
  srn?: string;
  followUp?: string;
  time?: string;
}