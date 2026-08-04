"use client";

import Claim, {
  OfficeShipmentInfo,
  ShipmentAddressSnapshot,
} from "@/interfaces/ClaimInterface";
import { cancelNoidaOfficeShipment } from "@/services/claimService";
import { useNotification } from "@/context/NotificationProvider";
import { useGlobalStore } from "@/store/store";
import { useAuthStore } from "@/store/authStore";
import { hasNoidaShipmentPermission } from "@/helpers/globalHelper";
import TrackPopup from "@/components/TrackPopup";
import { useMemo, useState } from "react";

interface BulkShipmentDetailsProps {
  selectedClaim: Claim | null;
}

const normalizeStatus = (value?: string | null) =>
  (value || "").trim().toLowerCase();

const titleCase = (value?: string | null) => {
  const normalized = (value || "N/A").replace(/[_-]+/g, " ").trim();
  return normalized.replace(/\w\S*/g, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
};

const addressLine = (address?: Partial<ShipmentAddressSnapshot> | null) => {
  const parts = [
    address?.address_line_one,
    address?.address_line_two,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "N/A";
};

const cityStatePincode = (address?: Partial<ShipmentAddressSnapshot> | null) => {
  const parts = [address?.city, address?.state, address?.pincode].filter(Boolean);
  return parts.length ? parts.join(" / ") : "N/A";
};

const DetailValue = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-slate-950 break-words">
      {value || "N/A"}
    </p>
  </div>
);

const AddressPanel = ({
  title,
  address,
}: {
  title: string;
  address?: Partial<ShipmentAddressSnapshot> | null;
}) => (
  <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
      {title}
    </p>
    <p className="mt-3 text-sm font-bold text-slate-950">
      {address?.name || address?.address_title || "N/A"}
    </p>
    <p className="mt-2 text-sm leading-6 text-slate-700">
      {addressLine(address)}
    </p>
    <p className="mt-2 text-sm font-semibold text-slate-700">
      {cityStatePincode(address)}
    </p>
    {(address?.phone || address?.email) && (
      <p className="mt-2 text-xs text-slate-500">
        {[address?.phone, address?.email].filter(Boolean).join(" · ")}
      </p>
    )}
  </section>
);

const fallbackSourceAddress = (claim: Claim): Partial<ShipmentAddressSnapshot> => {
  const rawAddress = claim.service_centre_address;
  const addressLineOne =
    typeof rawAddress === "string"
      ? rawAddress
      : rawAddress?.address_line_1 || rawAddress?.address_line_2 || "";

  return {
    name: claim.service_centre_name,
    phone: claim.service_centre_mobile,
    email: claim.service_centre_email,
    address_line_one: addressLineOne,
    city: claim.service_centre_city,
    state: claim.service_centre_state,
    pincode: claim.service_centre_pincode,
  };
};

const fallbackDestinationAddress = (): Partial<ShipmentAddressSnapshot> => ({
  name: "Noida Office",
  address_line_one: "B-7, 2nd Floor, Block B, Sector 1, Noida, Uttar Pradesh 201301",
  city: "Noida",
  state: "Uttar Pradesh",
  pincode: "201301",
});

const getShipmentStatus = (shipment?: OfficeShipmentInfo | null) =>
  shipment?.tracking_current_status || shipment?.status || "Not initiated";

const BulkShipmentDetails: React.FC<BulkShipmentDetailsProps> = ({
  selectedClaim,
}) => {
  const { notifySuccess, notifyError } = useNotification();
  const { setIsLoading, triggerClaimRefresh } = useGlobalStore();
  const permissions = useAuthStore((state) => state.user.permissions ?? []);
  const canManageShipment = hasNoidaShipmentPermission(permissions);
  const [trackingAwb, setTrackingAwb] = useState<string | null>(null);
  const shipment = selectedClaim?.office_shipment ?? null;

  const sourceAddress = useMemo(
    () =>
      shipment?.payload?.source ||
      shipment?.payload?.source_address ||
      (selectedClaim ? fallbackSourceAddress(selectedClaim) : null),
    [selectedClaim, shipment],
  );
  const destinationAddress = useMemo(
    () => shipment?.payload?.destination || fallbackDestinationAddress(),
    [shipment],
  );

  if (!selectedClaim) {
    return (
      <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
        Select a claim to view shipment details.
      </div>
    );
  }

  const linkedClaims =
    shipment?.package_claims && shipment.package_claims.length > 0
      ? shipment.package_claims
      : [{ id: selectedClaim.id, customer_name: selectedClaim.name }];
  const shipmentStatus = getShipmentStatus(shipment);
  const normalizedStatus = normalizeStatus(shipment?.status);
  const normalizedTrackingStatus = normalizeStatus(shipment?.tracking_current_status);
  const isDelivered =
    normalizedStatus === "completed" || normalizedTrackingStatus.includes("deliver");
  const canCancel =
    Boolean(shipment?.id && shipment?.order_id && shipment?.awb_number) &&
    canManageShipment &&
    normalizedStatus === "initiated" &&
    !isDelivered;

  const handleCancelShipment = async () => {
    if (!shipment?.id || !selectedClaim?.id) {
      return;
    }

    const confirmed = window.confirm(
      "Cancel this carrier shipment for every linked claim?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await cancelNoidaOfficeShipment(Number(selectedClaim.id));

      if (!response.success || response.data?.success === false) {
        notifyError(response.message || "Unable to cancel shipment.");
        return;
      }

      notifySuccess("Shipment cancelled successfully.");
      triggerClaimRefresh();
    } catch (error) {
      notifyError(
        error instanceof Error ? error.message : "Unable to cancel shipment.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-8 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Shipment
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {shipment?.awb_number ? `AWB ${shipment.awb_number}` : "Not initiated"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Selected claim #{selectedClaim.id}
              {linkedClaims.length > 1 ? ` · ${linkedClaims.length} linked claims` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                normalizedStatus === "cancelled"
                  ? "bg-red-50 text-red-700"
                  : normalizedStatus === "failed"
                    ? "bg-amber-50 text-amber-700"
                    : normalizedStatus === "completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : shipment
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-200 text-slate-700"
              }`}
            >
              {shipment?.is_bulk_package ? "Bulk shipment" : "Single shipment"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-8 py-6">
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <DetailValue label="Claim status" value={selectedClaim.status} />
          <DetailValue
            label="Source state"
            value={shipment?.source_state_name || selectedClaim.service_centre_state}
          />
          <DetailValue
            label="Courier / order"
            value={
              shipment
                ? `${shipment.courier_name || "N/A"} · ${shipment.order_id || "N/A"}`
                : "N/A"
            }
          />
          <div>
            <DetailValue
              label="Shipment status"
              value={`${titleCase(shipmentStatus)}${
                shipment?.awb_number ? ` · ${shipment.awb_number}` : ""
              }`}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {shipment?.awb_number && (
                <button
                  type="button"
                  onClick={() => setTrackingAwb(shipment.awb_number || null)}
                  className="rounded-md bg-primaryBlue px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                >
                  Track Shipment
                </button>
              )}
              {canCancel && (
                <button
                  type="button"
                  onClick={handleCancelShipment}
                  className="rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700"
                >
                  Cancel Shipment
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Claims linked to this shipment
              </p>
              <p className="mt-2 text-sm font-medium text-blue-900">
                One carrier order is shared by all claims listed here.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700">
              {linkedClaims.length} {linkedClaims.length === 1 ? "claim" : "claims"}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {linkedClaims.map((claim) => (
              <span
                key={claim.id}
                className="rounded-md border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700"
              >
                #{claim.id} {claim.customer_name || ""}
              </span>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AddressPanel title="From address" address={sourceAddress} />
          <AddressPanel title="To address" address={destinationAddress} />
        </section>

        {shipment?.error_message && (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {shipment.error_message}
          </section>
        )}

        <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-900">
          {shipment
            ? "Tracking and cancellation apply to every linked claim in this carrier shipment."
            : "Select claims from the left panel and use the top action to create a shipment."}
        </section>
      </div>

      {trackingAwb && (
        <TrackPopup awb={trackingAwb} onClose={() => setTrackingAwb(null)} />
      )}
    </div>
  );
};

export default BulkShipmentDetails;
