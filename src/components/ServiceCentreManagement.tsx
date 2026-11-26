"use client";

import SearchableServiceCentreDropdown from "@/components/ui/SearchableServiceCentreDropdown";
import useInitializeStates from "@/hooks/useInitializeStates";
import {
  fetchServiceHeadServiceCentres,
  ServiceCentreOption,
  updateServiceHeadServiceCentre,
} from "@/services/claimService";
import { useAuthStore } from "@/store/authStore";
import { useGlobalStore } from "@/store/store";
import React, { useEffect, useMemo, useState } from "react";

const emptyForm = {
  mobile: "",
  address_line_1: "",
  address_line_2: "",
};

type FormField = keyof typeof emptyForm;

const getFormValues = (centre?: ServiceCentreOption) => ({
  mobile: centre?.mobile ?? "",
  address_line_1: centre?.address?.address_line_1 ?? "",
  address_line_2: centre?.address?.address_line_2 ?? "",
});

const ServiceCentreManagement: React.FC = () => {
  useInitializeStates();

  const userType = useAuthStore((state) => state.user.user_type);
  const stateOptions = useGlobalStore((state) => state.stateOptions);
  const [serviceCentres, setServiceCentres] = useState<ServiceCentreOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const stateIds = useMemo(() => Object.keys(stateOptions ?? {}), [stateOptions]);
  const selectedCentre = serviceCentres.find(
    (centre) => String(centre.value) === selectedId,
  );

  useEffect(() => {
    if (userType !== "service_head") {
      setServiceCentres([]);
      return;
    }

    if (stateIds.length === 0) {
      setServiceCentres([]);
      setLoadError("Assigned state information is not available.");
      return;
    }

    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetchServiceHeadServiceCentres(stateIds);
        const centres = response.success ? response.data?.data ?? [] : [];

        if (!isActive) return;

        setServiceCentres(centres);
        setSelectedId((current) =>
          centres.some((centre) => String(centre.value) === current)
            ? current
            : centres.length > 0
              ? String(centres[0].value)
              : "",
        );

        if (!response.success) {
          setLoadError(response.error ?? "Unable to load Service Centres.");
        }
      } catch {
        if (isActive) setLoadError("Unable to load Service Centres.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [stateIds, userType]);

  useEffect(() => {
    setForm(getFormValues(selectedCentre));
    setIsEditing(false);
    setFormError("");
    setSuccessMessage("");
  }, [selectedCentre]);

  if (userType !== "service_head") return null;

  const updateField = (field: FormField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
    setSuccessMessage("");
  };

  const handleSave = async () => {
    if (!selectedCentre || isSaving) return;

    const mobile = form.mobile.trim();
    const addressLine1 = form.address_line_1.trim();
    const addressLine2 = form.address_line_2.trim();

    if (!/^\d{10}$/.test(mobile)) {
      setFormError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!addressLine1) {
      setFormError("Address line 1 is required.");
      return;
    }

    setIsSaving(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await updateServiceHeadServiceCentre(selectedCentre.value, {
        mobile,
        address_line_1: addressLine1,
        address_line_2: addressLine2,
      });
      const updatedCentre = response.data?.data;

      if (!response.success || !updatedCentre) {
        setFormError(
          response.error ??
            response.data?.message ??
            "Unable to update Service Centre details.",
        );
        return;
      }

      setServiceCentres((current) =>
        current.map((centre) =>
          centre.value === selectedCentre.value ? updatedCentre : centre,
        ),
      );
      setForm(getFormValues(updatedCentre));
      setIsEditing(false);
      setSuccessMessage("Service Centre details updated successfully.");
    } catch {
      setFormError("Unable to update Service Centre details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(getFormValues(selectedCentre));
    setFormError("");
    setSuccessMessage("");
    setIsEditing(false);
  };

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primaryBlue">
            Operations
          </p>
          <h2 className="text-2xl font-semibold text-black">Manage Service Centres</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Update contact details for Service Centres assigned to your states.
            Shipments and Service Head profile details are not changed here.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-primaryBlue">
          Service Head access
        </span>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-5 h-12 w-full animate-pulse rounded bg-gray-100" />
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="h-12 animate-pulse rounded bg-gray-100" />
            <div className="h-12 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {loadError}
        </div>
      ) : serviceCentres.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
          <h3 className="text-base font-semibold text-gray-800">
            No Service Centres available
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            No active Service Centres were found in your assigned states.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.45fr)]">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <SearchableServiceCentreDropdown
              label="Service Centre"
              options={serviceCentres}
              selectedValues={selectedId ? [selectedId] : []}
              onChange={(values) => {
                if (!isEditing && !isSaving) {
                  setSelectedId(values[0] ?? "");
                }
              }}
              disabled={isEditing || isSaving}
              loading={isLoading}
              placeholder="Search and select a Service Centre"
            />

            {selectedCentre && (
              <div className="mt-5 rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Selected Service Centre
                </p>
                <p className="mt-2 truncate text-base font-semibold text-gray-900">
                  {selectedCentre.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {[selectedCentre.city, selectedCentre.state]
                    .filter(Boolean)
                    .join(", ") || "Location not available"}
                </p>
                <p className="mt-3 text-xs text-gray-500">
                  Pincode: {selectedCentre.pincode || "Not available"}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Contact details</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Only phone and address fields can be updated.
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  className="btn min-h-10 bg-primaryBlue px-5 text-white hover:bg-blue-700"
                  onClick={() => {
                    setFormError("");
                    setSuccessMessage("");
                    setIsEditing(true);
                  }}
                >
                  Edit details
                </button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Service Centre phone
                </label>
                <input
                  value={form.mobile}
                  disabled={!isEditing || isSaving}
                  onChange={(event) => updateField("mobile", event.target.value)}
                  className="input input-bordered h-12 w-full bg-inputBg text-sm disabled:bg-gray-100"
                  inputMode="numeric"
                  maxLength={10}
                  aria-describedby="service-centre-contact-help"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Pincode
                </label>
                <input
                  value={selectedCentre?.pincode ?? "Not available"}
                  disabled
                  className="input input-bordered h-12 w-full bg-gray-100 text-sm text-gray-500"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Address line 1
              </label>
              <input
                value={form.address_line_1}
                disabled={!isEditing || isSaving}
                onChange={(event) => updateField("address_line_1", event.target.value)}
                className="input input-bordered h-12 w-full bg-inputBg text-sm disabled:bg-gray-100"
                maxLength={255}
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Address line 2 <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                value={form.address_line_2}
                disabled={!isEditing || isSaving}
                onChange={(event) => updateField("address_line_2", event.target.value)}
                className="input input-bordered h-12 w-full bg-inputBg text-sm disabled:bg-gray-100"
                maxLength={255}
              />
            </div>

            <p id="service-centre-contact-help" className="mt-3 text-xs text-gray-500">
              Mobile number must contain exactly 10 digits.
            </p>

            {formError && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {formError}
              </p>
            )}
            {successMessage && (
              <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
                {successMessage}
              </p>
            )}

            {isEditing && (
              <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  className="btn min-h-10 bg-primaryBlue px-5 text-white hover:bg-blue-700 disabled:bg-gray-300"
                  disabled={isSaving}
                  onClick={() => void handleSave()}
                >
                  {isSaving ? "Saving..." : "Save details"}
                </button>
                <button
                  type="button"
                  className="btn min-h-10 border border-gray-300 bg-white px-5 text-gray-700 hover:bg-gray-50"
                  disabled={isSaving}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ServiceCentreManagement;
