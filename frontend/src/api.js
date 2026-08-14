const API_URL = import.meta.env.VITE_API_URL || "/api";

function getCookie(name) {
    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`));
    if (!cookieValue) return "";
    return decodeURIComponent(cookieValue.split("=").slice(1).join("="));
}

function getStoredCsrfToken() {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem("csrf_token") || "";
}

function getStoredAdminToken() {
    if (typeof window === "undefined") return "";
    return getCookie("admin_token") || window.sessionStorage.getItem("admin_token") || "";
}

function shouldAttachCsrf(method) {
    const m = String(method || "GET").toUpperCase();
    return !["GET", "HEAD", "OPTIONS"].includes(m);
}

// Helper genérico para peticiones
async function request(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const method = options.method || "GET";
    const headers = {
        ...(options.headers || {}),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
    };

    if (shouldAttachCsrf(method)) {
        const csrfToken = getCookie("csrf_token") || getStoredCsrfToken();
        if (csrfToken) {
            headers["X-CSRF-Token"] = csrfToken;
        }
    }

    const adminToken = getStoredAdminToken();
    if (adminToken && !headers.Authorization) {
        headers.Authorization = `Bearer ${adminToken}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        credentials: "include",
        method,
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Error ${res.status}: ${error}`);
    }

    return res.json();
}

/* ============================
   ADMIN DASHBOARD
============================ */
export const getAdminDashboard = () => request("/admin/dashboard");
export const getSecurityAuditLogs = (limit = 100) => request(`/admin/security-audit?limit=${limit}`);
export const exportDatabaseBackup = async () => {
  const adminToken = getStoredAdminToken();
  const csrfToken = getCookie("csrf_token") || getStoredCsrfToken();

  const res = await fetch(`${API_URL}/admin/backup/export`, {
    credentials: "include",
    method: "GET",
    headers: {
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error ${res.status}: ${error}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename\s*=\s*"?([^";]+)"?/i);
  const filename = match ? match[1] : "protectora-backup.json";

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return { filename };
};
export const importDatabaseBackup = async (payload) => {
  const adminToken = getStoredAdminToken();
  const csrfToken = getCookie("csrf_token") || getStoredCsrfToken();

  const res = await fetch(`${API_URL}/admin/backup/import`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type") || "";
  const responseBody = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(typeof responseBody === "string" ? responseBody : responseBody?.error || "Error al importar la copia de seguridad");
  }

  return responseBody;
};

/* ============================
   ANIMALES
============================ */
export const getAnimales = () => request("/animals");
export const getAnimalById = (id) => request(`/animals/${id}`);
export const createAnimal = (data) => {
  if (data instanceof FormData) {
    return request("/animals", { method: "POST", body: data });
  }
  return request("/animals", { method: "POST", body: JSON.stringify(data) });
};

export const updateAnimal = (id, data) => {
  if (data instanceof FormData) {
    return request(`/animals/${id}`, { method: "PUT", body: data });
  }
  return request(`/animals/${id}`, { method: "PUT", body: JSON.stringify(data) });
};
export const deleteAnimal = (id) =>
    request(`/animals/${id}`, { method: "DELETE" });

/* ============================
   ADOPCIONES
============================ */
export const getAdopciones = () => request("/adoptions");
export const getAdopcionById = (id) => request(`/adoptions/${id}`);
export const createAdopcion = (data) =>
    request("/adoptions", { method: "POST", body: JSON.stringify(data) });
export const updateAdopcionStatus = (id, estado) =>
    request(`/adoptions/${id}`, { method: "PUT", body: JSON.stringify({ estado }) });
export const deleteAdopcion = (id) =>
    request(`/adoptions/${id}`, { method: "DELETE" });

/* ============================
   VOLUNTARIOS
============================ */
export const getVoluntarios = () => request("/volunteers");
export const createVoluntario = (data) =>
    request("/volunteers", { method: "POST", body: JSON.stringify(data) });
export const updateVoluntario = (id, data) =>
    request(`/volunteers/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteVoluntario = (id) =>
    request(`/volunteers/${id}`, { method: "DELETE" });
export const getVolunteerAppointments = () => request("/volunteers/appointments");
export const createVolunteerAppointment = (data) =>
    request("/volunteers/appointments", { method: "POST", body: JSON.stringify(data) });
export const updateVolunteerAppointment = (id, data) =>
    request(`/volunteers/appointments/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteVolunteerAppointment = (id) =>
    request(`/volunteers/appointments/${id}`, { method: "DELETE" });

/* ============================
   EVENTOS
============================ */
export const getEventos = () => request("/events");
export const getEventAssistants = (id) => request(`/events/${id}/assist`);
export const registerEventAssistant = (id, data) =>
    request(`/events/${id}/assist`, { method: "POST", body: JSON.stringify(data) });
export const createEvento = (data) => {
    if (data instanceof FormData) {
        return request("/events", { method: "POST", body: data });
    }
    return request("/events", { method: "POST", body: JSON.stringify(data) });
};
export const updateEvento = (id, data) => {
    if (data instanceof FormData) {
        return request(`/events/${id}`, { method: "PUT", body: data });
    }
    return request(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) });
};
export const deleteEvento = (id) =>
    request(`/events/${id}`, { method: "DELETE" });

/* ============================
   DONACIONES
============================ */
export const getDonaciones = () => request("/donations");
export const createDonacion = (data) =>
    request("/donations", { method: "POST", body: JSON.stringify(data) });

/* ============================
   TIPOS DE PAGO
============================ */
export const getPaymentTypes = () => request("/payment-types");
export const createPaymentType = (data) =>
    request("/payment-types", { method: "POST", body: JSON.stringify(data) });
export const updatePaymentType = (id, data) =>
    request(`/payment-types/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePaymentType = (id) =>
    request(`/payment-types/${id}`, { method: "DELETE" });

/* ============================
   MFA ADMIN
============================ */
export const setupAdminMfa = () => request("/auth/mfa/setup");
export const enableAdminMfa = (code) =>
    request("/auth/mfa/enable", { method: "POST", body: JSON.stringify({ code }) });
export const disableAdminMfa = (code) =>
    request("/auth/mfa/disable", { method: "POST", body: JSON.stringify({ code }) });
export const regenerateAdminRecoveryCodes = (code) =>
    request("/auth/mfa/recovery/regenerate", { method: "POST", body: JSON.stringify({ code }) });
