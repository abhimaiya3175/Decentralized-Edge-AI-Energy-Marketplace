const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, WalletBinding } = require("../models");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createToken = (user) => jwt.sign(
  { id: user.id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || "24h" }
);

exports.signup = async (req, res) => {
  try {
    const rawName = req.body?.name;
    const rawEmail = req.body?.email;
    const password = req.body?.password;

    const name = typeof rawName === "string" ? rawName.trim() : "";
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    // Validate input BEFORE hashing
    if (!name) {
      return res.status(400).json({ msg: "Name is required" });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ msg: "A valid email address is required" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    // Check if user already exists (case-insensitive normalized)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    const token = createToken(user);

    res.status(201).json({ 
      msg: "User created successfully", 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ msg: "Server error during signup" });
  }
};

exports.login = async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    const password = req.body?.password;

    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    // Find user (case-insensitive normalized)
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    // Generate token
    const token = createToken(user);

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error during login" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email"],
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const binding = await WalletBinding.findOne({ where: { userId: req.user.id } });

    return res.json({
      user,
      walletAddress: binding?.walletAddress || null,
    });
  } catch (error) {
    console.error("Session lookup error:", error);
    return res.status(500).json({ msg: "Could not validate session" });
  }
};
