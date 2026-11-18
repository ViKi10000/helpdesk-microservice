
import { Router } from "express";

import {
  getInternalUser,
  getInternalUsers,
  getInternalAdmins,
} from "../controllers/auth.controller.ts";

import { authenticateInternalService } from "../middleware/internal.middleware.ts";

const router = Router();

// Get all regular users
router.get(
  "/users",
  authenticateInternalService,
  getInternalUsers
);

// Get a user by ID
router.get(
  "/users/:id",
  authenticateInternalService,
  getInternalUser
);

// Get all admin users for ticket assignment
router.get(
  "/admins",
  authenticateInternalService,
  getInternalAdmins
);

export default router;
