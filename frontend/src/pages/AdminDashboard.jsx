import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LoadingButton from "../components/ui/LoadingButton";
import ThemeToggle from "../components/ui/ThemeToggle";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [stages, setStages] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stageForm, setStageForm] = useState({ name: "", location: "" });
  const [managerForm, setManagerForm] = useState({
    stageId: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });
  const [driverForm, setDriverForm] = useState({
    stageId: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    plateNumber: "",
    route: "",
  });
  const [quoteForm, setQuoteForm] = useState({ text: "", author: "" });

  const [stageSubmitting, setStageSubmitting] = useState(false);
  const [managerSubmitting, setManagerSubmitting] = useState(false);
  const [driverSubmitting, setDriverSubmitting] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [stageRes, driverRes] = await Promise.all([
        api.get("/admin/stages"),
        api.get("/admin/drivers"),
      ]);
      setStages(stageRes.data);
      setDrivers(driverRes.data);
    } catch (error) {
      addToast({
        title: "Failed to load admin data",
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

  const handleStageSubmit = async (e) => {
    e.preventDefault();
    setStageSubmitting(true);
    try {
      await api.post("/admin/stages", stageForm);
      setStageForm({ name: "", location: "" });
      addToast({ title: "Stage created", variant: "success" });
      loadData();
    } catch (error) {
      addToast({
        title: "Unable to create stage",
        description: error.response?.data?.message,
        variant: "error",
      });
    } finally {
      setStageSubmitting(false);
    }
  };

  const handleManagerSubmit = async (e) => {
    e.preventDefault();
    setManagerSubmitting(true);
    try {
      await api.post("/admin/stages/assign-manager", managerForm);
      setManagerForm({
        stageId: "",
        email: "",
        password: "",
        fullName: "",
        phone: "",
      });
      addToast({ title: "Stage manager assigned", variant: "success" });
      loadData();
    } catch (error) {
      addToast({
        title: "Unable to assign manager",
        description: error.response?.data?.message,
        variant: "error",
      });
    } finally {
      setManagerSubmitting(false);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setDriverSubmitting(true);
    try {
      await api.post("/admin/drivers", driverForm);
      addToast({ title: "Driver registered", variant: "success" });
      loadData();
    } catch (error) {
      addToast({
        title: "Unable to register driver",
        description: error.response?.data?.message,
        variant: "error",
      });
    } finally {
      setDriverSubmitting(false);
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setQuoteSubmitting(true);
    try {
      await api.post("/admin/quotes", quoteForm);
      setQuoteForm({ text: "", author: "" });
      addToast({ title: "Quote added", variant: "success" });
    } catch (error) {
      addToast({
        title: "Unable to add quote",
        description: error.response?.data?.message,
        variant: "error",
      });
    } finally {
      setQuoteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading admin console…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card/80 px-6 py-4 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Administrator</p>
            <h1 className="text-3xl font-semibold">{user.fullName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LoadingButton variant="outline" onClick={logout}>
              Logout
            </LoadingButton>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <form
            className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm"
            onSubmit={handleStageSubmit}
          >
            <h3 className="text-xl font-semibold">Create stage</h3>
            <label className="mt-4 block text-sm font-medium">
              Stage name
              <input
                value={stageForm.name}
                onChange={(e) => setStageForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Location
              <input
                value={stageForm.location}
                onChange={(e) =>
                  setStageForm((prev) => ({ ...prev, location: e.target.value }))
                }
                required
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
              />
            </label>
            <LoadingButton
              loading={stageSubmitting}
              className="mt-4 w-full rounded-2xl py-3"
            >
              Create stage
            </LoadingButton>
          </form>

          <form
            className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm"
            onSubmit={handleManagerSubmit}
          >
            <h3 className="text-xl font-semibold">Assign stage manager</h3>
            <label className="mt-4 block text-sm font-medium">
              Stage
              <select
                value={managerForm.stageId}
                onChange={(e) =>
                  setManagerForm((prev) => ({ ...prev, stageId: e.target.value }))
                }
                required
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
              >
                <option value="">Choose stage</option>
                {stages.map((stage) => (
                  <option value={stage._id} key={stage._id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </label>
            {["fullName", "email", "password", "phone"].map((field) => (
              <label key={field} className="mt-4 block text-sm font-medium">
                {field === "fullName"
                  ? "Full name"
                  : field === "email"
                  ? "Email"
                  : field === "password"
                  ? "Password"
                  : "Phone"}
                <input
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  value={managerForm[field]}
                  onChange={(e) =>
                    setManagerForm((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  required={field !== "phone"}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
                />
              </label>
            ))}
            <LoadingButton
              loading={managerSubmitting}
              className="mt-4 w-full rounded-2xl py-3"
            >
              Assign manager
            </LoadingButton>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Create driver</h3>
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleDriverSubmit}>
            <label className="text-sm font-medium">
              Stage
              <select
                value={driverForm.stageId}
                onChange={(e) =>
                  setDriverForm((prev) => ({ ...prev, stageId: e.target.value }))
                }
                required
                className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
              >
                <option value="">Choose stage</option>
                {stages.map((stage) => (
                  <option value={stage._id} key={stage._id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </label>
            {["fullName", "email", "password", "phone", "plateNumber", "route"].map((field) => (
              <label key={field} className="text-sm font-medium">
                {field === "fullName"
                  ? "Full name"
                  : field === "plateNumber"
                  ? "Plate number"
                  : field === "route"
                  ? "Route"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
                <input
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  value={driverForm[field]}
                  onChange={(e) =>
                    setDriverForm((prev) => ({
                      ...prev,
                      [field]:
                        field === "plateNumber"
                          ? e.target.value.toUpperCase()
                          : e.target.value,
                    }))
                  }
                  required
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
                />
              </label>
            ))}
            <div className="md:col-span-2">
              <LoadingButton
                loading={driverSubmitting}
                className="w-full rounded-2xl py-3"
              >
                Register driver
              </LoadingButton>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Add traffic quote</h3>
          <form className="mt-4 flex flex-col gap-3 md:flex-row" onSubmit={handleQuoteSubmit}>
            <input
              value={quoteForm.text}
              onChange={(e) => setQuoteForm((prev) => ({ ...prev, text: e.target.value }))}
              placeholder="Quote"
              required
              className="flex-1 rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
            />
            <input
              value={quoteForm.author}
              onChange={(e) => setQuoteForm((prev) => ({ ...prev, author: e.target.value }))}
              placeholder="Author"
              className="flex-1 rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
            />
            <LoadingButton
              loading={quoteSubmitting}
              className="rounded-2xl px-6 py-3"
            >
              Save quote
            </LoadingButton>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Registered drivers</h3>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Plate</th>
                  <th className="px-4 py-3">Stage</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver._id} className="border-t border-border/80">
                    <td className="px-4 py-3 font-medium">{driver.fullName}</td>
                    <td className="px-4 py-3">{driver.driverProfile?.plateNumber}</td>
                    <td className="px-4 py-3">{driver.stage?.name}</td>
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

export default AdminDashboard;


