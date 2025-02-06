import { ExportData } from "@/interfaces/GlobalInterface";

export const exportToCSV = (data: ExportData[], filename = "exported_data.csv"): void => {
  if (!data || data.length === 0) {
    return;
  }

  const headers = Object.keys(data[0]).join(",") + "\n";
  const rows = data.map(row => 
    Object.values(row).map(value => `"${value}"`).join(",")
  ).join("\n");

  const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
