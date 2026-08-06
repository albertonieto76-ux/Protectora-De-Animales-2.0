import { useAnimales } from "../hooks/useAnimales";
import { useState } from "react";

export default function AnimalesPage() {
    const { animales, loading, crear, actualizar, eliminar } = useAnimales();
    const [form, setForm] = useState({ name: "", species: "", age: "" });
    const [editId, setEditId] = useState(null);

    if (loading) return <p>Cargando animales...</p>;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editId) {
            await actualizar(editId, form);
            setEditId(null);
        } else {
            await crear(form);
        }
        setForm({ name: "", species: "", age: "" });
    };

    return (
        <div>
            <h1>Animales</h1>

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Nombre"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    placeholder="Especie"
                    value={form.species}
                    onChange={(e) => setForm({ ...form, species: e.target.value })}
                />
                <input
                    placeholder="Edad"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
                <button type="submit">{editId ? "Actualizar" : "Crear"}</button>
            </form>

            <ul>
                {animales.map((a) => (
                    <li key={a.id}>
                        {a.name} — {a.species} — {a.age}
                        <button onClick={() => setForm(a) || setEditId(a.id)}>
                            Editar
                        </button>
                        <button onClick={() => eliminar(a.id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

