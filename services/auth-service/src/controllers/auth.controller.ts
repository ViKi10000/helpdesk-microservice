
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import {
  registerUser,
  loginUser,
  getUserById,
  AuthServiceError,
  getAllUsers,
  getAllAdmins,
} from "../service/auth.service.ts";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.ts";

// Validation schemas
const registerSchema = z
  .object({
    name: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8),
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8),
  })
  .strict();

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: validation.error.flatten(),
      });
    }

    const { name, email, password } = validation.data;
    const user = await registerUser(name, email, password);

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof AuthServiceError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: validation.error.flatten(),
      });
    }

    const { email, password } = validation.data;
    const result = await loginUser(email, password);

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof AuthServiceError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get authenticated user
export const getMe = (
  req: AuthenticatedRequest,
  res: Response
) => {
  return res.status(200).json({
    message: "User authenticated successfully",
    user: req.user,
  });
};

// Get one user by ID (internal)
export const getInternalUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await getUserById(id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Internal user lookup error:", error);

    if (error instanceof AuthServiceError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get regular users (internal)
export const getInternalUsers = async (
  _req: Request,
  res: Response
) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch internal users:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get admin users (internal)
export const getInternalAdmins = async (
  _req: Request,
  res: Response
) => {
  try {
    const admins = await getAllAdmins();

    return res.status(200).json({
      success: true,
      users: admins.map((admin) => ({
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch internal admins:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
