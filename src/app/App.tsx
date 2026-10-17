import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../admin/layouts/AdminLayout";
import Dashboard from "../admin/pages/Dashboard";
import Users from "../admin/pages/Users";
import UserDetails from "../admin/pages/UserDetails";
import PaymentPlan from "../admin/pages/PaymentPlan";
import NotFound from "../admin/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/users/:userId" element={<UserDetails />} />
        <Route path="/admin/plan" element={<PaymentPlan />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}