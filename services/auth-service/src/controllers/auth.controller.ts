
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

// ---------------------------------------------
// Validation schemas
// ---------------------------------------------

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters.")
      .max(50, "Name cannot exceed 50 characters."),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address.")
      .max(254, "Email address is too long."),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(72, "Password cannot exceed 72 characters."),
  })
  .strict();

const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address."),

    password: z
      .string()
      .min(1, "Please enter your password.")
      .max(72, "Invalid email or password."),
  })
  .strict();

// ---------------------------------------------
// Shared response helpers
// ---------------------------------------------

const sendValidationError = (
  res: Response,
  error: z.ZodError
) => {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".") || "general";

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return res.status(400).json({
    success: false,
    message: "Please check the information you entered.",
    errors,
  });
};

const sendControllerError = (
  res: Response,
  error: unknown,
  context: string
) => {
  console.error(`${context}:`, error);

  if (error instanceof AuthServiceError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
};

// ---------------------------------------------
// Register
// ---------------------------------------------

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const { name, email, password } = validation.data;

    const user = await registerUser(name, email, password);

    return res.status(201).json({
      success: true,
      message: "Your account has been created successfully.",
      user,
    });
  } catch (error) {
    return sendControllerError(
      res,
      error,
      "Registration error"
    );
  }
};

// ---------------------------------------------
// Login
// ---------------------------------------------

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const { email, password } = validation.data;

    const result = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Welcome back! You have logged in successfully.",
      ...result,
    });
  } catch (error) {
    return sendControllerError(
      res,
      error,
      "Login error"
    );
  }
};

// ---------------------------------------------
// Get authenticated user
// ---------------------------------------------

export const getMe = (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Your session is invalid. Please log in again.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "User details retrieved successfully.",
    user: req.user,
  });
};

// ---------------------------------------------
// Get one user by ID (internal)
// ---------------------------------------------

export const getInternalUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid user ID.",
      });
    }

    const user = await getUserById(id);

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      user,
    });
  } catch (error) {
    return sendControllerError(
      res,
      error,
      "Internal user lookup error"
    );
  }
};

// ---------------------------------------------
// Get regular users (internal)
// ---------------------------------------------

export const getInternalUsers = async (
  _req: Request,
  res: Response
) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      })),
    });
  } catch (error) {
    return sendControllerError(
      res,
      error,
      "Failed to fetch internal users"
    );
  }
};

// ---------------------------------------------
// Get admin users (internal)
// ---------------------------------------------

export const getInternalAdmins = async (
  _req: Request,
  res: Response
) => {
  try {
    const admins = await getAllAdmins();

    return res.status(200).json({
      success: true,
      message: "Admins retrieved successfully.",
      users: admins.map((admin) => ({
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      })),
    });
  } catch (error) {
    return sendControllerError(
      res,
      error,
      "Failed to fetch internal admins"
    );
  }
};
