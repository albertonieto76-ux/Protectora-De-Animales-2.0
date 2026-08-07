import { useAnimales } from "../hooks/useAnimales";
import { useEffect, useState } from "react";

export default function AnimalesPage() {
    const { animales, loading, error } = useAnimales();
    const [selectedImage, setSelectedImage] = useState(null);

    const openGallery = (images, index) => {
        setSelectedImage({ images, index });
    };

    const closeGallery = () => {
        setSelectedImage(null);
    };

    const prevImage = () => {
        setSelectedImage((current) => {
            if (!current) return current;
            const nextIndex = (current.index - 1 + current.images.length) % current.images.length;
            return { ...current, index: nextIndex };
        });
    };

    const nextImage = () => {
        setSelectedImage((current) => {
            if (!current) return current;
            const nextIndex = (current.index + 1) % current.images.length;
            return { ...current, index: nextIndex };
        });
    };

    useEffect(() => {
        if (!selectedImage) return;

        const handleKeyDown = (event) => {
            if (event.key === "ArrowLeft") {
                prevImage();
            }
            if (event.key === "ArrowRight") {
                nextImage();
            }
            if (event.key === "Escape") {
                closeGallery();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImage]);

    if (loading) return <p>Cargando animales...</p>;
    if (error) return <p>Error cargando animales.</p>;

    return (
        <div className="page-container">
            <header style={{ marginBottom: "1.5rem" }}>
                <h1>Galería de Animales</h1>
                <p>Mira a nuestros peludos amigos y descubre sus fotos más recientes.</p>
            </header>

            {animales.length === 0 ? (
                <p>No hay animales disponibles.</p>
            ) : (
                <div className="animals-grid">
                    {animales.map((animal) => {
                        const images = animal.images?.length > 0 ? animal.images : [];

                        return (
                            <article key={animal.id} className="animal-card-btn" style={{ cursor: "default" }}>
                                <div className="animal-card-img">
                                    {images.length > 0 ? (
                                        <button
                                            type="button"
                                            onClick={() => openGallery(images, 0)}
                                            style={{ border: "none", background: "transparent", width: "100%", height: "100%", padding: 0, cursor: "pointer" }}
                                        >
                                            <img src={images[0]} alt={animal.name} />
                                        </button>
                                    ) : (
                                        <span className="animal-placeholder">
                                            {animal.species === "Perro" ? "🐶" : animal.species === "Gato" ? "🐱" : "🐾"}
                                        </span>
                                    )}
                                </div>

                                <div className="animal-card-info">
                                    <strong>{animal.name || animal.nombre}</strong>
                                    <span>{animal.species || animal.especie}{animal.age ? ` · ${animal.age} años` : ""}</span>
                                    {animal.description && <span className="animal-desc">{animal.description || animal.descripcion}</span>}
                                </div>

                                {images.length > 1 ? (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.35rem", padding: "0.75rem" }}>
                                        {images.slice(1, 7).map((src, index) => (
                                            <button
                                                type="button"
                                                key={index}
                                                onClick={() => openGallery(images, index + 1)}
                                                style={{
                                                    border: "none",
                                                    padding: 0,
                                                    background: "transparent",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <img
                                                    src={src}
                                                    alt={`${animal.name} foto ${index + 2}`}
                                                    style={{ width: "100%", height: "70px", objectFit: "cover", borderRadius: "10px" }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </article>
                        );
                    })}
                </div>
            )}

            {selectedImage && (
                <div className="gallery-modal-overlay" onClick={closeGallery}>
                    <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeGallery}>✕</button>
                        {selectedImage.images.length > 1 && (
                            <button className="gallery-nav gallery-nav-left" onClick={prevImage}>
                                ‹
                            </button>
                        )}
                        <img
                            src={selectedImage.images[selectedImage.index]}
                            alt={`Imagen ${selectedImage.index + 1}`}
                            className="gallery-modal-img"
                        />
                        {selectedImage.images.length > 1 && (
                            <button className="gallery-nav gallery-nav-right" onClick={nextImage}>
                                ›
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

