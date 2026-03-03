import { NavLink } from "react-router-dom";
import {getUserFromToken} from "../api";
function Sidebar() {
    const user = getUserFromToken();
    const role = user?.role;
    return (
        <div style={styles.sidebar}>
            <h2 style={styles.logo}>📚 Library App</h2>

            <nav style={styles.nav}>
                <NavLink
                    to="/book"
                    style={({ isActive }) =>
                        isActive ? styles.activeLink : styles.link
                    }
                >
                    📖 Show Books
                </NavLink>

                <NavLink
                    to="/borrow"
                    style={({ isActive }) =>
                        isActive ? styles.activeLink : styles.link
                    }
                >
                    ➕ Borrow Book
                </NavLink>

                <NavLink
                    to="/my-borrowed"
                    style={({ isActive }) =>
                        isActive ? styles.activeLink : styles.link
                    }
                >
                    📦 Borrowed Books
                </NavLink>
                {role === "ADMIN" && (
                    <NavLink to="/users" style={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
                        👤 All Users
                    </NavLink>
                )}

            </nav>
        </div>
    );
}

export default Sidebar;

const styles = {
    sidebar: {
        width: "250px",
        height: "100vh",
        backgroundColor: "#1a1a1a",
        color: "white",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0
    },
    logo: {
        marginBottom: "2rem",
        fontSize: "1.4rem",
        fontWeight: "600"
    },
    nav: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
    },
    link: {
        textDecoration: "none",
        color: "#cfcfcf",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        transition: "all 0.2s ease"
    },
    activeLink: {
        textDecoration: "none",
        backgroundColor: "#ffffff",
        color: "#1a1a1a",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        fontWeight: "500"
    }
};