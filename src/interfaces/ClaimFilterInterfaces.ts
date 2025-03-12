import { SORT_OPTIONS } from "@/globalConstant";


export type SortByOptions = (typeof SORT_OPTIONS)[number]["key"]; // ✅ Extract valid keys
export type SortOptionLabel = (typeof SORT_OPTIONS)[number]["label"]; // ✅ Extract valid labels

export type SortOrder = "Asc" | "Desc";
