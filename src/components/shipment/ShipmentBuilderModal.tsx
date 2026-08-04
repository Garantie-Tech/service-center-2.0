"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Claim from "@/interfaces/ClaimInterface";
import type {
  NoidaOfficeShipmentConfig,
  NoidaOfficeShipmentCourier,
  ShipmentAddressForm,
  ShipmentBuilderPayload,
} from "@/services/claimService";
import {
  fetchNoidaOfficeShipmentConfig,
  fetchNoidaOfficeShipmentCouriers,
} from "@/services/claimService";

interface ShipmentBuilderModalProps {
  isOpen: boolean;
  claims: Claim[];
  onClose: () => void;
  onConfirm: (payload: ShipmentBuilderPayload) => Promise<boolean | void>;
}

const createEmptyAddressForm = (
  overrides: Partial<ShipmentAddressForm> = {},
): ShipmentAddressForm => ({
  address_title: "",
  service_centre_id: null,
  state_id: null,
  name: "",
  phone: "",
  alternate_phone: "",
  email: "",
  address_line_one: "",
  address_line_two: "",
  pincode: "",
  city: "",
  state: "",
  ...overrides,
});

const normalizeStateKey = (value?: string | null): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const buildDestinationAddressForm = (
  destination?: NoidaOfficeShipmentConfig["destination"],
): ShipmentAddressForm =>
  createEmptyAddressForm({
    address_title: destination?.name || "Noida Office",
    name: destination?.name || "",
    phone: destination?.phone || "",
    alternate_phone: destination?.alternate_phone || "",
    email: destination?.email || "",
    address_line_one: destination?.address_line_one || "",
    address_line_two: destination?.address_line_two || "",
    pincode: destination?.pincode || "",
    city: destination?.city || "",
    state: destination?.state || "",
  });

const getClaimStateId = (claim: Claim): number =>
  Number(claim.service_centre_state_id ?? 0);

const getClaimStateName = (claim: Claim): string =>
  String(claim.service_centre_state ?? "").trim();

const resolveSourceAddress = (
  config: NoidaOfficeShipmentConfig | null,
  claims: Claim[],
): ShipmentAddressForm => {
  const firstClaim = claims[0];
  const sourceStateId = getClaimStateId(firstClaim);
  const sourceStateName = getClaimStateName(firstClaim);
  const stateKey = normalizeStateKey(sourceStateName);

  const configuredSource = (config?.source_addresses ?? []).find((address) => {
    if (sourceStateId > 0 && Number(address.state_id ?? 0) === sourceStateId) {
      return true;
    }

    return normalizeStateKey(address.state) === stateKey;
  });

  if (configuredSource) {
    return createEmptyAddressForm({
      ...configuredSource,
      state_id: configuredSource.state_id ?? sourceStateId,
      state: configuredSource.state || sourceStateName,
    });
  }

  return createEmptyAddressForm({
    state_id: sourceStateId || null,
    state: sourceStateName,
  });
};

const EditableField = ({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  inputMode,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  disabled?: boolean;
}) => (
  <label className={className}>
    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </span>
    <input
      type="text"
      inputMode={inputMode}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
    />
  </label>
);

