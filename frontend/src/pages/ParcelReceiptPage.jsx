import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { parcelClient } from "../api/client";
import { useToast } from "../context/ToastContext";
import LoadingButton from "../components/ui/LoadingButton";

const ParcelReceiptPage = () => {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const [parcel, setParcel] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [polling, setPolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const { addToast } = useToast();

  const fetchDetails = async () => {
    try {
      const { data } = await parcelClient.get(`/parcel/${orderCode}`);
      setParcel(data);
      setStatusMsg("");
    } catch (error) {
      setStatusMsg(error.response?.data?.message || "Unable to load parcel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("td_parcel_token");
    if (!token) {
      navigate("/parcel-login");
      return;
    }
    fetchDetails();
    setPolling(true);
    const interval = setInterval(fetchDetails, 15000);
    return () => {
      clearInterval(interval);
    };
  }, [orderCode, navigate]);

  const handleConfirmPickup = async () => {
    setConfirming(true);
    try {
      await parcelClient.post(`/parcel/${orderCode}/pickup`);
      sessionStorage.removeItem("td_parcel_token");
      sessionStorage.removeItem("td_parcel_code");
      addToast({
        title: "Parcel collected",
        description: "Thank you for using TrustDrive.",
        variant: "success",
      });
      setStatusMsg("Parcel has successfully arrived. Thank you for using TrustDrive.");
      setParcel(null);
      setPolling(false);
    } catch (error) {
      addToast({
        title: "Unable to confirm pickup",
        description: error.response?.data?.message || "Try again shortly",
        variant: "error",
      });
    } finally {
      setConfirming(false);
    }
  };

  if (loading && !parcel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-3xl border border-border bg-card px-6 py-8 text-center shadow-lg">
          <p className="text-muted-foreground">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/95 p-8 text-center shadow-xl">
          <p className="text-lg font-semibold">{statusMsg}</p>
          <LoadingButton
            className="mt-6 w-full justify-center rounded-2xl"
            onClick={() => navigate("/parcel-login")}
          >
            Start over
          </LoadingButton>
        </div>
      </div>
    );
  }

  const canConfirm =
    parcel.status === "ARRIVED" && parcel.confirmations.stageManager;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-3xl border border-border bg-card/90 p-8 shadow-2xl backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Parcel receipt
            </p>
            <h1 className="text-4xl font-semibold">Order {parcel.orderCode}</h1>
            {polling && (
              <p className="text-sm text-muted-foreground">Live updates every 15s</p>
            )}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              parcel.status === "ARRIVED"
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-200"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {parcel.status}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Vehicle details
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">Shuttle</span>:{" "}
                {parcel.vehicle?.plateNumber}
              </li>
              <li>
                <span className="text-muted-foreground">Driver</span>:{" "}
                {parcel.driver?.fullName}
              </li>
              <li>
                Departure: {new Date(parcel.departureTime).toLocaleString()}
              </li>
              <li>ETA: {new Date(parcel.eta).toLocaleString()}</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Customer
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">Name</span>: {parcel.customerName}
              </li>
              <li>
                <span className="text-muted-foreground">Phone</span>: {parcel.customerPhone}
              </li>
              <li>
                <span className="text-muted-foreground">Destination</span>:{" "}
                {parcel.destination}
              </li>
              <li>Amount paid: KES {parcel.amount}</li>
            </ul>
          </div>
        </div>

        <p className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
          {parcel.status === "ARRIVED"
            ? `Parcel has successfully arrived. Please visit ${
                parcel.receiverStage?.name ?? "the destination stage"
              } to collect it.`
            : `Parcel is currently ${parcel.status.toLowerCase()}. You will be prompted when it arrives.`}
        </p>

        <div className="flex flex-wrap gap-3">
          <LoadingButton
            variant="outline"
            onClick={() => navigate("/parcel-login")}
            className="rounded-2xl"
          >
            Close receipt
          </LoadingButton>
          <LoadingButton
            onClick={handleConfirmPickup}
            disabled={!canConfirm}
            loading={confirming}
            className="rounded-2xl"
          >
            {canConfirm ? "Confirm pickup" : "Waiting for stage manager"}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default ParcelReceiptPage;


