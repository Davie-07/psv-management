import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useToast } from "../context/ToastContext";
import LoadingButton from "../components/ui/LoadingButton";

const ParcelLoginPage = () => {
  const [form, setForm] = useState({ orderCode: "", customerName: "" });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/parcel-login", form);
      sessionStorage.setItem("td_parcel_token", data.parcelToken);
      sessionStorage.setItem("td_parcel_code", data.order.orderCode);
      addToast({
        title: "Parcel found",
        description: "Loading live receipt...",
        variant: "success",
      });
      navigate(`/parcel/${data.order.orderCode}`);
    } catch (err) {
      addToast({
        title: "Order not found",
        description: err.response?.data?.message || "Check the code and name",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/60 to-background px-4 py-12">
      <form
        className="mx-auto w-full max-w-md space-y-5 rounded-3xl border border-border bg-card/90 p-8 shadow-xl backdrop-blur"
        onSubmit={handleSubmit}
      >
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Parcel receipt
          </p>
          <h1 className="text-3xl font-semibold">Lookup order</h1>
          <p className="text-sm text-muted-foreground">
            Enter your order number and name to view live updates.
          </p>
        </div>
        <label className="space-y-2 text-sm font-medium">
          Order number
          <input
            value={form.orderCode}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, orderCode: e.target.value.toUpperCase() }))
            }
            placeholder="JKH 65T P3"
            required
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Customer name
          <input
            value={form.customerName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, customerName: e.target.value }))
            }
            required
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <LoadingButton loading={loading} className="w-full rounded-2xl py-3 text-base">
          {loading ? "Checking..." : "View receipt"}
        </LoadingButton>
      </form>
    </div>
  );
};

export default ParcelLoginPage;


