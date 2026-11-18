
import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.ts";
import requireAdmin from "../middleware/role.middleware.ts";

import {
  createTicketController,
  getTicketsController,
  getTicketByIdController,
  assignTicketController,
  updateTicketStatusController,
  addCommentController,
  getAssignableUsersController,
} from "../controllers/ticket.controller.ts";

const router = Router();

// User: Create a ticket
router.post("/", authMiddleware, createTicketController);

// User/Admin: Get tickets
router.get("/", authMiddleware, getTicketsController);

// Admin: Get users available for assignment
router.get(
  "/assignable-users",
  authMiddleware,
  requireAdmin,
  getAssignableUsersController
);

// User/Admin: Get a ticket by ID
router.get("/:id", authMiddleware, getTicketByIdController);

// Admin: Assign a ticket
router.patch(
  "/:id/assign",
  authMiddleware,
  requireAdmin,
  assignTicketController
);

// Admin: Update ticket status
router.patch(
  "/:id/status",
  authMiddleware,
  requireAdmin,
  updateTicketStatusController
);

// User/Admin: Add a comment
router.post("/:id/comments", authMiddleware, addCommentController);

export default router;
