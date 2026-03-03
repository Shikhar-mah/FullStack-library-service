import axios from "axios";

export const apiAuth = axios.create({
    baseURL: "http://localhost:8080/auth/",
    headers: {
        "Content-Type": "application/json",
    },
});
// BOOK SERVICE
export const apiBooks = axios.create({
    baseURL: "http://localhost:8080/BOOK-SERVICE/"
});

// BORROW SERVICE
export const apiUsers = axios.create({
    baseURL: "http://localhost:8080/BORROW-SERVICE/"
});
apiAuth.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
// 🔥 Interceptor for Books
apiBooks.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// 🔥 Interceptor for Users
apiUsers.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const getUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
};