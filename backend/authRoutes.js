import { Router } from "express";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { query } from "./db";
require("dotenv").config();

const router = Router();

// **Sign Up**
router.post("/signup", async (req, res) => {
  const { user_id, password, name } = req.body;
  const hashedPassword = await hash(password, 10);

  try {
    await query(
      "INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)",
      [user_id, hashedPassword, name]
    );
    res.json({ success: true, message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: "Error registering user" });
  }
});

// **Login**
router.post("/login", async (req, res) => {
  const { user_id, password } = req.body;

  try {
    const user = await query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);

    if (user.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await compare(password, user.rows[0].password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = sign({ user_id: user.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// **Logout (Client should delete token)**
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out" });
});

export default router;
