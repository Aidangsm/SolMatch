import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import Home from "./pages/Home";
import Calculator from "./pages/Calculator";
import Marketplace from "./pages/Marketplace";
import InstallerProfile from "./pages/InstallerProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HomeownerDashboard from "./pages/HomeownerDashboard";
import InstallerDashboard from "./pages/InstallerDashboard";
import CreateInstallerProfile from "./pages/CreateInstallerProfile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-solar-400 border-t-transparent rounded-full" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/installers" element={<Marketplace />} />
          <Route path="/installers/:id" element={<InstallerProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/dashboard" element={<ProtectedRoute role="HOMEOWNER"><HomeownerDashboard /></ProtectedRoute>} />
          <Route path="/installer-dashboard" element={<ProtectedRoute role="INSTALLER"><InstallerDashboard /></ProtectedRoute>} />
          <Route path="/installer-profile/new" element={<ProtectedRoute role="INSTALLER"><CreateInstallerProfile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
