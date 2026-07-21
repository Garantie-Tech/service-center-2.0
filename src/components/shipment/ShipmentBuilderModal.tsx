"use client";

import { useEffect, useMemo, useState } from "react";
import Claim from "@/interfaces/ClaimInterface";
import type {
  NoidaOfficeShipmentConfig,
  ShipmentAddressForm,
  ShipmentBuilderPayload,
  ServiceCentreDetail,
} from "@/services/claimService";
import {
  fetchNoidaOfficeShipmentConfig,
  fetchServiceCentreDetail,
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

const extractAddressLines = (
  address: Claim["service_centre_address"],
): { address_line_one: string; address_line_two: string } => {
  if (!address) {
    return {
      address_line_one: "",
      address_line_two: "",
    };
  }

  if (typeof address === "string") {
    return {
      address_line_one: address.trim(),
      address_line_two: "",
    };
  }

  return {
    address_line_one: address.address_line_1 ?? "",
    address_line_two: address.address_line_2 ?? "",
  };
};

const buildSourceAddressForm = (
  claim: Claim,
  serviceCentre?: ServiceCentreDetail | null,
): ShipmentAddressForm => {
  const addressLines = extractAddressLines(
    serviceCentre?.address_line_one || serviceCentre?.address_line_two
      ? {
          address_line_1: serviceCentre?.address_line_one,
          address_line_2: serviceCentre?.address_line_two,
        }
      : claim.service_centre_address,
  );

  return createEmptyAddressForm({
    address_title: `Service Centre ${claim.service_centre_id ?? claim.id}`,
    service_centre_id: serviceCentre?.id ?? claim.service_centre_id ?? null,
    state_id: serviceCentre?.state_id ?? claim.service_centre_state_id ?? null,
    name: serviceCentre?.name || claim.service_centre_name || "",
    phone: serviceCentre?.mobile || claim.service_centre_mobile || "",
    email: serviceCentre?.email || claim.service_centre_email || "",
    address_line_one: addressLines.address_line_one,
    address_line_two: addressLines.address_line_two,
    pincode: serviceCentre?.pincode || claim.service_centre_pincode || "",
    city: serviceCentre?.city || claim.service_centre_city || "",
    state: serviceCentre?.state || claim.service_centre_state || "",
  });
};

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

const EditableField = ({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  multiline = false,
  rows = 3,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
}) => {
  return (
    <label className={className}>
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>
      ) : null}
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      ) : (
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      )}
    </label>
  );
};

