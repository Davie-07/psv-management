import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import { useToast } from "../context/ToastContext";
import LoadingButton from "../components/ui/LoadingButton";
import ThemeToggle from "../components/ui/ThemeToggle";

const StageDashboard = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState("send");
  const [resources, setResources] = useState({ vehicles: [], drivers: [] });
  const [stages, setStages] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [vehicleStats, setVehicleStats] = useState({
    departedCount: 0,
    arrivedCount: 0,
    active: [],
    day: "",
  });
  const [sendForm, setSendForm] = useState({
    vehicleId: "",
    driverId: "",
    receiverStageId: "",
    customerName: "",
    customerPhone: "",
    destination: "",
    amount: "",
    parcelCount: 1,
    description: "",
    departureTime: "",
    eta: "",
  });
  const [movementForm, setMovementForm] = useState({
    vehicleId: "",
    driverId: "",
    route: "",
    departureTime: "",
  });
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [departureLoading, setDepartureLoading] = useState(false);
  const [arrivalLoading, setArrivalLoading] = useState(null);

  const loadData = async () => {
    try {
      const [resData, incomingData, outgoingData, stageList, statsData] =
        await Promise.all([
          api.get("/stage/resources"),
          api.get("/stage/parcels/incoming"),
          api.get("/stage/parcels/outgoing"),
          api.get("/stage/stages"),
          api.get("/stage/vehicles/stats/today"),
        ]);
      setResources(resData.data);
      setIncoming(incomingData.data);
      setOutgoing(outgoingData.data);
      setStages(stageList.data);
      setVehicleStats(statsData.data);
    } catch (error) {
      addToast({
        title: "Unable to load stage data",
        description: error.response?.data?.message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendParcel = async (e) => {
    e.preventDefault();
    setSendLoading(true);
    try {
      const payload = {
        ...sendForm,
        amount: Number(sendForm.amount),
        parcelCount: Number(sendForm.parcelCount),
      };
      const { data } = await api.post("/stage/parcels", payload);
      addToast({
        title: "Parcel sent",
        description: `Order ${data.orderCode} created`,
        variant: "success",
      });
      setSendForm((prev) => ({
        ...prev,
        customerName: "",
        customerPhone: "",
        destination: "",
        amount: "",
        parcelCount: 1,
        description: "",
      }));
      loadData();
    } catch (error) {
      addToast({
        title: "Unable to send parcel",
        description: error.response?.data?.message,
        variant: "error",
      });
    } finally {
      setSendLoading(false);
    }
  };

  const handleArrival = async (orderCode) => {
    try {
      await api.patch(`/stage/parcels/${orderCode}/arrival`);
      addToast({
        title: "Arrival confirmed",
        description: `${orderCode} marked as arrived`,
        variant: "success",
      });
      loadData();
    } catch (error) {
      addToast({
        title: "Could not confirm arrival",
        description: error.response?.data?.message,
        variant: "error",
      });
    }
  };

  const handleDepartureSubmit = async (e) => {
    e.preventDefault();
    setDepartureLoading(true);
    try {
      await api.post("/stage/vehicles/departures", {
        ...movementForm,
        departureTime: movementForm.departureTime || undefined,
      });
      addToast({
        title: "Vehicle departed",
        description: "Departure logged successfully",
        variant: "success",
      });
      setMovementForm({ vehicleId: "", driverId: "", route: "", departureTime: "" });
      loadData();
    } catch (error) {
      addToast({
        title: "Unable to record departure",
        description: error.response?.data?.message,
        variant: "error",
      });
    } finally {
      setDepartureLoading(false);
    }
  };

  const handleArrivalComplete = async (movementId) => {
    setArrivalLoading(movementId);
    try {
      await api.patch(`/stage/vehicles/departures/${movementId}/arrival`);
      addToast({
        title: "Vehicle arrived",
        variant: "success",
      });
      loadData();
    } catch (error) {
      addToast({
        title: "Unable to mark arrival",
        description: error.response?.data?.message,
        variant: "error",
      });
    } finally {
      setArrivalLoading(null);
    }
  };

  const handleMovementDriverChange = (driverId) => {
    const driver = resources.drivers.find((d) => d._id === driverId);
    setMovementForm((prev) => ({
      ...prev,
      driverId,
      route: driver?.driverProfile?.route || prev.route,
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading stage dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card/80 px-6 py-4 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Stage Manager
            </p>
            <h1 className="text-3xl font-semibold">{user.fullName}</h1>
            <p className="text-sm text-muted-foreground">{user.stage?.name} · PSV operations</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LoadingButton variant="outline" onClick={logout}>
              Logout
            </LoadingButton>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Vehicles departed today"
            value={vehicleStats.departedCount}
            caption={`Since 00:00 (${vehicleStats.day})`}
          />
          <StatCard
            title="Vehicles arrived today"
            value={vehicleStats.arrivedCount}
            caption="Updated in real time"
          />
        </section>

        <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Mark vehicle departure</h3>
          </div>
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleDepartureSubmit}>
            <label className="text-sm font-medium">
              Vehicle
              <select
                value={movementForm.vehicleId}
                onChange={(e) =>
                  setMovementForm((prev) => ({ ...prev, vehicleId: e.target.value }))
                }
                required
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select vehicle</option>
                {resources.vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.plateNumber}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Driver
              <select
                value={movementForm.driverId}
                onChange={(e) => handleMovementDriverChange(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select driver</option>
                {resources.drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Route
              <input
                value={movementForm.route}
                onChange={(e) =>
                  setMovementForm((prev) => ({ ...prev, route: e.target.value }))
                }
                placeholder="e.g. CBD – Westlands"
                required
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="text-sm font-medium">
              Departure time
              <input
                type="datetime-local"
                value={movementForm.departureTime}
                onChange={(e) =>
                  setMovementForm((prev) => ({
                    ...prev,
                    departureTime: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <div className="md:col-span-2">
              <LoadingButton loading={departureLoading} className="w-full rounded-2xl py-3">
                Record departure
              </LoadingButton>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Active departures</h3>
          </div>
          <div className="mt-4 space-y-3">
            {vehicleStats.active.length === 0 && (
              <p className="text-sm text-muted-foreground">No active departures right now.</p>
            )}
            {vehicleStats.active.map((movement) => (
              <article
                key={movement._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 p-4"
              >
                <div>
                  <h4 className="text-lg font-semibold">{movement.vehicle?.plateNumber}</h4>
                  <p className="text-sm text-muted-foreground">
                    Driver: {movement.driver?.fullName} · Route: {movement.route}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Departed: {new Date(movement.departureTime).toLocaleTimeString()}
                  </p>
                </div>
                <LoadingButton
                  variant="outline"
                  loading={arrivalLoading === movement._id}
                  onClick={() => handleArrivalComplete(movement._id)}
                >
                  Mark arrived
                </LoadingButton>
              </article>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              tab === "send"
                ? "bg-primary text-primary-foreground"
                : "border-border text-muted-foreground"
            }`}
            onClick={() => setTab("send")}
          >
            Send parcels
          </button>
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              tab === "confirm"
                ? "bg-primary text-primary-foreground"
                : "border-border text-muted-foreground"
            }`}
            onClick={() => setTab("confirm")}
          >
            Confirm parcels
          </button>
        </div>

        {tab === "send" && (
          <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Send new parcel</h3>
            <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSendParcel}>
              {[
                {
                  label: "Vehicle",
                  value: sendForm.vehicleId,
                  onChange: (e) =>
                    setSendForm((prev) => ({ ...prev, vehicleId: e.target.value })),
                  options: resources.vehicles,
                  key: "vehicleId",
                  type: "selectVehicle",
                },
                {
                  label: "Driver",
                  value: sendForm.driverId,
                  onChange: (e) =>
                    setSendForm((prev) => ({ ...prev, driverId: e.target.value })),
                  options: resources.drivers,
                  key: "driverId",
                  type: "selectDriver",
                },
                {
                  label: "Destination stage",
                  value: sendForm.receiverStageId,
                  onChange: (e) =>
                    setSendForm((prev) => ({
                      ...prev,
                      receiverStageId: e.target.value,
                    })),
                  options: stages,
                  key: "receiverStageId",
                  type: "selectStage",
                },
              ].map((field) => (
                <label key={field.key} className="text-sm font-medium">
                  {field.label}
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select</option>
                    {field.type === "selectVehicle" &&
                      field.options.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.plateNumber}
                        </option>
                      ))}
                    {field.type === "selectDriver" &&
                      field.options.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.fullName}
                        </option>
                      ))}
                    {field.type === "selectStage" &&
                      field.options.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
              ))}
              <label className="text-sm font-medium">
                Customer name
                <input
                  value={sendForm.customerName}
                  onChange={(e) =>
                    setSendForm((prev) => ({ ...prev, customerName: e.target.value }))
                  }
                  required
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="text-sm font-medium">
                Customer phone
                <input
                  value={sendForm.customerPhone}
                  onChange={(e) =>
                    setSendForm((prev) => ({ ...prev, customerPhone: e.target.value }))
                  }
                  required
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="text-sm font-medium">
                Destination details
                <input
                  value={sendForm.destination}
                  onChange={(e) =>
                    setSendForm((prev) => ({ ...prev, destination: e.target.value }))
                  }
                  required
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="text-sm font-medium">
                Amount charged
                <input
                  type="number"
                  value={sendForm.amount}
                  onChange={(e) =>
                    setSendForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  required
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="text-sm font-medium">
                Parcels count
                <input
                  type="number"
                  min="1"
                  value={sendForm.parcelCount}
                  onChange={(e) =>
                    setSendForm((prev) => ({ ...prev, parcelCount: e.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="text-sm font-medium">
                Departure time
                <input
                  type="datetime-local"
                  value={sendForm.departureTime}
                  onChange={(e) =>
                    setSendForm((prev) => ({ ...prev, departureTime: e.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="text-sm font-medium">
                ETA
                <input
                  type="datetime-local"
                  value={sendForm.eta}
                  onChange={(e) => setSendForm((prev) => ({ ...prev, eta: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="text-sm font-medium md:col-span-2">
                Parcel description
                <textarea
                  value={sendForm.description}
                  onChange={(e) =>
                    setSendForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <div className="md:col-span-2">
                <LoadingButton loading={sendLoading} className="w-full rounded-2xl py-3">
                  Submit order
                </LoadingButton>
              </div>
            </form>
          </section>
        )}

        {tab === "confirm" && (
          <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Incoming parcels</h3>
            <div className="mt-4 space-y-3">
              {incoming.length === 0 && (
                <p className="text-sm text-muted-foreground">No incoming parcels yet.</p>
              )}
              {incoming.map((parcel) => (
                <article
                  key={parcel.orderCode}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 p-4"
                >
                  <div>
                    <h4 className="text-lg font-semibold">{parcel.orderCode}</h4>
                    <p className="text-sm text-muted-foreground">
                      From: {parcel.senderStage?.name} · Customer: {parcel.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">Amount: KES {parcel.amount}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                      {parcel.status}
                    </span>
                    {parcel.status !== "ARRIVED" && (
                      <LoadingButton
                        variant="outline"
                        onClick={() => handleArrival(parcel.orderCode)}
                      >
                        Confirm arrival
                      </LoadingButton>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Outgoing parcels</h3>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {outgoing.map((parcel) => (
                  <tr key={parcel.orderCode} className="border-t border-border/80">
                    <td className="px-4 py-3 font-medium">{parcel.orderCode}</td>
                    <td className="px-4 py-3">{parcel.receiverStage?.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                        {parcel.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StageDashboard;


