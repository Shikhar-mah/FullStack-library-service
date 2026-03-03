import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiBooks } from "../api";
import "../CSS/Login.css";
import "../CSS/Books.css"; // Create this new CSS file
import Sidebar from "./Sidebar";

function Books() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // Track active filter

  // Check token and set logged user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const base64Payload = token.split(".")[1];
      const payload = JSON.parse(atob(base64Payload));
      setLoggedUser(payload.sub);
      console.log(payload.role);
      if (payload.role === "USER") {
        console.log(payload.role);
        navigate("/user-home",{ replace: true });
      }
    } catch (err) {
      console.error("Invalid token:", err);
      // Optionally remove invalid token
      // localStorage.removeItem("token");
    }
  }, [navigate]);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await apiBooks.get("getBooks");
        // Sort by stock descending
        const sortedBooks = response.data.sort((a, b) => b.stock - a.stock);
        setBooks(sortedBooks);
        setFilteredBooks(sortedBooks); // Initialize filtered books with all books
        setError(null);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please try again.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [navigate]);

  // Get stock status
  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: "Out of Stock", class: "out-of-stock" };
    if (stock < 5) return { text: "Low Stock", class: "low-stock" };
    return { text: "In Stock", class: "in-stock" };
  };

  // Filter functions
  const instock = () => {
    setLoading(true);
    const filter = books.filter(book => book.stock >= 5);
    setFilteredBooks(filter);
    setLoading(false);
    setActiveFilter("instock");
  };

  const lowstock = () => {
    const filter = books.filter(book => book.stock < 5 && book.stock > 0);
    setFilteredBooks(filter);
    setActiveFilter("lowstock");
  };

  const outOfStock = () => {
    const filter = books.filter(book => book.stock <= 0);
    setFilteredBooks(filter);
    setActiveFilter("outofstock");
  };

  const allstock = () => {
    setFilteredBooks(books);
    setActiveFilter("all");
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    switch (trend?.toLowerCase()) {
      case "up":
        return "↑";
      case "down":
        return "↓";
      default:
        return "→";
    }
  };

  if (loading) {
    return (
        <div className="books-container">
          <Sidebar />
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading books...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="books-container">
          <Sidebar />
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="retry-button"
            >
              Try Again
            </button>
          </div>
        </div>
    );
  }

  const displayName = loggedUser ? loggedUser.split("@")[0] : "";

  return (
      <>
        <Sidebar />
        <div className="books-container">
          {/* Header */}
          <header className="books-header">
            <div className="header-content">
              <h1 className="page-title">
                Welcome back{displayName ? `, ${displayName}` : ""}!
              </h1>
              <p className="book-count">{filteredBooks.length} books available</p>
            </div>
          </header>

          {/* Filter Buttons */}
          <div className="filter-section">
            <h3 className="filter-title">Filter Books</h3>
            <div className="filter-buttons">
              <button
                  className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                  onClick={allstock}
              >
                All Books
                <span className="btn-count">{books.length}</span>
              </button>
              <button
                  className={`filter-btn instock ${activeFilter === "instock" ? "active" : ""}`}
                  onClick={instock}
              >
                In Stock
                <span className="btn-count">{books.filter(b => b.stock >= 5).length}</span>
              </button>
              <button
                  className={`filter-btn lowstock ${activeFilter === "lowstock" ? "active" : ""}`}
                  onClick={lowstock}
              >
                Low Stock
                <span className="btn-count">{books.filter(b => b.stock < 5 && b.stock > 0).length}</span>
              </button>
              <button
                  className={`filter-btn outofstock ${activeFilter === "outofstock" ? "active" : ""}`}
                  onClick={outOfStock}
              >
                Out of Stock
                <span className="btn-count">{books.filter(b => b.stock <= 0).length}</span>
              </button>
            </div>
          </div>

          {/* Books Grid */}
          {filteredBooks.length === 0 ? (
              <div className="empty-state">
                <p>No books found matching the selected filter.</p>
                <button onClick={allstock} className="clear-filter-btn">
                  Clear Filter
                </button>
              </div>
          ) : (
              <div className="books-grid">
                {filteredBooks.map((book) => {
                  const stockStatus = getStockStatus(book.stock);
                  const trendIcon = getTrendIcon(book.trend);

                  return (
                      <article key={book.id} className="book-card">
                        <div className="card-header">
                          <span className="book-id">#{book.id}</span>
                          <span className={`stock-badge ${stockStatus.class}`}>
                            {stockStatus.text}
                          </span>
                        </div>

                        <h2 className="book-title">{book.name}</h2>

                        <div className="book-meta">
                          <span className="writer-label">By</span>
                          <span className="writer-name">{book.writer}</span>
                        </div>

                        <div className="book-stats">
                          <div className="stat">
                            <span className="stat-label">Stock</span>
                            <span className="stat-value">
                              {book.stock > 0 ? book.stock : "0"}
                            </span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Trend</span>
                            <span className="stat-value">
                              {trendIcon} {book.trend || "stable"}
                            </span>
                          </div>
                        </div>

                        <Link to={`/books/${book.id}`} className="book-link">
                          View Details →
                        </Link>
                      </article>
                  );
                })}
              </div>
          )}
        </div>
      </>
  );
}

export default Books;