const ShipmentBuilderModal: React.FC<ShipmentBuilderModalProps> = ({
  isOpen,
  claims,
  onClose,
  onConfirm,
}) => {
  const [shipmentConfig, setShipmentConfig] =
    useState<NoidaOfficeShipmentConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [destinationForm, setDestinationForm] = useState<ShipmentAddressForm>(
    createEmptyAddressForm(),
  );
  const [sourceForms, setSourceForms] = useState<
    Record<number, ShipmentAddressForm>
  >({});

  const sortedClaims = useMemo(() => {
    return [...claims].sort((a, b) => Number(b.id) - Number(a.id));
  }, [claims]);

  const selectedCount = sortedClaims.length;
  const canSubmit =
    Boolean(selectedCount) &&
    !isConfigLoading &&
    !isSubmitting &&
    Boolean(shipmentConfig?.configured);

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

        if (response?.success && response?.data?.data) {
          setShipmentConfig(response.data.data);
        } else {
          setShipmentConfig(null);
        }
      } catch (error) {
        console.error("Failed to load shipment config:", error);
        if (isMounted) {
          setShipmentConfig(null);
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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSourceForms({});
      setDestinationForm(createEmptyAddressForm());
      setShipmentConfig(null);
      return;
    }

    if (!shipmentConfig) {
      return;
    }

    setDestinationForm(buildDestinationAddressForm(shipmentConfig.destination));
  }, [isOpen, shipmentConfig]);

  useEffect(() => {
    if (!isOpen || !sortedClaims.length) {
      return;
    }

    let isMounted = true;

    const loadSourceDetails = async () => {
      const uniqueServiceCentreIds = Array.from(
        new Set(
          sortedClaims
            .map((claim) => Number(claim.service_centre_id))
            .filter((serviceCentreId) => Number.isFinite(serviceCentreId) && serviceCentreId > 0),
        ),
      );

      const detailEntries = await Promise.all(
        uniqueServiceCentreIds.map(async (serviceCentreId) => {
          try {
            const response = await fetchServiceCentreDetail(serviceCentreId);
            if (response?.success && response?.data?.data) {
              return [serviceCentreId, response.data.data] as const;
            }
          } catch (error) {
            console.error(
              `Failed to load service centre ${serviceCentreId}:`,
              error,
            );
          }

          return [serviceCentreId, null] as const;
        }),
      );

      if (!isMounted) {
        return;
      }

      const detailMap = Object.fromEntries(detailEntries) as Record<
        number,
        ServiceCentreDetail | null
      >;

      const initialSourceForms = sortedClaims.reduce(
        (accumulator, claim) => {
          const serviceCentreId = Number(claim.service_centre_id);
          accumulator[Number(claim.id)] = buildSourceAddressForm(
            claim,
            detailMap[serviceCentreId] ?? null,
          );
          return accumulator;
        },
        {} as Record<number, ShipmentAddressForm>,
      );

      setSourceForms(initialSourceForms);
    };

    loadSourceDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, sortedClaims]);

  if (!isOpen) {
    return null;
  }

  const updateDestinationField = (
    field: keyof ShipmentAddressForm,
    value: string,
  ) => {
    setDestinationForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSourceField = (
    claimId: number,
    field: keyof ShipmentAddressForm,
    value: string,
  ) => {
    setSourceForms((current) => ({
      ...current,
      [claimId]: {
        ...(current[claimId] ?? buildSourceAddressForm(sortedClaims[0])),
        [field]: value,
      },
    }));
  };

  const buildPayload = (): ShipmentBuilderPayload => {
    const payloadSourceAddresses = sortedClaims.reduce(
      (accumulator, claim) => {
        const claimId = Number(claim.id);
        accumulator[claimId] =
          sourceForms[claimId] ?? buildSourceAddressForm(claim);
        return accumulator;
      },
      {} as Record<number, ShipmentAddressForm>,
    );

    return {
      destination: destinationForm,
      source_addresses: payloadSourceAddresses,
    };
  };

  const handleConfirm = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await onConfirm(buildPayload());
      if (result !== false) {
        onClose();
      }
    } catch (error) {
      console.error("Shipment confirmation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                Shipment Builder
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {selectedCount} claims ready for shipment
              </h2>
              <p className="mt-2 max-w-4xl text-sm text-slate-500">
                Source details are editable per claim. Destination details are
                editable for the full shipment batch before submission.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-2xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close shipment builder"
            >
              ×
            </button>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 divide-y overflow-hidden md:grid-cols-2 md:divide-x md:divide-y-0">
          <section className="overflow-y-auto px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Selected Claims
                </h3>
                <p className="text-sm text-slate-500">
                  Only eligible claims are shown here.
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {selectedCount} queued
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {sortedClaims.map((claim) => {
                const claimId = Number(claim.id);
                const sourceForm =
                  sourceForms[claimId] ?? buildSourceAddressForm(claim);

                return (
                  <article
                    key={claim.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold text-slate-900">
                            #{claim.id}
                          </h4>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Eligible
                          </span>
                        </div>
                        <p className="mt-1 text-base text-slate-700">
                          {claim.name || "N/A"}
                        </p>
                        <p className="text-sm text-slate-500">{claim.status}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Source Details
                      </p>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <EditableField
                          label="Service Centre Name"
                          value={sourceForm.name}
                          onChange={(value) =>
                            updateSourceField(claimId, "name", value)
                          }
                        />
                        <EditableField
                          label="Phone"
                          value={sourceForm.phone}
                          onChange={(value) =>
                            updateSourceField(claimId, "phone", value)
                          }
                          inputMode="tel"
                        />
                        <EditableField
                          label="Alternate Mobile"
                          value={sourceForm.alternate_phone}
                          onChange={(value) =>
                            updateSourceField(claimId, "alternate_phone", value)
                          }
                          inputMode="tel"
                        />
                        <EditableField
                          label="Email"
                          value={sourceForm.email}
                          onChange={(value) =>
                            updateSourceField(claimId, "email", value)
                          }
                        />
                        <EditableField
                          label="Address Line 1"
                          value={sourceForm.address_line_one}
                          onChange={(value) =>
                            updateSourceField(claimId, "address_line_one", value)
                          }
                          className="md:col-span-2"
                        />
                        <EditableField
                          label="Address Line 2"
                          value={sourceForm.address_line_two}
                          onChange={(value) =>
                            updateSourceField(claimId, "address_line_two", value)
                          }
                          className="md:col-span-2"
                        />
                        <EditableField
                          label="City"
                          value={sourceForm.city}
                          onChange={(value) =>
                            updateSourceField(claimId, "city", value)
                          }
                        />
                        <EditableField
                          label="State"
                          value={sourceForm.state}
                          onChange={(value) =>
                            updateSourceField(claimId, "state", value)
                          }
                        />
                        <EditableField
                          label="Pincode"
                          value={sourceForm.pincode}
                          onChange={(value) =>
                            updateSourceField(claimId, "pincode", value)
                          }
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="overflow-y-auto bg-slate-50 px-6 py-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Destination Details
              </h3>
              <p className="text-sm text-slate-500">
                This is the receiving office address. You can edit it before
                submission.
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {isConfigLoading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Loading shipment config...
                </div>
              ) : shipmentConfig?.configured ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Office Name
                    </p>
                    <EditableField
                      label=""
                      value={destinationForm.name}
                      onChange={(value) => updateDestinationField("name", value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <EditableField
                      label="Phone"
                      value={destinationForm.phone}
                      onChange={(value) => updateDestinationField("phone", value)}
                      inputMode="tel"
                    />
                    <EditableField
                      label="Alternate Mobile"
                      value={destinationForm.alternate_phone}
                      onChange={(value) =>
                        updateDestinationField("alternate_phone", value)
                      }
                      inputMode="tel"
                    />
                    <EditableField
                      label="Email"
                      value={destinationForm.email}
                      onChange={(value) => updateDestinationField("email", value)}
                      className="md:col-span-2"
                    />
                    <EditableField
                      label="Address Line 1"
                      value={destinationForm.address_line_one}
                      onChange={(value) =>
                        updateDestinationField("address_line_one", value)
                      }
                      className="md:col-span-2"
                    />
                    <EditableField
                      label="Address Line 2"
                      value={destinationForm.address_line_two}
                      onChange={(value) =>
                        updateDestinationField("address_line_two", value)
                      }
                      className="md:col-span-2"
                    />
                    <EditableField
                      label="City"
                      value={destinationForm.city}
                      onChange={(value) => updateDestinationField("city", value)}
                    />
                    <EditableField
                      label="State"
                      value={destinationForm.state}
                      onChange={(value) => updateDestinationField("state", value)}
                    />
                    <EditableField
                      label="Pincode"
                      value={destinationForm.pincode}
                      onChange={(value) =>
                        updateDestinationField("pincode", value)
                      }
                      inputMode="numeric"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-rose-600">
                  Unable to load shipment config.
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Before you submit</p>
              <p className="mt-2">
                Source details are saved per claim in the shipment request.
              </p>
              <p>Destination details are shared for the whole shipment batch.</p>
            </div>
          </section>
        </div>

        <div className="border-t bg-white px-6 py-4">
          <div className="flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-slate-600">
              {selectedCount} claims queued for shipment.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canSubmit}
                className="rounded-lg bg-primaryBlue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? "Initiating..." : "Initiate Shipment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentBuilderModal;
