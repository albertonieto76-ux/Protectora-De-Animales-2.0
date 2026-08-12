import { useEffect, useState } from "react";
import {
    getAdopciones,
    getAdopcionById,
    createAdopcion,
} from "../services/api";

export function useAdopciones() {
    const [adopciones, setAdopciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarAdopciones = async () => {
        try {
            setLoading(true);
            const data = await getAdopciones();
            setAdopciones(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const crear = async (adopcion) => {
        try {
            await createAdopcion(adopcion);
            await cargarAdopciones();
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err?.message || "No se pudo enviar la solicitud" };
        }
    };

    useEffect(() => {
        cargarAdopciones();
    }, []);

    return {
        adopciones,
        loading,
        error,
        cargarAdopciones,
        crear,
    };
}
