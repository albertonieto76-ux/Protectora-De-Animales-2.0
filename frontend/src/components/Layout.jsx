
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function Layout() {
    const location = useLocation();
    const isHome = location.pathname === "/";

    return (
        <>
            <Navbar />
            <main style={isHome ? { padding: 0 } : { padding: "2rem" }}>
                <Outlet />
            </main>
        </>
    );
}
