import React, { useEffect, useState } from "react";
import { apiAuth } from "../api";
import toast from "react-hot-toast";

function AllUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsActive(true); // user is logged in
        } else {
            setIsActive(false); // user is logged out
        }
    }, []);
    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = () => {
        setLoading(true);
        apiAuth
            .get("allUsers")
            .then((res) => {
                setUsers(res.data);
                console.log(res.data);
                setError(null);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching users:", err);
                setError("Failed to load users. Please try again.");
                setLoading(false);
                toast.error("Failed to load users");
            });
    };

    // Handle sorting
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sortedUsers = [...users].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
            return 0;
        });
        setUsers(sortedUsers);
    };

    // Filter users based on search term
    const filteredUsers = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.role?.toLowerCase().includes(searchLower) ||
            user.id?.toString().includes(searchLower)
        );
    });

    // Get sort icon
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return "↕️";
        return sortConfig.direction === "asc" ? "↑" : "↓";
    };

    if (loading) {
        return (
            <div style={styles.centerContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.centerContainer}>
                <p style={{ color: "#dc3545" }}>{error}</p>
                <button onClick={fetchAllUsers} style={styles.retryButton}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>User Management</h1>
                    <p style={styles.subtitle}>Total Users: {users.length}</p>
                </div>
                <div style={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="🔍 Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
            </div>

            {filteredUsers.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={styles.emptyText}>No users found matching your search.</p>
                    <button onClick={() => setSearchTerm("")} style={styles.clearButton}>
                        Clear Search
                    </button>
                </div>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead style={styles.tableHead}>
                        <tr>
                            <th style={styles.tableHeader} onClick={() => handleSort("id")}>
                                ID {getSortIcon("id")}
                            </th>
                            <th style={styles.tableHeader} onClick={() => handleSort("name")}>
                                Name {getSortIcon("name")}
                            </th>
                            <th style={styles.tableHeader} onClick={() => handleSort("email")}>
                                Email {getSortIcon("email")}
                            </th>
                            <th style={styles.tableHeader} onClick={() => handleSort("role")}>
                                Role {getSortIcon("role")}
                            </th>
                            <th style={styles.tableHeader} onClick={() => handleSort("status")}>
                                Status {getSortIcon("status")}
                            </th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map((user, index) => (
                            <tr key={user.id || index} style={styles.tableRow}>
                                <td style={styles.tableCell}>
                                    <span style={styles.userId}>{user.id}</span>
                                </td>
                                <td style={styles.tableCell}>
                                    <div style={styles.userInfo}>
                                        <span style={styles.userName}>{user.name || "N/A"}</span>
                                    </div>
                                </td>
                                <td style={styles.tableCell}>
                                    <span style={styles.userEmail}>{user.email}</span>
                                </td>
                                <td style={styles.tableCell}>
                    <span style={{
                        ...styles.roleBadge,
                        backgroundColor: user.role === "ADMIN" ? "#dc3545" : "#28a745"
                    }}>
                      {user.role || "USER"}
                    </span>
                                </td>
                                <td style={styles.tableCell}>
                    <span style={{
                        ...styles.statusBadge,
                        backgroundColor: user.status === "ACTIVE" ? "#28a745" : "#6c757d"
                    }}>
                      {user.status || "ACTIVE"}
                    </span>
                                </td>
                                <td style={styles.tableCell}>
                                    <button
                                        style={styles.viewButton}
                                        onClick={() => toast.info(`Viewing details for ${user.name || user.email}`)}
                                    >
                                        👁️ View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary Footer */}
            <div style={styles.footer}>
                <div style={styles.footerStats}>
          <span style={styles.footerStat}>
            <strong>Active:</strong> {users.filter(u => u.status !== "INACTIVE").length}
          </span>
                    <span style={styles.footerStat}>
            <strong>Admins:</strong> {users.filter(u => u.role === "ADMIN").length}
          </span>
                    <span style={styles.footerStat}>
            <strong>Users:</strong> {users.filter(u => u.role !== "ADMIN").length}
          </span>
                </div>
                <button onClick={fetchAllUsers} style={styles.refreshButton}>
                    🔄 Refresh
                </button>
            </div>
        </div>
    );
}

export default AllUsers;

const styles = {
    container: {
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh"
    },
    header: {
        marginBottom: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
    },
    title: {
        fontSize: "2rem",
        fontWeight: "600",
        color: "#1a1a1a",
        margin: "0 0 0.5rem 0",
        letterSpacing: "-0.02em"
    },
    subtitle: {
        fontSize: "1rem",
        color: "#6c757d",
        margin: 0
    },
    searchBox: {
        minWidth: "300px"
    },
    searchInput: {
        width: "100%",
        padding: "12px 16px",
        border: "2px solid #e9ecef",
        borderRadius: "8px",
        fontSize: "0.95rem",
        transition: "all 0.2s ease",
        backgroundColor: "white"
    },
    centerContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center"
    },
    tableWrapper: {
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        border: "1px solid #e9ecef",
        overflow: "auto"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
        fontSize: "0.95rem",
        minWidth: "800px"
    },
    tableHead: {
        backgroundColor: "#f8f9fa",
        borderBottom: "2px solid #e9ecef"
    },
    tableHeader: {
        padding: "1rem 1.5rem",
        fontWeight: "600",
        color: "#495057",
        textTransform: "uppercase",
        fontSize: "0.85rem",
        letterSpacing: "0.02em",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        userSelect: "none"
    },
    tableRow: {
        borderBottom: "1px solid #e9ecef",
        transition: "background-color 0.2s ease"
    },
    tableCell: {
        padding: "1rem 1.5rem",
        color: "#1a1a1a"
    },
    userId: {
        fontFamily: "monospace",
        backgroundColor: "#f8f9fa",
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
        fontSize: "0.9rem",
        fontWeight: "500"
    },
    userInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem"
    },
    userName: {
        fontWeight: "500",
        color: "#1a1a1a"
    },
    userEmail: {
        color: "#6c757d",
        fontSize: "0.9rem"
    },
    roleBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        color: "white",
        fontSize: "0.85rem",
        fontWeight: "500",
        textAlign: "center",
        minWidth: "80px"
    },
    statusBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        color: "white",
        fontSize: "0.85rem",
        fontWeight: "500",
        textAlign: "center",
        minWidth: "80px"
    },
    viewButton: {
        padding: "6px 12px",
        backgroundColor: "#f8f9fa",
        color: "#1a1a1a",
        border: "1px solid #e9ecef",
        borderRadius: "6px",
        fontSize: "0.85rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease"
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "3px solid #e9ecef",
        borderTop: "3px solid #1a1a1a",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "1rem"
    },
    loadingText: {
        color: "#6c757d",
        fontSize: "1rem"
    },
    emptyState: {
        textAlign: "center",
        padding: "60px 20px",
        background: "white",
        borderRadius: "12px",
        border: "1px dashed #cbd5e1"
    },
    emptyText: {
        fontSize: "1.2rem",
        color: "#6c757d",
        marginBottom: "1.5rem"
    },
    clearButton: {
        padding: "10px 24px",
        backgroundColor: "#1a1a1a",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease"
    },
    retryButton: {
        marginTop: "1rem",
        padding: "10px 24px",
        backgroundColor: "#1a1a1a",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "500",
        cursor: "pointer"
    },
    footer: {
        marginTop: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        padding: "1rem",
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #e9ecef"
    },
    footerStats: {
        display: "flex",
        gap: "2rem",
        flexWrap: "wrap"
    },
    footerStat: {
        color: "#495057",
        fontSize: "0.95rem"
    },
    refreshButton: {
        padding: "8px 16px",
        backgroundColor: "#f8f9fa",
        color: "#1a1a1a",
        border: "1px solid #e9ecef",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease"
    }
};

// Add this to your global CSS or as a style tag
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .table-header:hover {
    background-color: #e9ecef;
  }

  tbody tr:hover {
    background-color: #f8f9fa;
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  .view-button:hover {
    background-color: #1a1a1a;
    color: white;
    border-color: #1a1a1a;
  }

  .clear-button:hover,
  .retry-button:hover,
  .refresh-button:hover {
    background-color: #333;
    color: white;
  }

  .search-input:focus {
    outline: none;
    border-color: #1a1a1a;
    box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
  }
`;