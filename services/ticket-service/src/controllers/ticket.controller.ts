
import type { RequestHandler, Response, NextFunction } from "express";

import {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  updateTicketStatus,
  addComment,
} from "../service/ticket.service.ts";

import { getAllAdmins } from "../service/auth.service.ts";

import { createTicketSchema } from "../utils/ticket.validation.ts";
import { assignTicketSchema } from "../utils/assignment.validation.ts";
import { updateStatusSchema } from "../utils/status.validation.ts";
import { addCommentSchema } from "../utils/comment.validation.ts";
import { ticketQuerySchema } from "../utils/ticket-query.validation.ts";

const serviceErrors: Record<
  string,
  { status: number; message: string }
> = {
  INVALID_TICKET_ID: {
    status: 400,
    message: "Invalid ticket ID",
  },
  TICKET_NOT_FOUND: {
    status: 404,
    message: "Ticket not found",
  },
  TICKET_ACCESS_DENIED: {
    status: 403,
    message: "You cannot access this ticket",
  },
  USER_NOT_FOUND: {
    status: 404,
    message: "Assigned user not found",
  },
  INVALID_ASSIGNEE_ROLE: {
    status: 400,
    message: "Tickets can only be assigned to admin users",
  },
  AUTH_SERVICE_UNAVAILABLE: {
    status: 503,
    message: "Auth Service is currently unavailable",
  },
  AUTH_SERVICE_CONFIG_MISSING: {
    status: 500,
    message: "Auth Service configuration is missing",
  },
};

const handleServiceError = (
  error: unknown,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof Error) {
    const knownError = serviceErrors[error.message];

    if (knownError) {
      res.status(knownError.status).json({
        error: {
          code: error.message,
          message: knownError.message,
        },
      });
      return;
    }
  }

  next(error);
};

// Create a new ticket
export const createTicketController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const validation = createTicketSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid ticket data",
          details: validation.error.issues,
        },
      });
      return;
    }

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const ticket = await createTicket({
      input: validation.data,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// Get tickets
export const getTicketsController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const validation = ticketQuerySchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: validation.error.issues[0]?.message,
        },
      });
      return;
    }

    const result = await getTickets(user, validation.data);

    res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      data: result.tickets,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get a ticket by ID
export const getTicketByIdController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        error: {
          code: "INVALID_TICKET_ID",
          message: "Ticket ID is required",
        },
      });
      return;
    }

    const ticket = await getTicketById(id, user);

    res.status(200).json({
      success: true,
      message: "Ticket fetched successfully",
      data: ticket,
    });
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

// Assign a ticket to an admin
export const assignTicketController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        error: {
          code: "INVALID_TICKET_ID",
          message: "Invalid ticket ID",
        },
      });
      return;
    }

    const validation = assignTicketSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: validation.error.issues[0]?.message,
        },
      });
      return;
    }

    const ticket = await assignTicket({
      ticketId: id,
      userId: validation.data.userId,
    });

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
    });
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

// Update ticket status
export const updateTicketStatusController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        error: {
          code: "INVALID_TICKET_ID",
          message: "Invalid ticket ID",
        },
      });
      return;
    }

    const validation = updateStatusSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: validation.error.issues[0]?.message,
        },
      });
      return;
    }

    const ticket = await updateTicketStatus({
      ticketId: id,
      status: validation.data.status,
    });

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

// Add a comment
export const addCommentController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        error: {
          code: "INVALID_TICKET_ID",
          message: "Invalid ticket ID",
        },
      });
      return;
    }

    const validation = addCommentSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: validation.error.issues[0]?.message,
        },
      });
      return;
    }

    const ticket = await addComment({
      ticketId: id,
      user,
      text: validation.data.text,
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: ticket,
    });
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

// Get admins available for ticket assignment
export const getAssignableUsersController: RequestHandler = async (
  _req,
  res,
  next
) => {
  try {
    const admins = await getAllAdmins();

    res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      data: admins,
    });
  } catch (error) {
    handleServiceError(error, res, next);
  }
};
