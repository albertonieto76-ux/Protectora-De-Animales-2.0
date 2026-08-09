const API_URL = import.meta.env.VITE_API_URL || "/api";

function getCookie(name) {
    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`));
    if (!cookieValue) return "";
    return decodeURIComponent(cookieValue.split("=").slice(1).join("="));
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
        const csrfToken = getCookie("csrf_token");
        if (csrfToken) {
            headers["X-CSRF-Token"] = csrfToken;
        }
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
