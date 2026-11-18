
import { Router } from "express";

import {
  register,
  login,
  getMe,
} from "../controllers/auth.controller.ts";

import { authenticateToken } from "../middleware/auth.middleware.ts";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Authenticated route
router.get("/me", authenticateToken, getMe);

export default router;
