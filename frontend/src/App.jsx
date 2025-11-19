import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import DriverDashboard from "./pages/DriverDashboard";
import StageDashboard from "./pages/StageDashboard";
import ParcelLoginPage from "./pages/ParcelLoginPage";
import ParcelReceiptPage from "./pages/ParcelReceiptPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/parcel-login" element={<ParcelLoginPage />} />
      <Route path="/parcel/:orderCode" element={<ParcelReceiptPage />} />
      <Route
        path="/driver"
        element={
          <ProtectedRoute allow={["DRIVER"]}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stage"
        element={
          <ProtectedRoute allow={["STAGE_MANAGER"]}>
            <StageDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allow={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
