import { useEffect, useState } from "react";
import {
    getAnimales,
    getAnimalById,
    createAnimal,
    updateAnimal,
    deleteAnimal,
} from "../services/api";

export function useAnimales() {
    const [animales, setAnimales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarAnimales = async () => {
        try {
            setLoading(true);
            const data = await getAnimales();
            setAnimales(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const crear = async (animal) => {
        await createAnimal(animal);
        await cargarAnimales();
    };

    const actualizar = async (id, animal) => {
        await updateAnimal(id, animal);
        await cargarAnimales();
    };

    const eliminar = async (id) => {
        await deleteAnimal(id);
        await cargarAnimales();
    };

    useEffect(() => {
        cargarAnimales();
    }, []);

    return {
        animales,
        loading,
        error,
        cargarAnimales,
        crear,
        actualizar,
        eliminar,
    };
}
