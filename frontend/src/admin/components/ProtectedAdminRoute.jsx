import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export function ProtectedAdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetch("http://localhost:4000/api/auth/me", {
      credentials: "include",
      method: "GET",
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
