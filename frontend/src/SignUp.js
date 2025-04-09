import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

const SignUp = () => {
  const [user_id, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!user_id || !name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      console.log("Sending signup request:", { user_id, name, email, password });

      const response = await axios.post("/api/auth/signup", {
        user_id,
        name,
        email,
        password,
      });

      console.log("Signup Response:", response.data);

      if (response.data.success) {
        localStorage.setItem("user_id", user_id);

        const loginResponse = await axios.post("/api/auth/login", {
          user_id,
          password,
        });

        if (loginResponse.data.success) {
          localStorage.setItem("token", loginResponse.data.token);

          const profileResponse = await axios.get("/api/auth/profile", {
            headers: { Authorization: `Bearer ${loginResponse.data.token}` },
          });

          localStorage.setItem("name", profileResponse.data.user.name);
          navigate("/profile");
        }
      } else {
        setError(response.data.error || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup Axios Error:", error.response ? error.response.data : error.message);
      setError(
        "Signup failed: " +
          (error.response?.data.details || "Check the console for more details.")
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <label>Full Name:</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Username:</label>
          <input
            type="text"
            placeholder="Choose a username"
            value={user_id}
            onChange={(e) => setUserId(e.target.value)}
            required
          />

          <label>Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-button">Sign Up</button>
        </form>

        <p className="auth-text">Already have an account?</p>
        <button className="auth-button secondary" onClick={() => navigate("/login")}>Login</button>
      </div>
    </div>
  );
};

export default SignUp;
