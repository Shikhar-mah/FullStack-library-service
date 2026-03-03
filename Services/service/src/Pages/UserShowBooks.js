import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {apiBooks} from "../api";
import Sidebar from "./Sidebar";
import  "../App.css";

function UserShowBooks() {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loggedUser, setLoggedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all"); // Track active filter
    const [showFilter, setShowFilter] = useState(true);


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

    useEffect(() => {
        if (searchTerm ) {
            // Hide filter if search has no matching results
            setShowFilter(false);
        } else {
            // Show filter if search is empty or there are matching results
            setShowFilter(true);
        }
    }, [searchTerm]);
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const response = await apiBooks.get("user/books");
                // Sort by stock descending
                const sortedBooks = response.data.sort((a, b) => b.stock - a.stock);
                setBooks(sortedBooks);
                setFilteredBooks(sortedBooks); // Initialize filtered books
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

    // Search function that checks all book fields
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredBooks(books);
        } else {
            const lowercasedSearch = searchTerm.toLowerCase();
            const filtered = books.filter(book => {
                // Check all fields of the book
                return (
                    (book.id?.toString().toLowerCase().includes(lowercasedSearch)) ||
                    (book.name?.toLowerCase().includes(lowercasedSearch)) ||
                    (book.writer?.toLowerCase().includes(lowercasedSearch)) ||
                    (book.stock?.toString().toLowerCase().includes(lowercasedSearch)) ||
                    (book.trend?.toLowerCase().includes(lowercasedSearch)) ||
                    (book.category?.toLowerCase().includes(lowercasedSearch)) ||
                    (book.isbn?.toLowerCase().includes(lowercasedSearch)) ||
                    (book.publisher?.toLowerCase().includes(lowercasedSearch)) ||
                    (book.description?.toLowerCase().includes(lowercasedSearch)) ||
                    (book.publicationYear?.toString().toLowerCase().includes(lowercasedSearch))
                );
            });
            setFilteredBooks(filtered);
        }
    }, [searchTerm, books]);

        function clears() {
            console.log("edwjef")
            setFilteredBooks([]);
            setShowFilter(false);
        }
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
    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm("");
    };

    // Get stock status
    const getStockStatus = (stock) => {
        if (stock <= 0) return { text: "Out of Stock", class: "out-of-stock" };
        if (stock < 5) return { text: "Low Stock", class: "low-stock" };
        return { text: "In Stock", class: "in-stock" };
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

                {/* Search Bar */}
                <div className="search-container">
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Search books by ID, name, writer, category, publisher, ISBN, description, year..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="search-clear-btn"
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                        <span className="search-icon">🔍</span>
                    </div>
                    {searchTerm && filteredBooks.length === 0 && (
                        <div className="no-search-results">
                            <p>No books found matching "{searchTerm}"</p>
                            <button
                                onClick={clearSearch}
                                className="clear-search-btn"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>
                {/* Filter Buttons */}
                {showFilter && (<div className="filter-section" id="filter-section">
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
                </div>)}
                {/* Books Grid */}
                {filteredBooks.length === 0 && searchTerm === "" ? (
                    <div className="empty-state">
                        <p>No books found in the library.</p>
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

export default UserShowBooks;