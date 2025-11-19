import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../components/ui/ThemeToggle";
import LoadingButton from "../components/ui/LoadingButton";

const roleRoutes = {
  ADMIN: "/admin",
  DRIVER: "/driver",
  STAGE_MANAGER: "/stage",
};

const LoginPage = () => {
  const { login, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      addToast({
        title: "Welcome back!",
        description: `Signed in as ${user.role.toLowerCase().replace("_", " ")}`,
        variant: "success",
      });
      navigate(roleRoutes[user.role] || "/");
    } catch (err) {
      addToast({
        title: "Login failed",
        description: err.response?.data?.message || "Invalid credentials",
        variant: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-border bg-card/90 p-8 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              TrustDrive Portal
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Admin, driver & stage manager access
            </p>
          </div>
          <ThemeToggle />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm font-medium">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <LoadingButton loading={loading} className="w-full rounded-2xl py-3 text-base">
            {loading ? "Signing in..." : "Sign in"}
          </LoadingButton>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;


