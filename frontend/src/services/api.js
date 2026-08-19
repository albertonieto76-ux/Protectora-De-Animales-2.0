const API_URL = import.meta.env.VITE_API_URL || "/api";

// ANIMALES
export async function getAnimales() {
    const res = await fetch(`${API_URL}/animals`);
    return res.json();
}

export async function createAnimal(data) {
    const options = {
        method: "POST",
        body: data instanceof FormData ? data : JSON.stringify(data),
        ...(data instanceof FormData ? {} : { headers: { "Content-Type": "application/json" } }),
    };
    const res = await fetch(`${API_URL}/animals`, options);
    return res.json();
}

export async function updateAnimal(id, data) {
    const options = {
        method: "PUT",
        body: data instanceof FormData ? data : JSON.stringify(data),
        ...(data instanceof FormData ? {} : { headers: { "Content-Type": "application/json" } }),
    };
    const res = await fetch(`${API_URL}/animals/${id}`, options);
    return res.json();
}

export async function deleteAnimal(id) {
    const res = await fetch(`${API_URL}/animals/${id}`, {
        method: "DELETE",
    });
    return res.json();
}

export async function getAnimalById(id) {
    const res = await fetch(`${API_URL}/animals/${id}`);
    return res.json();
}

// ADOPCIONES
export async function getAdopciones() {
    const res = await fetch(`${API_URL}/adoptions`);
    return res.json();
}

export async function createAdopcion(data) {
    const res = await fetch(`${API_URL}/adoptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) {
        throw new Error(response?.error || "No se pudo registrar la solicitud de adopción");
    }
    return response;
}


export async function getAdopcionById(id) {
    const res = await fetch(`${API_URL}/adoptions/${id}`);
    return res.json();
}

// VOLUNTARIOS
export async function getVoluntarios() {
    const res = await fetch(`${API_URL}/volunteers`);
    return res.json();
}

export async function createVoluntario(data) {
    const res = await fetch(`${API_URL}/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) {
        throw new Error(response?.error || "No se pudo registrar la solicitud de voluntariado");
    }
    return response;
}

// EVENTOS
export async function getEventos() {
    const res = await fetch(`${API_URL}/events`);
    return res.json();
}

export async function createEvento(data) {
    const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

// DONACIONES
export async function getDonaciones() {
    const res = await fetch(`${API_URL}/donations`);
    return res.json();
}

export async function createDonacion(data) {
    const res = await fetch(`${API_URL}/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) {
        throw new Error(response?.error || "No se pudo registrar la donación");
    }
    return response;
}

export async function getPaymentTypes() {
    const res = await fetch(`${API_URL}/payment-types`);
    return res.json();
}

export async function createPaymentType(data) {
    const res = await fetch(`${API_URL}/payment-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updatePaymentType(id, data) {
    const res = await fetch(`${API_URL}/payment-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deletePaymentType(id) {
    const res = await fetch(`${API_URL}/payment-types/${id}`, {
        method: "DELETE",
    });
    return res.json();
}
