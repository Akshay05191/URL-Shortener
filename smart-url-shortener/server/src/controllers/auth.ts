import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.sign({ userId }, secret, { expiresIn: "30d" });
}

function formatUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = generateToken(user._id.toString());
    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    req.log.error({ err }, "Signup error");
    res.status(500).json({ error: "Server error" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken(user._id.toString());
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Server error" });
  }
}

export async function getMe(req: Request & { userId?: string }, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "GetMe error");
    res.status(500).json({ error: "Server error" });
  }
}
