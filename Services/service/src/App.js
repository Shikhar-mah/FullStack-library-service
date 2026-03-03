import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Layout from "./layout/layout";
import BookPage from "./pages/BookPage";
import BorrowForm from "./pages/BorrowForm";
import MyBorrowedBooks from "./pages/MyBorrowedBooks";
import Login from "./pages/Login";
import UserShowBooks from "./pages/UserShowBooks";
import Demo from "./pages/Demo";
import AllUsers from "./pages/AllUsers";

function App() {
    const isTokenValid = () => {
        const token = localStorage.getItem("token");
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    };

    const isLoggedIn = isTokenValid();

    return (
        <BrowserRouter>
            <Toaster position="top-right" reverseOrder={false} />
            <Routes>
                <Route path="/login" element={<Login />} />

                {isLoggedIn && (
                    <Route element={<Layout />}>
                        <Route path="/" element={<BookPage />} />
                        <Route path="/book" element={<BookPage />} />
                        <Route path="/borrow" element={<BorrowForm />} />
                        <Route path="/my-borrowed" element={<MyBorrowedBooks />} />
                        <Route path="/users" element={<AllUsers  />} />
                    </Route>
                )}

                {!isLoggedIn && <Route path="*" element={<Login />} />}
                <Route path="/user-home" element={<UserShowBooks/>} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;