import { ExportResponse } from "@/interfaces/GlobalInterface";
import { postRequest } from "@/utils/api";

export const fetchExportData = async (body: Record<string, unknown>) => {
  return await postRequest<ExportResponse>("service-centre/export-claims", body);
};
