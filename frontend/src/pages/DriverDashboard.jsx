import { useEffect, useState } from "react";
import api from "../api/client";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LoadingButton from "../components/ui/LoadingButton";
import ThemeToggle from "../components/ui/ThemeToggle";

const DriverDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logForm, setLogForm] = useState({ passengers: "", trips: "" });
  const [savingLog, setSavingLog] = useState(false);
  const { logout } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get("/driver/summary");
        setSummary(data);
        setLogForm({
          passengers: data.passengerLog.passengers ?? "",
          trips: data.passengerLog.trips ?? "",
        });
      } catch (err) {
        addToast({
          title: "Failed to load dashboard",
          description: err.response?.data?.message,
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [addToast]);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setSavingLog(true);
    try {
      const { data } = await api.put("/driver/passenger-log", {
        passengers: Number(logForm.passengers) || 0,
        trips: Number(logForm.trips) || 0,
      });
      setSummary((prev) => ({ ...prev, passengerLog: data }));
      addToast({ title: "Passenger log updated", variant: "success" });
    } catch (err) {
      addToast({
        title: "Unable to update log",
        description: err.response?.data?.message,
        variant: "error",
      });
    } finally {
      setSavingLog(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading driver dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-border bg-gradient-to-r from-primary/80 to-primary px-6 py-6 text-primary-foreground shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] opacity-80">TrustDrive Driver</p>
              <h1 className="mt-2 text-3xl font-semibold">{summary.welcome.message}</h1>
              <p className="mt-2 text-sm opacity-90">{summary.welcome.quote}</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LoadingButton variant="outline" onClick={logout} className="bg-white/10 text-white">
                Logout
              </LoadingButton>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Vehicle & Route</h3>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Number Plate", summary.vehicle.plateNumber],
                ["Driver", summary.vehicle.driverName],
                ["Phone", summary.vehicle.driverPhone],
                ["Route", summary.vehicle.route],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <StatCard
            title="Passengers today"
            value={summary.passengerLog.passengers}
            caption="Synced with stage manager"
          />
          <StatCard title="Trips today" value={summary.passengerLog.trips} />
        </section>

        <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Update passenger log</h3>
          <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleLogSubmit}>
            <label className="text-sm font-medium">
              Passengers
              <input
                type="number"
                min="0"
                value={logForm.passengers}
                onChange={(e) =>
                  setLogForm((prev) => ({ ...prev, passengers: e.target.value }))
                }
                required
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
              />
            </label>
            <label className="text-sm font-medium">
              Trips
              <input
                type="number"
                min="0"
                value={logForm.trips}
                onChange={(e) => setLogForm((prev) => ({ ...prev, trips: e.target.value }))}
                required
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
              />
            </label>
            <div className="md:flex md:items-end">
              <LoadingButton loading={savingLog} className="w-full rounded-2xl py-3">
                Save log
              </LoadingButton>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Parcel assignments</h3>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
              {summary.parcels.length} active
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {summary.parcels.length === 0 && (
              <p className="text-sm text-muted-foreground">No parcels assigned currently.</p>
            )}
            {summary.parcels.map((parcel) => (
              <article
                key={parcel.orderCode}
                className="flex items-center justify-between rounded-2xl border border-border bg-background/70 p-4"
              >
                <div>
                  <h4 className="text-lg font-semibold">{parcel.orderCode}</h4>
                  <p className="text-sm text-muted-foreground">
                    Destination stage: {parcel.receiverStage?.name ?? "-"}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                  {parcel.status}
                </span>
              </article>
            ))}
          </div>
        </section>

        <nav className="sticky bottom-4 flex items-center justify-between rounded-full border border-border bg-card/80 px-4 py-3 shadow-xl backdrop-blur">
          {["Home", "Passengers", "Parcels"].map((item, idx) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                idx === 0
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
          <LoadingButton variant="outline" onClick={logout}>
            Logout
          </LoadingButton>
        </nav>
      </div>
    </div>
  );
};

export default DriverDashboard;


