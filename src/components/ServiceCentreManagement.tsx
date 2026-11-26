"use client";

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

const ServiceCentreManagement: React.FC = () => {
  const userType = useAuthStore((state) => state.user.user_type);
  const stateOptions = useGlobalStore((state) => state.stateOptions);
  const [serviceCentres, setServiceCentres] = useState<ServiceCentreOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const stateIds = useMemo(() => Object.keys(stateOptions ?? {}), [stateOptions]);

  useEffect(() => {
    if (userType !== "service_head" || stateIds.length === 0) {
      setServiceCentres([]);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchServiceHeadServiceCentres(stateIds);
        const centres = response.data?.data ?? [];
        setServiceCentres(centres);

        if (centres.length > 0) {
          setSelectedId(String(centres[0].value));
        }
      } catch {
        setError("Unable to load Service Centres.");
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [stateIds, userType]);

  const selectedCentre = serviceCentres.find(
    (centre) => String(centre.value) === selectedId,
  );

  useEffect(() => {
    if (!selectedCentre) {
      setForm(emptyForm);
      return;
    }

    setForm({
      mobile: selectedCentre.mobile ?? "",
      address_line_1: selectedCentre.address?.address_line_1 ?? "",
      address_line_2: selectedCentre.address?.address_line_2 ?? "",
    });
    setIsEditing(false);
    setError("");
  }, [selectedCentre]);

  if (userType !== "service_head") return null;

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSave = async () => {
    if (!selectedId) return;

    const mobile = form.mobile.trim();
    const addressLine1 = form.address_line_1.trim();

    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!addressLine1) {
      setError("Address line 1 is required.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await updateServiceHeadServiceCentre(Number(selectedId), {
        mobile,
        address_line_1: addressLine1,
        address_line_2: form.address_line_2.trim(),
      });

      const updatedCentre = response.data?.data;

      if (!response.success || !updatedCentre) {
        setError(
          response.error ??
            response.data?.message ??
            "Unable to update Service Centre details.",
        );
        return;
      }

      setServiceCentres((current) =>
        current.map((centre) =>
          centre.value === Number(selectedId) ? updatedCentre : centre,
        ),
      );
      setIsEditing(false);
    } catch {
      setError("Unable to update Service Centre details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="border-b pb-8 mb-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-black">
            Service Centre Management
          </h3>
          <p className="text-xs text-[#757575] mt-1">
            Update phone and address details for Service Centres assigned to your states.
          </p>
        </div>
        <span className="text-xs text-[#757575]">Service Head access</span>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#757575]">Loading Service Centres...</p>
      ) : serviceCentres.length === 0 ? (
        <p className="text-sm text-[#757575]">
          No Service Centres are available in your assigned states.
        </p>
      ) : (
        <div className="space-y-5 max-w-3xl">
          <div>
            <label className="block text-xs font-medium mb-1 text-black">
              Service Centre
            </label>
            <select
              value={selectedId}
              disabled={isEditing || isSaving}
              onChange={(event) => setSelectedId(event.target.value)}
              className="select select-bordered text-sm w-full bg-inputBg"
            >
              {serviceCentres.map((centre) => (
                <option key={centre.value} value={centre.value}>
                  {centre.title} — {centre.city}, {centre.state}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium mb-1 text-black">
                Service Centre Phone
              </label>
              <input
                value={form.mobile}
                disabled={!isEditing || isSaving}
                onChange={(event) => updateField("mobile", event.target.value)}
                className="input input-bordered text-sm w-full bg-inputBg"
                inputMode="numeric"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-black">
                Pincode
              </label>
              <input
                value={selectedCentre?.pincode ?? ""}
                disabled
                className="input input-bordered text-sm w-full bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-black">
              Address line 1
            </label>
            <input
              value={form.address_line_1}
              disabled={!isEditing || isSaving}
              onChange={(event) => updateField("address_line_1", event.target.value)}
              className="input input-bordered text-sm w-full bg-inputBg"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-black">
              Address line 2
            </label>
            <input
              value={form.address_line_2}
              disabled={!isEditing || isSaving}
              onChange={(event) => updateField("address_line_2", event.target.value)}
              className="input input-bordered text-sm w-full bg-inputBg"
              maxLength={255}
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3">
            {!isEditing ? (
              <button
                type="button"
                className="btn bg-primaryBlue text-white hover:bg-blue-700"
                onClick={() => setIsEditing(true)}
              >
                Edit Details
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn bg-primaryBlue text-white hover:bg-blue-700"
                  disabled={isSaving}
                  onClick={() => void handleSave()}
                >
                  {isSaving ? "Saving..." : "Save Details"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={isSaving}
                  onClick={() => {
                    if (selectedCentre) {
                      setForm({
                        mobile: selectedCentre.mobile ?? "",
                        address_line_1: selectedCentre.address?.address_line_1 ?? "",
                        address_line_2: selectedCentre.address?.address_line_2 ?? "",
                      });
                    }
                    setError("");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ServiceCentreManagement;