const ShipmentBuilderModal: React.FC<ShipmentBuilderModalProps> = ({
  isOpen,
  claims,
  onClose,
  onConfirm,
}) => {
  const [shipmentConfig, setShipmentConfig] =
    useState<NoidaOfficeShipmentConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [isCourierLoading, setIsCourierLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"details" | "courier" | "done">("details");
  const [destinationForm, setDestinationForm] = useState<ShipmentAddressForm>(
    createEmptyAddressForm(),
  );
  const [sourceForm, setSourceForm] = useState<ShipmentAddressForm>(
    createEmptyAddressForm(),
  );
  const [courierOptions, setCourierOptions] = useState<
    NoidaOfficeShipmentCourier[]
  >([]);
  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(
    null,
  );
  const [packageInfo, setPackageInfo] = useState<{
    claim_ids?: number[];
    claim_count?: number;
    weight?: number;
    pickup_pincode?: string;
    delivery_pincode?: string;
  }>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalClaims, setModalClaims] = useState<Claim[]>([]);
  const wasOpenRef = useRef(false);

  const sortedClaims = useMemo(
    () => [...modalClaims].sort((a, b) => Number(b.id) - Number(a.id)),
    [modalClaims],
  );
  const claimIds = useMemo(
    () => sortedClaims.map((claim) => Number(claim.id)),
    [sortedClaims],
  );
  const selectedCount = sortedClaims.length;

  const sourceStateIds = useMemo(
    () =>
      Array.from(
        new Set(
          sortedClaims
            .map(getClaimStateId)
            .filter((stateId) => Number.isFinite(stateId) && stateId > 0),
        ),
      ),
    [sortedClaims],
  );

  const sourceStateNames = useMemo(
    () =>
      Array.from(
        new Set(
          sortedClaims
            .map(getClaimStateName)
            .filter((stateName) => stateName !== ""),
        ),
      ),
    [sortedClaims],
  );

  const hasSingleSourceState =
    selectedCount > 0 &&
    (sourceStateIds.length === 1 ||
      (sourceStateIds.length === 0 && sourceStateNames.length <= 1));

  const canCheckCouriers =
    selectedCount > 0 &&
    !isConfigLoading &&
    !isCourierLoading &&
    Boolean(shipmentConfig?.configured) &&
    hasSingleSourceState &&
    Boolean(sourceForm.pincode) &&
    Boolean(destinationForm.pincode);

  const selectedCourier = courierOptions.find(
    (courier) => courier.id === selectedCourierId,
  );

  const canSubmit =
    step === "courier" &&
    !isSubmitting &&
    !isCourierLoading &&
    Boolean(selectedCourierId);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setModalClaims(claims);
    }

    if (!isOpen) {
      setModalClaims([]);
      setShipmentConfig(null);
      setDestinationForm(createEmptyAddressForm());
      setSourceForm(createEmptyAddressForm());
      setCourierOptions([]);
      setSelectedCourierId(null);
      setPackageInfo({});
      setStep("details");
      setErrorMessage("");
      setSuccessMessage("");
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, claims]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    const loadConfig = async () => {
      try {
        setIsConfigLoading(true);
        const response = await fetchNoidaOfficeShipmentConfig();

        if (!isMounted) {
          return;
        }

        const config =
          response?.success && response.data?.success !== false
            ? response.data?.data ?? null
            : null;
        setShipmentConfig(config);
        setDestinationForm(buildDestinationAddressForm(config?.destination));
        setSourceForm(resolveSourceAddress(config, sortedClaims));
      } catch (error) {
        console.error("Failed to load shipment config:", error);
        if (isMounted) {
          setShipmentConfig(null);
          setErrorMessage("Unable to load shipment configuration.");
        }
      } finally {
        if (isMounted) {
          setIsConfigLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, [isOpen, sortedClaims]);

  useEffect(() => {
    if (!isOpen || step !== "done") {
      return;
    }

    const closeTimer = window.setTimeout(() => {
      onClose();
    }, 6000);

    return () => {
      window.clearTimeout(closeTimer);
    };
  }, [isOpen, onClose, step]);

  if (!isOpen) {
    return null;
  }

  const resetCourierStep = () => {
    if (step !== "details") {
      setStep("details");
      setCourierOptions([]);
      setSelectedCourierId(null);
      setPackageInfo({});
      setSuccessMessage("");
    }
  };

  const updateDestinationField = (
    field: keyof ShipmentAddressForm,
    value: string,
  ) => {
    resetCourierStep();
    setDestinationForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSourceField = (field: keyof ShipmentAddressForm, value: string) => {
    resetCourierStep();
    setSourceForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCheckCouriers = async () => {
    if (!canCheckCouriers) {
      setErrorMessage(
        hasSingleSourceState
          ? "Source and destination pincodes are required."
          : "Select claims from one source state only.",
      );
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsCourierLoading(true);

      const response = await fetchNoidaOfficeShipmentCouriers(claimIds, {
        source_address: sourceForm,
        destination: destinationForm,
      });

      if (
        !response?.success ||
        response.data?.success === false ||
        !response.data?.data?.couriers?.length
      ) {
        setErrorMessage(
          response?.error ||
            response.data?.message ||
            response?.message ||
            "No surface courier partners were returned.",
        );
        return;
      }

      const couriers = response.data.data.couriers;
      setCourierOptions(couriers);
      setPackageInfo(response.data.data.package ?? {});
      setSelectedCourierId(couriers[0]?.id ?? null);
      setStep("courier");
      setSuccessMessage("Select a surface courier partner for this shipment.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to fetch courier partners.",
      );
    } finally {
      setIsCourierLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!canSubmit || !selectedCourier) {
      return;
    }

    try {
      setErrorMessage("");
      setIsSubmitting(true);
      const result = await onConfirm({
        source_address: sourceForm,
        destination: destinationForm,
        selected_courier_id: selectedCourier.id,
        selected_courier: selectedCourier,
      });

      if (result !== false) {
        setStep("done");
        setSuccessMessage(
          `Shipment created for claim IDs ${claimIds.map((id) => `#${id}`).join(", ")}.`,
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Shipment submission failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeLabel = step === "done" ? "Close" : "Cancel";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
      <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                Shipment Builder
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {selectedCount} {selectedCount === 1 ? "claim" : "claims"} selected
              </h2>
              <p className="mt-2 max-w-4xl text-sm text-slate-500">
                Review selected claims, confirm the fixed source address, select a
                courier partner, then create one shipment.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-2xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close shipment builder"
            >
              x
            </button>
          </div>
        </div>

        {(errorMessage || successMessage) && (
          <div
            className={`border-b px-6 py-4 text-sm font-semibold ${
              errorMessage
                ? "border-rose-100 bg-rose-50 text-rose-700"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {errorMessage || successMessage}
          </div>
        )}

        <div className="grid flex-1 grid-cols-1 divide-y overflow-hidden lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          <section className="overflow-y-auto px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Selected Claims
                </h3>
                <p className="text-sm text-slate-500">
                  All claims in this shipment must be from one source state.
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {sourceStateNames[0] || "Source state"}
              </span>
            </div>

            {!hasSingleSourceState && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                Select claims from one source state only.
              </div>
            )}

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              {sortedClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="grid grid-cols-[90px_1fr_120px] items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
                >
                  <span className="text-lg font-bold text-slate-900">
                    #{claim.id}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {claim.name || "N/A"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {claim.status}
                    </p>
                  </div>
                  <span className="justify-self-end rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Eligible
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-600">
                Source Address
              </h3>
              {isConfigLoading ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  Loading source address...
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <EditableField
                    label="Source Name"
                    value={sourceForm.name}
                    onChange={(value) => updateSourceField("name", value)}
                    className="md:col-span-2"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Phone"
                    value={sourceForm.phone}
                    onChange={(value) => updateSourceField("phone", value)}
                    inputMode="tel"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Alternate Mobile"
                    value={sourceForm.alternate_phone}
                    onChange={(value) =>
                      updateSourceField("alternate_phone", value)
                    }
                    inputMode="tel"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Email"
                    value={sourceForm.email}
                    onChange={(value) => updateSourceField("email", value)}
                    inputMode="email"
                    className="md:col-span-2"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Address Line 1"
                    value={sourceForm.address_line_one}
                    onChange={(value) =>
                      updateSourceField("address_line_one", value)
                    }
                    className="md:col-span-2"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Address Line 2"
                    value={sourceForm.address_line_two}
                    onChange={(value) =>
                      updateSourceField("address_line_two", value)
                    }
                    className="md:col-span-2"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="City"
                    value={sourceForm.city}
                    onChange={(value) => updateSourceField("city", value)}
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="State"
                    value={sourceForm.state}
                    onChange={(value) => updateSourceField("state", value)}
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Pincode"
                    value={sourceForm.pincode}
                    onChange={(value) => updateSourceField("pincode", value)}
                    inputMode="numeric"
                    disabled={step === "done"}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="overflow-y-auto bg-slate-50 px-6 py-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-600">
                Destination Address
              </h3>
              {isConfigLoading ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  Loading destination address...
                </div>
              ) : shipmentConfig?.configured ? (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <EditableField
                    label="Office Name"
                    value={destinationForm.name}
                    onChange={(value) => updateDestinationField("name", value)}
                    className="md:col-span-2"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Phone"
                    value={destinationForm.phone}
                    onChange={(value) => updateDestinationField("phone", value)}
                    inputMode="tel"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Alternate Mobile"
                    value={destinationForm.alternate_phone}
                    onChange={(value) =>
                      updateDestinationField("alternate_phone", value)
                    }
                    inputMode="tel"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Email"
                    value={destinationForm.email}
                    onChange={(value) => updateDestinationField("email", value)}
                    inputMode="email"
                    className="md:col-span-2"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Address Line 1"
                    value={destinationForm.address_line_one}
                    onChange={(value) =>
                      updateDestinationField("address_line_one", value)
                    }
                    className="md:col-span-2"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Address Line 2"
                    value={destinationForm.address_line_two}
                    onChange={(value) =>
                      updateDestinationField("address_line_two", value)
                    }
                    className="md:col-span-2"
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="City"
                    value={destinationForm.city}
                    onChange={(value) => updateDestinationField("city", value)}
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="State"
                    value={destinationForm.state}
                    onChange={(value) => updateDestinationField("state", value)}
                    disabled={step === "done"}
                  />
                  <EditableField
                    label="Pincode"
                    value={destinationForm.pincode}
                    onChange={(value) =>
                      updateDestinationField("pincode", value)
                    }
                    inputMode="numeric"
                    disabled={step === "done"}
                  />
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-rose-600">
                  Unable to load shipment config.
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
              <p className="font-bold">One shipment</p>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                <p>Claim IDs: {claimIds.map((id) => `#${id}`).join(", ")}</p>
                <p>Weight: {packageInfo.weight ?? 500} g</p>
                <p>Pickup: {packageInfo.pickup_pincode || sourceForm.pincode}</p>
                <p>
                  Delivery:{" "}
                  {packageInfo.delivery_pincode || destinationForm.pincode}
                </p>
              </div>
            </div>

            {step === "courier" || step === "done" ? (
              <div className="mt-5 space-y-3">
                <h3 className="text-lg font-semibold text-slate-800">
                  Courier Partner
                </h3>
                {courierOptions.map((courier) => (
                  <label
                    key={courier.id}
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm ${
                      selectedCourierId === courier.id
                        ? "border-blue-500 ring-2 ring-blue-100"
                        : "border-slate-200"
                    } ${step === "done" ? "cursor-default opacity-80" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        checked={selectedCourierId === courier.id}
                        disabled={step === "done"}
                        onChange={() => setSelectedCourierId(courier.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-bold text-slate-900">
                          {courier.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Courier ID: {courier.id}
                          {courier.estimated_delivery
                            ? `  ETA: ${courier.estimated_delivery}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-900">
                      Rs. {Number(courier.total_charges).toFixed(2)}
                    </p>
                  </label>
                ))}
              </div>
            ) : null}
          </section>
        </div>

        <div className="border-t bg-white px-6 py-4">
          <div className="flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-slate-600">
              {selectedCount} {selectedCount === 1 ? "claim" : "claims"} selected
              for shipment.
            </div>
            <div className="flex items-center gap-3">
              {step === "courier" && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    setSuccessMessage("");
                  }}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isCourierLoading}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {closeLabel}
              </button>
              {step === "details" && (
                <button
                  type="button"
                  onClick={handleCheckCouriers}
                  disabled={!canCheckCouriers}
                  className="rounded-lg bg-primaryBlue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isCourierLoading ? "Checking..." : "Check Courier Partners"}
                </button>
              )}
              {step === "courier" && (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!canSubmit}
                  className="rounded-lg bg-primaryBlue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? "Processing..." : "Initiate Shipment"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentBuilderModal;
