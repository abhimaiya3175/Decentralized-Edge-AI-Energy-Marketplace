const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, WalletBinding } = require("../models");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Server-side password policy: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=]).{8,}$/;

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
    if (!password || typeof password !== "string" || !PASSWORD_POLICY_REGEX.test(password)) {
      return res.status(400).json({ 
        msg: "Password must be at least 8 characters and include uppercase, lowercase, a digit, and a special character",
        code: "PASSWORD_POLICY_VIOLATION"
      });
    }

    // Check if user already exists (case-insensitive normalized)
    // Note: User enumeration on signup is mitigated, not eliminated. The ACCOUNT_EXISTS
    // code and 400 response status still distinguish existing emails from other errors,
    // and DB lookup timing differences remain before password hashing.
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        msg: "Registration failed. An account with this email cannot be created.",
        code: "ACCOUNT_EXISTS"
      });
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

    // Constant-time hash comparison to mitigate user enumeration on login
    const dummyHash = "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345";
    const hashToCompare = user ? user.password : dummyHash;
    const match = await bcrypt.compare(password, hashToCompare);

    if (!user || !match) {
      // Unified generic error for bad email or bad password (mitigates user enumeration)
      return res.status(401).json({ 
        msg: "Invalid email or password",
        code: "INVALID_CREDENTIALS" 
      });
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
