"use client";

import SearchableServiceCentreDropdown from "@/components/ui/SearchableServiceCentreDropdown";
import { isServiceHeadUserType } from "@/helpers/globalHelper";
import {
  fetchServiceHeadServiceCentres,
  ServiceCentreOption,
} from "@/services/claimService";
import { useAuthStore } from "@/store/authStore";
import { useGlobalStore } from "@/store/store";
import { useEffect, useMemo, useState } from "react";

const ServiceCenterMultiSelectDropdown: React.FC = () => {
  const filterState = useGlobalStore((state) => state.filterState);
  const filterServiceCentre = useGlobalStore(
    (state) => state.filterServiceCentre,
  );
  const setFilterServiceCentre = useGlobalStore(
    (state) => state.setFilterServiceCentre,
  );
  const stateOptions = useGlobalStore((state) => state.stateOptions);
  const isLoading = useGlobalStore((state) => state.isLoading);
  const userType = useAuthStore((state) => state.user.user_type);
  const [serviceCentres, setServiceCentres] = useState<ServiceCentreOption[]>([]);
  const [loadError, setLoadError] = useState("");

  const selectedValues = useMemo(
    () => filterServiceCentre.split(",").filter(Boolean),
    [filterServiceCentre],
  );
  const selectedStateIds = useMemo(() => {
    const ids = filterState.split(",").filter(Boolean);
    return ids.length > 0 ? ids : Object.keys(stateOptions ?? {});
  }, [filterState, stateOptions]);
  const selectedStateIdsKey = selectedStateIds.join(",");

  useEffect(() => {
    const requestedStateIds = selectedStateIdsKey.split(",").filter(Boolean);

    if (!isServiceHeadUserType(userType) || requestedStateIds.length === 0) {
      setServiceCentres([]);
      return;
    }

    let isActive = true;

    const loadServiceCentres = async () => {
      setLoadError("");

      try {
        const response = await fetchServiceHeadServiceCentres(requestedStateIds);
        if (!isActive) return;

        if (!response.success) {
          setServiceCentres([]);
          setLoadError(response.error ?? "Unable to load Service Centres.");
          return;
        }

        setServiceCentres(response.data?.data ?? []);
      } catch (error) {
        console.error("Failed to load service centres:", error);
        if (isActive) {
          setServiceCentres([]);
          setLoadError("Unable to load Service Centres.");
        }
      }
    };

    void loadServiceCentres();

    return () => {
      isActive = false;
    };
  }, [selectedStateIdsKey, userType]);

  useEffect(() => {
    const validSelections = selectedValues.filter((id) =>
      serviceCentres.some((option) => String(option.value) === id),
    );

    if (validSelections.join(",") !== selectedValues.join(",")) {
      setFilterServiceCentre(validSelections.join(","));
    }
  }, [selectedValues, serviceCentres, setFilterServiceCentre]);

  if (!isServiceHeadUserType(userType)) return null;

  return (
    <div className="w-full">
      <SearchableServiceCentreDropdown
        options={serviceCentres}
        selectedValues={selectedValues}
        onChange={(values) => setFilterServiceCentre(values.join(","))}
        multiple
        disabled={isLoading || Boolean(loadError)}
        loading={isLoading}
        placeholder="Select Service Centres"
        emptyMessage="No Service Centres found for the selected states"
      />
      {loadError && (
        <p className="mt-1 text-[10px] text-red-600">{loadError}</p>
      )}
    </div>
  );
};

export default ServiceCenterMultiSelectDropdown;
