/** @format */

import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import OtpVerification from "./pages/OtpVerification/OtpVerification";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm/ResetPasswordConfirm";
import Dashboard from "./pages/Dashboard/Dashboard";
import PropertyDetail from "./components/PropertyDetail/PropertyDetail";
import PropertyList from "./components/PropertyList/PropertyList";
import { isTokenExpired, logout, getAuthToken } from "./utils/auth";
import "./App.css";

// AuthChecker component - kiểm tra token hết hạn
function AuthChecker({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Các trang không cần kiểm tra token
    const publicPaths = [
      "/login",
      "/register",
      "/verify-otp",
      "/forgot-password",
      "/reset-password",
    ];

    // Chỉ kiểm tra token cho các trang yêu cầu xác thực
    if (!publicPaths.includes(location.pathname)) {
      const token = getAuthToken();

      // Nếu không có token hoặc token hết hạn, chuyển hướng về trang đăng nhập
      if (!token || isTokenExpired()) {
        console.log("Token không hợp lệ hoặc đã hết hạn");
        logout(); // Xóa token và thông tin người dùng
        navigate("/login", { replace: true });
      }
    }
  }, [location, navigate]);

  return children;
}

// Hàm kiểm tra quyền truy cập
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = getAuthToken();
  const userStr = localStorage.getItem("user");
  let userRole = "GUEST";

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userRole = user.role || "GUEST";
    } catch (e) {
      console.error("Error parsing user data", e);
    }
  }

  if (!token || isTokenExpired()) {
    logout(); // Đảm bảo xóa dữ liệu cũ nếu token hết hạn
    return (
      <Navigate
        to='/login'
        replace
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <Navigate
        to='/unauthorized'
        replace
      />
    );
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthChecker>
        <Routes>
          {/* Public routes */}
          <Route
            path='/login'
            element={<Login />}
          />
          <Route
            path='/register'
            element={<Register />}
          />
          <Route
            path='/verify-otp'
            element={<OtpVerification />}
          />
          <Route
            path='/forgot-password'
            element={<ForgotPassword />}
          />
          <Route
            path='/reset-password'
            element={<ResetPasswordConfirm />}
          />

          {/* Owner Dashboard routes */}
          <Route
            path='/owner/*'
            element={
              <PrivateRoute allowedRoles={["OWNER"]}>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route
              path='dashboard'
              element={<div>Owner Dashboard Content</div>}
            />
            <Route
              path='overview'
              element={<div>Overview Content</div>}
            />
            <Route
              path='properties'
              element={<PropertyList />}
            />
            <Route
              path='properties/add'
              element={<div>Add Property</div>}
            />
            <Route
              path='rooms'
              element={<div>Rooms Management</div>}
            />
            <Route
              path='leases'
              element={<div>Leases List</div>}
            />
            <Route
              path='leases/add'
              element={<div>Add Lease</div>}
            />
            <Route
              path='leases/expiring'
              element={<div>Expiring Leases</div>}
            />
            <Route
              path='tenants'
              element={<div>Tenants List</div>}
            />
            <Route
              path='invoices'
              element={<div>Invoices List</div>}
            />
            <Route
              path='reports'
              element={<div>Reports & Statistics</div>}
            />
            <Route
              path='settings'
              element={<div>System Settings</div>}
            />
            <Route
              path='profile'
              element={<div>User Profile</div>}
            />
            <Route
              path='help'
              element={<div>Help & Support</div>}
            />
            <Route
              path='notifications'
              element={<div>Notifications</div>}
            />
            <Route
              path='*'
              element={
                <Navigate
                  to='/owner/dashboard'
                  replace
                />
              }
            />
          </Route>

          {/* Unauthorized page */}
          <Route
            path='/unauthorized'
            element={<div>Bạn không có quyền truy cập trang này</div>}
          />

          {/* Default redirect */}
          <Route
            path='/'
            element={
              <Navigate
                to='/login'
                replace
              />
            }
          />

          {/* Catch-all route */}
          <Route
            path='*'
            element={
              <Navigate
                to='/login'
                replace
              />
            }
          />

          {/* Property Detail route */}
          <Route
            path='/property/:propertyId'
            element={<PropertyDetail />}
          />
        </Routes>
      </AuthChecker>
    </Router>
  );
}

export default App;
