import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Sidebar />
    <Navbar />
    <main style={{ marginLeft: 240, padding: "2rem" }}>{children}</main>
  </>
);

