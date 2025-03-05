"use client";

import { create } from "zustand";
import Claim from "@/interfaces/ClaimInterface";
import { SortByOptions, SortOrder } from "@/interfaces/ClaimFilterInterfaces";
import { EstimateDetailsState, Tab } from "@/interfaces/GlobalInterface";

interface FilterProps {
  fromDate: string;
  toDate: string;
  claimTypes: {
    myClaims: boolean;
    otherClaims: boolean;
    pendingClaims: boolean;
  };
}

type AppliedFilters = FilterProps;

interface StoreType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  claims: Claim[];
  setClaims: (claims: Claim[]) => void;

  filteredClaims: Claim[];
  setFilteredClaims: (
    claims: Claim[] | ((prevClaims: Claim[]) => Claim[])
  ) => void;

  selectedClaim: Claim | null;
  setSelectedClaim: (
    claim: Claim | null | ((prevClaim: Claim | null) => Claim | null)
  ) => void;

  claimStatus: string;
  setClaimStatus: (claimStatus: string) => void;

  claimRevised: boolean;
  setClaimRevised: (claimRevised: boolean) => void;

  searchTerm: string;
  setSearchTerm: (term: string) => void;

  globalSearch: string;
  setGlobalSearch: (search: string) => void;

  filterStatus: string;
  setFilterStatus: (status: string) => void;

  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;

  isSortingOpen: boolean;
  setIsSortingOpen: (open: boolean) => void;

  isFilterOpen: boolean;
  toggleFilter: () => void;

  fromDate: string;
  setFromDate: (date: string) => void;

  toDate: string;
  setToDate: (date: string) => void;

  claimTypes: {
    myClaims: boolean;
    otherClaims: boolean;
    pendingClaims: boolean;
  };
  setClaimTypes: (types: {
    myClaims: boolean;
    otherClaims: boolean;
    pendingClaims: boolean;
  }) => void;

  claimStatuses: Record<string, string>;
  selectedDropdown: string;
  setSelectedDropdown: (dropdown: string) => void;

  sortBy: SortByOptions;
  setSortBy: (sortKey: SortByOptions) => void;

  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;

  handleSearch: () => void;
  handleFilterChange: (filter: string) => void;
  handleSortingChange: (sortBy: SortByOptions, order: SortOrder) => void;
  appliedFilters: AppliedFilters | null;
  setAppliedFilters: (filters: AppliedFilters) => void;
  applyFilters: (filters: AppliedFilters) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  estimateDetailsState: EstimateDetailsState;
  setEstimateDetailsState: (
    updatedState: Partial<EstimateDetailsState>
  ) => void;
  resetEstimateDetailsState: () => void;
  // Approval Details State
  approvalDetails: {
    estimateAmount: number;
    approvedAmount: number;
    approvalType: string;
    deviceAmount?: string;
    berDecision?: string;
    approvalDate?: string;
    repairAmount?: number;
    repairPaymentSuccessful?: boolean;
    repairPaymentLink?: string;
    repairRazorpayOrderId?: string;
    estimateDate?: string;
  };
  setApprovalDetails: (
    updatedDetails: Partial<StoreType["approvalDetails"]>
  ) => void;
  refreshClaimsTrigger: number;
  triggerClaimRefresh: () => void;
}

