import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import NewSale from "./pages/NewSale";

function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? "/dashboard" : "/sales"} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Authenticated app (wrapped in Layout) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route path="/pos" element={<NewSale />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;