import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiAuth } from "../api";
import "../CSS/Login.css"; // We'll create this CSS file for animations

function Login() {
    const navigate = useNavigate();
    const [isLoginMode, setIsLoginMode] = useState(true);

    // Login form state
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Register form state - Added email field
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState(""); // New email field
    const [registerUsername, setRegisterUsername] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI state
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (password) => {
        return password.length >= 5;
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setError("Please enter both username and password");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const response = await apiAuth.post("/login", {
                username,
                password,
            });

            localStorage.setItem("token", response.data.token);
            navigate("/book");

        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || "Invalid credentials");
            } else if (err.request) {
                setError("Server not responding. Check backend.");
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        // Validation - Added email validation
        if (!registerName.trim() || !registerEmail.trim() || !registerUsername.trim() || !registerPassword.trim() || !confirmPassword.trim()) {
            setError("Please fill in all fields");
            return;
        }

        if (!validateEmail(registerEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        if (!validatePassword(registerPassword)) {
            setError("Password must be at least 5 characters long");
            return;
        }

        if (registerPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const response = await apiAuth.post("/register", {
                name: registerName,
                email: registerEmail, // Added email field
                username: registerUsername,
                password: registerPassword,
            });

            setSuccess("Registration successful! Please login.");

            // Clear registration form - Added email to cleared fields
            setRegisterName("");
            setRegisterEmail("");
            setRegisterUsername("");
            setRegisterPassword("");
            setConfirmPassword("");

            // Switch to login mode after 2 seconds
            setTimeout(() => {
                setIsLoginMode(true);
                setSuccess("");
            }, 2000);

        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || "Registration failed");
            } else if (err.request) {
                setError("Server not responding. Check backend.");
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            if (isLoginMode) {
                handleLogin();
            } else {
                handleRegister();
            }
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError("");
        setSuccess("");

        // Clear forms - Added email to cleared fields
        setUsername("");
        setPassword("");
        setRegisterName("");
        setRegisterEmail("");
        setRegisterUsername("");
        setRegisterPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="auth-container">
            <div className={`auth-card ${isLoginMode ? 'login-mode' : 'register-mode'}`}>
                <h2 className="auth-title">{isLoginMode ? "Welcome Back" : "Create Account"}</h2>

                {/* Toggle Buttons */}
                <div className="toggle-container">
                    <button
                        className={`toggle-btn ${isLoginMode ? 'active' : ''}`}
                        onClick={() => setIsLoginMode(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`toggle-btn ${!isLoginMode ? 'active' : ''}`}
                        onClick={() => setIsLoginMode(false)}
                    >
                        Register
                    </button>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="message error-message slide-in">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="message success-message slide-in">
                        {success}
                    </div>
                )}

                {/* Login Form */}
                {isLoginMode ? (
                    <div className="form-container fade-in">
                        <input
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError("");
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder="Username"
                            value={username}
                            disabled={isLoading}
                            className="auth-input"
                            autoFocus
                        />

                        <input
                            type="password"
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder="Password"
                            value={password}
                            disabled={isLoading}
                            className="auth-input"
                        />

                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="auth-button"
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </div>
                ) : (
                    // Register Form - Added email field
                    <div className="form-container fade-in">
                        <input
                            onChange={(e) => {
                                setRegisterName(e.target.value);
                                setError("");
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder="Full Name"
                            value={registerName}
                            disabled={isLoading}
                            className="auth-input"
                            autoFocus
                        />

                        {/* New Email Field */}
                        <input
                            onChange={(e) => {
                                setRegisterEmail(e.target.value);
                                setError("");
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder="Email"
                            type="email"
                            value={registerEmail}
                            disabled={isLoading}
                            className="auth-input"
                        />

                        <input
                            onChange={(e) => {
                                setRegisterUsername(e.target.value);
                                setError("");
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder="Username"
                            value={registerUsername}
                            disabled={isLoading}
                            className="auth-input"
                        />

                        <input
                            type="password"
                            onChange={(e) => {
                                setRegisterPassword(e.target.value);
                                setError("");
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder="Password (min. 5 characters)"
                            value={registerPassword}
                            disabled={isLoading}
                            className="auth-input"
                        />

                        {registerPassword && !validatePassword(registerPassword) && (
                            <div className="validation-hint">
                                Password must be at least 5 characters
                            </div>
                        )}

                        <input
                            type="password"
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setError("");
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            disabled={isLoading}
                            className="auth-input"
                        />

                        {confirmPassword && registerPassword !== confirmPassword && (
                            <div className="validation-hint">
                                Passwords do not match
                            </div>
                        )}

                        <button
                            onClick={handleRegister}
                            disabled={isLoading}
                            className="auth-button"
                        >
                            {isLoading ? "Creating Account..." : "Register"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;