import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AUTH_API_BASE = import.meta.env.VITE_API_URL || "/api";

const getStoredAdminToken = () => {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem("admin_token") || "";
};

export function ProtectedAdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetch(`${AUTH_API_BASE}/auth/me`, {
      credentials: "include",
      method: "GET",
      headers: getStoredAdminToken()
        ? { Authorization: `Bearer ${getStoredAdminToken()}` }
        : undefined,
    })
      .then(async (res) => {
        if (!mounted) return;
        setIsAuthenticated(res.ok);
      })
      .catch(() => {
        if (!mounted) return;
        setIsAuthenticated(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (isAuthenticated === null) {
    return <div style={{ padding: "2rem" }}>Comprobando acceso...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
