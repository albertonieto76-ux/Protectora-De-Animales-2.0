import { useEffect, useState } from "react";
import {
    getVoluntarios,
    createVoluntario,
} from "../services/api";

export function useVoluntarios() {
    const [voluntarios, setVoluntarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarVoluntarios = async () => {
        try {
            setLoading(true);
            const data = await getVoluntarios();
            setVoluntarios(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const crear = async (voluntario) => {
        await createVoluntario(voluntario);
        await cargarVoluntarios();
    };

    useEffect(() => {
        cargarVoluntarios();
    }, []);

    return {
        voluntarios,
        loading,
        error,
        cargarVoluntarios,
        crear,
    };
}
