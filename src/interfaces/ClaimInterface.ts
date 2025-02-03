export default interface Claim {
  id: number;
  name: string;
  status: string;
  date: string;
  srn?: string;
  followUp?: string;
  time?: string;
  created_at: string;
  data?: Record<string, unknown>;
}
