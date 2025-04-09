import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthContext"; // ⬅️ use global login logic
import "./styles.css";

const Login = () => {
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth(); // ⬅️ pulls in the login function

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!user_id || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      const response = await axios.post("/api/auth/login", {
        user_id,
        password,
      });

      if (response.data.success) {
        login(response.data.token); // ⬅️ updates auth context
        localStorage.setItem("user_id", user_id);

        // Fetch user profile
        const profileResponse = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${response.data.token}` },
        });

        localStorage.setItem("name", profileResponse.data.user.name);

        navigate("/profile");
      } else {
        setError(response.data.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login Axios Error:", error.response?.data || error.message);
      setError(
        "Login failed: " +
          (error.response?.data.details || "Check the console for more details.")
      );
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}

        <label>Username:</label>
        <input
          type="text"
          placeholder="Enter your username"
          value={user_id}
          onChange={(e) => setUserId(e.target.value)}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="continue-button">
          Login
        </button>
      </form>

      <p className="signup-text">New here?</p>
      <button className="signup-button" onClick={() => navigate("/signup")}>
        Sign Up
      </button>
    </div>
  );
};

export default Login;
