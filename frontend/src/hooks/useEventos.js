import { useEffect, useState } from "react";
import {
    getEventos,
    createEvento,
} from "../services/api";

export function useEventos() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarEventos = async () => {
        try {
            setLoading(true);
            const data = await getEventos();
            setEventos(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const crear = async (evento) => {
        await createEvento(evento);
        await cargarEventos();
    };

    useEffect(() => {
        cargarEventos();
    }, []);

    return {
        eventos,
        loading,
        error,
        cargarEventos,
        crear,
    };
}
