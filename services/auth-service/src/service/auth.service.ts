
import bcrypt from "bcrypt";

import User from "../models/user.model.ts";
import { generateAccessToken } from "../utils/jwt.ts";

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

// Register a new user
export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AuthServiceError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    // Handle duplicate email in case two registrations happen together
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new AuthServiceError("Email already registered", 409);
    }

    throw error;
  }
};

// Login an existing user
export const loginUser = async (
  email: string,
  password: string
) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const accessToken = generateAccessToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
  };
};

// Get one user by ID (internal)
export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select("name email role");

  if (!user) {
    throw new AuthServiceError("User not found", 404);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

// Get all regular users (internal)
export const getAllUsers = async () => {
  return User.find({ role: "user" })
    .select("_id name email role")
    .lean();
};

// Get all admins (internal)
export const getAllAdmins = async () => {
  return User.find({ role: "admin" })
    .select("_id name email role")
    .lean();
};
