import { useEffect, useState } from "react";
import { createAdopcion, getAnimales } from "../services/api";

const formAdopInicial = { nombre: "", email: "", telefono: "", mensaje: "" };

export default function HomePage() {
    const [animales, setAnimales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [adopForm, setAdopForm] = useState(formAdopInicial);
    const [adopEnviando, setAdopEnviando] = useState(false);
    const [adopEnviado, setAdopEnviado] = useState(false);

    useEffect(() => {
        async function cargarAnimales() {
            try {
                const data = await getAnimales();
                const ordenados = [...data].sort((a, b) => {
                    const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return fechaA - fechaB;
                });
                setAnimales(ordenados.slice(0, 10));
            } catch (err) {
                console.error("Error cargando animales de la home:", err);
                setAnimales([]);
            } finally {
                setLoading(false);
            }
        }

        cargarAnimales();
    }, []);

    const openAnimalModal = (animal, index = 0) => {
        setSelectedAnimal(animal);
        setSelectedImageIndex(index);
        setAdopForm(formAdopInicial);
        setAdopEnviado(false);
    };

    const closeAnimalModal = () => {
        setSelectedAnimal(null);
        setSelectedImageIndex(0);
        setAdopForm(formAdopInicial);
        setAdopEnviado(false);
    };

    const nextImage = () => {
        if (!selectedAnimal?.images?.length) return;
        setSelectedImageIndex((current) => (current + 1) % selectedAnimal.images.length);
    };

    const prevImage = () => {
        if (!selectedAnimal?.images?.length) return;
        setSelectedImageIndex((current) => (current - 1 + selectedAnimal.images.length) % selectedAnimal.images.length);
    };

    const handleAdopSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAnimal) return;

        setAdopEnviando(true);
        try {
            await createAdopcion({
                ...adopForm,
                animalId: selectedAnimal.id,
            });
            setAdopEnviado(true);
        } catch (err) {
            console.error("Error enviando adopción desde la home:", err);
        } finally {
            setAdopEnviando(false);
        }
    };

    return (
        <div
            style={{
                fontFamily: "Inter, sans-serif",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* HERO */}
            <section
                style={{
                    background:
                        "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1558944351-c7e6a1a7c3b9') center/cover",
                    padding: "2rem 2rem 4rem",
                    color: "white",
                    textAlign: "center",
                    animation: "fadeIn 1.5s ease-out",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                }}
            >
                <h1
                    style={{
                        fontSize: "3rem",
                        marginTop: "1rem",
                        marginBottom: "1.5rem",
                        fontWeight: "700",
                        animation: "slideDown 1.2s ease-out",
                        fontFamily: "'Comic Sans MS', 'Trebuchet MS', cursive",
                        letterSpacing: "0.04em",
                        textShadow: "0 2px 8px rgba(0,0,0,0.35)",
                    }}
                >
                    DA UNA SEGUNDA OPORTUNIDAD
                </h1>

                <div style={{ width: "100%", maxWidth: "1200px" }}>
                    {loading ? (
                        <p style={{ color: "#fff" }}>Cargando animales...</p>
                    ) : animales.length === 0 ? (
                        <p style={{ color: "#fff" }}>No hay animales disponibles en este momento.</p>
                    ) : (
                        <div className="home-animals-grid">
                            {animales.map((animal, index) => {
                                const images = animal.images?.length > 0 ? animal.images : [];
                                const imageSrc = images[0] || "";

                                return (
                                    <button
                                        key={animal.id}
                                        type="button"
                                        onClick={() => openAnimalModal(animal, 0)}
                                        style={{
                                            border: "none",
                                            borderRadius: "18px",
                                            padding: 0,
                                            background: "rgba(255,255,255,0.95)",
                                            color: "#222",
                                            overflow: "hidden",
                                            cursor: "pointer",
                                            boxShadow: "0 8px 22px rgba(0,0,0,0.2)",
                                            textAlign: "left",
                                        }}
                                    >
                                        <div style={{ height: "170px", background: "#f2f2f2" }}>
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    alt={animal.name || animal.nombre}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            ) : (
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", fontSize: "2.5rem" }}>
                                                    🐾
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: "0.85rem" }}>
                                            <strong style={{ display: "block", fontSize: "1rem", marginBottom: "0.25rem" }}>
                                                {animal.name || animal.nombre}
                                            </strong>
                                            <span style={{ fontSize: "0.9rem", color: "#666" }}>
                                                {animal.species || animal.especie || "Animal"}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {selectedAnimal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.72)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        zIndex: 1000,
                    }}
                    onClick={closeAnimalModal}
                >
                    <div
                        style={{
                            background: "#fff",
                            color: "#222",
                            borderRadius: "24px",
                            width: "100%",
                            maxWidth: "900px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            padding: "1.5rem",
                            position: "relative",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={closeAnimalModal}
                            style={{
                                position: "absolute",
                                top: "1rem",
                                right: "1rem",
                                border: "none",
                                background: "#f3f3f3",
                                borderRadius: "999px",
                                width: "38px",
                                height: "38px",
                                cursor: "pointer",
                                fontSize: "1.1rem",
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "1.15fr 0.85fr" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                                    {selectedAnimal.images?.length > 1 && (
                                        <button type="button" onClick={prevImage} style={modalNavButtonStyle}>
                                            ‹
                                        </button>
                                    )}
                                    <img
                                        src={selectedAnimal.images?.[selectedImageIndex] || selectedAnimal.images?.[0] || ""}
                                        alt={selectedAnimal.name || selectedAnimal.nombre}
                                        style={{ width: "100%", maxHeight: "320px", objectFit: "cover", borderRadius: "16px" }}
                                    />
                                    {selectedAnimal.images?.length > 1 && (
                                        <button type="button" onClick={nextImage} style={modalNavButtonStyle}>
                                            ›
                                        </button>
                                    )}
                                </div>

                                {selectedAnimal.images?.length > 1 && (
                                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", overflowX: "auto" }}>
                                        {selectedAnimal.images.map((src, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setSelectedImageIndex(index)}
                                                style={{
                                                    border: selectedImageIndex === index ? "2px solid #f59e0b" : "2px solid #e5e7eb",
                                                    borderRadius: "10px",
                                                    padding: 0,
                                                    background: "transparent",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <img src={src} alt={`${selectedAnimal.name || selectedAnimal.nombre} ${index + 1}`} style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "8px" }} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                                    {selectedAnimal.name || selectedAnimal.nombre}
                                </h2>
                                <p style={{ lineHeight: 1.6, color: "#555", marginBottom: "0.9rem" }}>
                                    {selectedAnimal.description || selectedAnimal.descripcion || "Este animal está esperando una familia que le ofrezca cariño, estabilidad y un hogar lleno de oportunidades."}
                                </p>
                                <div style={{ display: "grid", gap: "0.45rem", marginBottom: "1rem" }}>
                                    <span><strong>Especie:</strong> {selectedAnimal.species || selectedAnimal.especie || "No especificada"}</span>
                                    <span><strong>Edad:</strong> {selectedAnimal.age || selectedAnimal.edad || "No especificada"}</span>
                                </div>

                                {adopEnviado ? (
                                    <div style={{ background: "#ecfdf3", color: "#065f46", padding: "0.9rem", borderRadius: "12px" }}>
                                        ¡Solicitud enviada correctamente! Te contactaremos pronto.
                                    </div>
                                ) : (
                                    <form onSubmit={handleAdopSubmit} style={{ display: "grid", gap: "0.75rem" }}>
                                        <input
                                            type="text"
                                            placeholder="Tu nombre *"
                                            required
                                            value={adopForm.nombre}
                                            onChange={(e) => setAdopForm({ ...adopForm, nombre: e.target.value })}
                                            style={modalInputStyle}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Tu email *"
                                            required
                                            value={adopForm.email}
                                            onChange={(e) => setAdopForm({ ...adopForm, email: e.target.value })}
                                            style={modalInputStyle}
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Teléfono"
                                            value={adopForm.telefono}
                                            onChange={(e) => setAdopForm({ ...adopForm, telefono: e.target.value })}
                                            style={modalInputStyle}
                                        />
                                        <textarea
                                            placeholder="Cuéntanos por qué quieres adoptar"
                                            value={adopForm.mensaje}
                                            onChange={(e) => setAdopForm({ ...adopForm, mensaje: e.target.value })}
                                            style={{ ...modalInputStyle, minHeight: "90px", resize: "vertical" }}
                                        />
                                        <button type="submit" disabled={adopEnviando} style={modalSubmitStyle}>
                                            {adopEnviando ? "Enviando..." : "Solicitar adopción"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer
                style={{
                    padding: "2rem",
                    textAlign: "center",
                    background: "#f3f3f3",
                    marginTop: "auto",
                    fontSize: "0.95rem",
                    animation: "fadeIn 2s ease-out",
                }}
            >
                <p>© 2026 Protectora de Animales — Proyecto de Alberto Nieto López</p>
                <p>
                    <a href="mailto:alberto.nieto@experienceis.com">alberto.nieto@experienceis.com</a>
                </p>
            </footer>

            {/* ANIMACIONES */}
            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-25px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .home-animals-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 1rem;
            width: 100%;
          }

          @media (max-width: 1100px) {
            .home-animals-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 700px) {
            .home-animals-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          /* MODO OSCURO AUTOMÁTICO */
          @media (prefers-color-scheme: dark) {
            body {
              background: #121212;
              color: #e0e0e0;
            }

            footer {
              background: #1e1e1e !important;
              color: #ccc !important;
            }

            a {
              color: #e0e0e0 !important;
            }
          }
        `}
            </style>
        </div>
    );
}

const modalNavButtonStyle = {
    border: "none",
    background: "#f3f3f3",
    borderRadius: "999px",
    width: "42px",
    height: "42px",
    fontSize: "1.4rem",
    cursor: "pointer",
};

const modalInputStyle = {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "0.8rem 0.9rem",
    fontSize: "0.95rem",
    boxSizing: "border-box",
};

const modalSubmitStyle = {
    border: "none",
    borderRadius: "12px",
    padding: "0.9rem 1rem",
    background: "#f59e0b",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
};
