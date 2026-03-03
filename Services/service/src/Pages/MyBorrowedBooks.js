import { useEffect, useState } from "react";
import { apiBooks, apiUsers } from "../api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function MyBorrowedBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = () => {
    setLoading(true);
    apiBooks
        .get("/getbor")
        .then(res => {
          setBorrowedBooks(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load borrowed books");
          setLoading(false);
        });
  };

  const handleDelete = (borrowId) => {
    if (!window.confirm("Are you sure you want to return this book?")) return;

    setDeleteLoading(borrowId);

    apiUsers
        .delete(`/borrows/${borrowId}`)
        .then(() => {
          setBorrowedBooks(prev =>
              prev.filter(b => b.borrowerId !== borrowId)
          );
          toast.success("Book returned successfully.");
          setDeleteLoading(null);
        })
        .catch(() => {
          alert("Failed to return the book. Please try again.");
          setDeleteLoading(null);
        });
  };

  const getDueDateStatus = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { text: "Overdue", color: "#dc3545", class: "status-overdue" };
    if (daysLeft <= 3) return { text: "Due Soon", color: "#fd7e14", class: "status-due-soon" };
    return { text: "Active", color: "#28a745", class: "status-active" };
  };

  if (loading) {
    return (
        <div style={styles.centerContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading borrowed books...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div style={styles.centerContainer}>
          <p style={{ color: "#dc3545" }}>{error}</p>
          <button onClick={fetchBorrowedBooks} style={styles.retryButton}>
            Try Again
          </button>
        </div>
    );
  }

  if (borrowedBooks.length === 0) {
    return (
        <div style={styles.centerContainer}>
          <p style={styles.emptyText}>No books have been borrowed yet.</p>
          <Link to="/" style={styles.browseButton}>Browse Books</Link>
        </div>
    );
  }

  return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Borrowed Books</h1>
          <p style={styles.subtitle}>{borrowedBooks.length} active borrowings</p>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
            <tr>
              <th style={styles.tableHeader}>Book Name</th>
              <th style={styles.tableHeader}>Member ID</th>
              <th style={styles.tableHeader}>Borrow Date</th>
              <th style={styles.tableHeader}>Due Date</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Action</th>
            </tr>
            </thead>
            <tbody>
            {borrowedBooks.map((book) => {
              const borrowId = book.borrowerId;
              const dueStatus = getDueDateStatus(book.returnDate);
              const isDeleting = deleteLoading === borrowId;

              return (
                  <tr key={borrowId} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                        <span style={styles.bookName}>
                          {book.bookName || book.title || "Unknown"}
                        </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.memberId}>{book.memberId}</span>
                    </td>
                    <td style={styles.tableCell}>
                      {new Date(book.borrowDate).toLocaleDateString()}
                    </td>
                    <td style={styles.tableCell}>
                        <span style={{ color: dueStatus.color, fontWeight: 500 }}>
                          {new Date(book.returnDate).toLocaleDateString()}
                        </span>
                    </td>
                    <td style={styles.tableCell}>
                        <span style={{...styles.statusBadge, backgroundColor: dueStatus.color}}>
                          {dueStatus.text}
                        </span>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                          onClick={() => handleDelete(borrowId)}
                          disabled={isDeleting}
                          style={styles.returnButton}
                          title="Return Book"
                      >
                        {isDeleting ? (
                            <span style={styles.buttonSpinner}></span>
                        ) : (
                            "Return Book"
                        )}
                      </button>
                    </td>
                  </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
  );
}

export default MyBorrowedBooks;

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
    margin: "0",
    letterSpacing: "-0.02em"
  },
  subtitle: {
    fontSize: "1rem",
    color: "#6c757d",
    margin: 0,
    padding: "0.5rem 1rem",
    backgroundColor: "white",
    borderRadius: "20px",
    border: "1px solid #e9ecef"
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
    overflow: "hidden"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "0.95rem"
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
    letterSpacing: "0.02em"
  },
  tableRow: {
    borderBottom: "1px solid #e9ecef",
    transition: "background-color 0.2s ease",
    cursor: "pointer"
  },
  tableCell: {
    padding: "1rem 1.5rem",
    color: "#1a1a1a"
  },
  bookName: {
    fontWeight: "500",
    color: "#1a1a1a"
  },
  memberId: {
    fontFamily: "monospace",
    backgroundColor: "#f8f9fa",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.9rem"
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
  returnButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    minWidth: "100px"
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
  buttonSpinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  loadingText: {
    color: "#6c757d",
    fontSize: "1rem"
  },
  emptyText: {
    fontSize: "1.2rem",
    color: "#6c757d",
    marginBottom: "1.5rem"
  },
  browseButton: {
    display: "inline-block",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#1a1a1a",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "background-color 0.2s ease"
  },
  retryButton: {
    marginTop: "1rem",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#1a1a1a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "500",
    cursor: "pointer"
  }
};

// Add this to your global CSS or as a style tag
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  tbody tr:hover {
    background-color: #f8f9fa;
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  .return-button:hover {
    background-color: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.2);
  }

  .return-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .browse-button:hover,
  .retry-button:hover {
    background-color: #333;
  }

  @media (max-width: 768px) {
    .table-wrapper {
      overflow-x: auto;
    }
    
    table {
      min-width: 800px;
    }
  }
`;