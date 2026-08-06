import { useEffect, useState } from "react";
import {
    getDonaciones,
    createDonacion,
} from "../services/api";

export function useDonaciones() {
    const [donaciones, setDonaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarDonaciones = async () => {
        try {
            setLoading(true);
            const data = await getDonaciones();
            setDonaciones(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const crear = async (donacion) => {
        await createDonacion(donacion);
        await cargarDonaciones();
    };

    useEffect(() => {
        cargarDonaciones();
    }, []);

    return {
        donaciones,
        loading,
        error,
        cargarDonaciones,
        crear,
    };
}