export const useGlobalStore = create<StoreType>((set, get) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  claims: [],
  setClaims: (claims) => set({ claims, filteredClaims: claims }),

  filteredClaims: [],
  setFilteredClaims: (claims) =>
    set((state) => ({
      filteredClaims:
        typeof claims === "function"
          ? claims(state.filteredClaims || [])
          : claims || [],
    })),

  selectedClaim: null,
  setSelectedClaim: (claim) =>
    set((state) => ({
      selectedClaim:
        typeof claim === "function" ? claim(state.selectedClaim) : claim,
    })),

  claimStatus: "",
  setClaimStatus: (claimStatus) => set({ claimStatus }),

  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),

  filterStatus: "",
  setFilterStatus: (status) => set({ filterStatus: status }),

  isDropdownOpen: false,
  setIsDropdownOpen: (open) => set({ isDropdownOpen: open }),

  isSortingOpen: false,
  setIsSortingOpen: (open) => set({ isSortingOpen: open }),

  isFilterOpen: false,
  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),

  fromDate: "",
  setFromDate: (date) => set({ fromDate: date }),

  toDate: "",
  setToDate: (date) => set({ toDate: date }),

  claimTypes: {
    myClaims: false,
    otherClaims: false,
    pendingClaims: false,
  },
  setClaimTypes: (types) => set({ claimTypes: types }),

  claimStatuses: {
    "ALL CLAIMS": "All Claims",
    NEW: "Estimate Pending",
    "IN PROGRESS": "Approval Pending",
    APPROVED: "Approved",
    "PAYMENT PENDING": "Payment Pending",
    REJECTED: "Rejected",
    CLOSED: "Completed",
    CANCELLED: "Cancelled",
  },

  selectedDropdown: "All Claims",
  setSelectedDropdown: (dropdown) => set({ selectedDropdown: dropdown }),

  sortBy: "SRN",
  setSortBy: (sortKey: SortByOptions) => set({ sortBy: sortKey }),

  sortOrder: "Ascending",
  setSortOrder: (order: "Ascending" | "Descending") =>
    set({ sortOrder: order }),

  globalSearch: "",
  setGlobalSearch: (search) => set({ globalSearch: search }),

  handleSearch: () => {
    const { searchTerm, setGlobalSearch } = get();
    setGlobalSearch(searchTerm);
  },

  handleFilterChange: (filter) => {
    const { claims, setFilterStatus, setFilteredClaims } = get();
    setFilterStatus(filter);
    if (filter === "ALL CLAIMS") {
      setFilteredClaims(claims);
    } else {
      setFilteredClaims(
        claims.filter(
          (claim) => claim.status.toLowerCase() === filter.toLowerCase()
        )
      );
    }
  },

  handleSortingChange: (sortBy, order) => {
    const { filteredClaims, setFilteredClaims } = get();
    const sortedClaims = [...filteredClaims].sort((a, b) => {
      const valueA = a[sortBy as keyof Claim] ?? "";
      const valueB = b[sortBy as keyof Claim] ?? "";

      return order === "Ascending"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    setFilteredClaims(sortedClaims);
  },

  applyFilters: (filters) => {
    const { claims, setFilteredClaims } = get();
    const { fromDate, toDate } = filters;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    set({ appliedFilters: filters });

    const filteredResults = claims.filter((claim) => {
      const claimDate = new Date(claim?.created_at);
      return claimDate >= from && claimDate <= to;
    });

    setFilteredClaims(filteredResults);
  },
  activeTab: "Claim Details",
  setActiveTab: (tab: Tab) => set({ activeTab: tab }),
  estimateDetailsState: {
    estimateAmount: "",
    jobSheetNumber: "",
    estimateDetails: "",
    replacementConfirmed: "no",
    damagePhotos: [],
    estimateDocument: null,
  },
  setEstimateDetailsState: (updatedState) => {
    const currentState = get().estimateDetailsState;
    set({ estimateDetailsState: { ...currentState, ...updatedState } });
  },
  resetEstimateDetailsState: () =>
    set({
      estimateDetailsState: {
        estimateAmount: "",
        jobSheetNumber: "",
        estimateDetails: "",
        replacementConfirmed: null,
        damagePhotos: [],
        estimateDocument: null,
      },
    }),
  // Approval Details State
  approvalDetails: {
    estimateAmount: 0,
    approvedAmount: 0,
    approvalType: "",
    deviceAmount: "",
    berDecision: "",
    approvalDate: "",
    repairAmount: 0,
    repairPaymentSuccessful: false,
    repairPaymentLink: "",
    repairRazorpayOrderId: "",
  },
  setApprovalDetails: (updatedDetails) =>
    set((state) => ({
      approvalDetails: { ...state.approvalDetails, ...updatedDetails },
    })),
  appliedFilters: null,

  setAppliedFilters: (filters) => set({ appliedFilters: filters }),
  refreshClaimsTrigger: 0,
  triggerClaimRefresh: () =>
    set((state) => ({ refreshClaimsTrigger: state.refreshClaimsTrigger + 1 })),
  claimRevised: false,
  setClaimRevised:  (claimRevised) => set({ claimRevised: claimRevised }),
}));
