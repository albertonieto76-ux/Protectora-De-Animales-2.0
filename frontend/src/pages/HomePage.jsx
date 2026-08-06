export default function HomePage() {
    return (
        <div style={{ fontFamily: "Inter, sans-serif" }}>
            {/* HERO */}
            <section
                style={{
                    background:
                        "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1558944351-c7e6a1a7c3b9') center/cover",
                    padding: "8rem 2rem",
                    color: "white",
                    textAlign: "center",
                    animation: "fadeIn 1.5s ease-out",
                }}
            >
                <h1
                    style={{
                        fontSize: "3.8rem",
                        marginBottom: "1rem",
                        fontWeight: "700",
                        animation: "slideDown 1.2s ease-out",
                    }}
                >
                    Protectora de Animales
                </h1>

            </section>

            {/* FOOTER */}
            <footer
                style={{
                    padding: "2rem",
                    textAlign: "center",
                    background: "#f3f3f3",
                    marginTop: "3rem",
                    fontSize: "0.95rem",
                    animation: "fadeIn 2s ease-out",
                }}
            >
                <p>© 2026 Protectora de Animales — Proyecto de Alberto</p>
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

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(25px); }
            to { opacity: 1; transform: translateY(0); }
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
