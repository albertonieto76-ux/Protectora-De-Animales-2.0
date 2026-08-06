const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const ADMIN_TOKEN = "supersecreto123";

// Helper genérico para peticiones
async function request(endpoint, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        "x-admin-token": ADMIN_TOKEN,
        ...(options.headers || {})
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
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

/* ============================
   ANIMALES
============================ */
export const getAnimales = () => request("/animals");
export const getAnimalById = (id) => request(`/animals/${id}`);
export const createAnimal = (data) =>
    request("/animals", { method: "POST", body: JSON.stringify(data) });
export const updateAnimal = (id, data) =>
    request(`/animals/${id}`, { method: "PUT", body: JSON.stringify(data) });
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
export const deleteVoluntario = (id) =>
    request(`/volunteers/${id}`, { method: "DELETE" });

/* ============================
   EVENTOS
============================ */
export const getEventos = () => request("/events");
export const createEvento = (data) =>
    request("/events", { method: "POST", body: JSON.stringify(data) });
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
