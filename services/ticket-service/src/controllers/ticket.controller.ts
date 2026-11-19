
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

// ---------------------------------------------
// Service error messages
// ---------------------------------------------

const serviceErrors: Record<
  string,
  { status: number; message: string }
> = {
  INVALID_TICKET_ID: {
    status: 400,
    message: "The ticket ID is invalid.",
  },
  TICKET_NOT_FOUND: {
    status: 404,
    message: "Ticket not found. It may have been deleted.",
  },
  TICKET_ACCESS_DENIED: {
    status: 403,
    message: "You don't have permission to access this ticket.",
  },
  USER_NOT_FOUND: {
    status: 404,
    message: "The selected user could not be found.",
  },
  INVALID_ASSIGNEE_ROLE: {
    status: 400,
    message: "Tickets can only be assigned to admin users.",
  },
  AUTH_SERVICE_UNAVAILABLE: {
    status: 503,
    message: "Authentication service is temporarily unavailable. Please try again later.",
  },
  AUTH_SERVICE_CONFIG_MISSING: {
    status: 500,
    message: "Authentication service configuration is missing.",
  },
};

// ---------------------------------------------
// Shared response helpers
// ---------------------------------------------

const sendValidationError = (
  res: Response,
  issues: {
    path: PropertyKey[];
    message: string;
  }[]
) => {
  return res.status(400).json({
    error: {
      code: "VALIDATION_ERROR",
      message:
        issues[0]?.message ??
        "Please check the information you entered.",
      details: issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    },
  });
};

const sendUnauthorizedError = (res: Response) => {
  return res.status(401).json({
    error: {
      code: "UNAUTHORIZED",
      message: "Please log in to continue.",
    },
  });
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

// ---------------------------------------------
// Create a new ticket
// ---------------------------------------------

export const createTicketController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const validation = createTicketSchema.safeParse(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.error.issues);
      return;
    }

    const userId = req.user?.id;

    if (!userId) {
      sendUnauthorizedError(res);
      return;
    }

    const ticket = await createTicket({
      input: validation.data,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Your ticket has been created successfully.",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------
// Get tickets
// ---------------------------------------------

export const getTicketsController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = req.user;

    if (!user) {
      sendUnauthorizedError(res);
      return;
    }

    const validation = ticketQuerySchema.safeParse(req.query);

    if (!validation.success) {
      sendValidationError(res, validation.error.issues);
      return;
    }

    const result = await getTickets(user, validation.data);

    res.status(200).json({
      success: true,
      message: result.tickets.length
        ? "Tickets retrieved successfully."
        : "No tickets found.",
      data: result.tickets,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------
// Get a ticket by ID
// ---------------------------------------------

export const getTicketByIdController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = req.user;

    if (!user) {
      sendUnauthorizedError(res);
      return;
    }

    const id = req.params.id;

    if (typeof id !== "string" || !id.trim()) {
      res.status(400).json({
        error: {
          code: "INVALID_TICKET_ID",
          message: "Please provide a valid ticket ID.",
        },
      });
      return;
    }

    const ticket = await getTicketById(id, user);

    res.status(200).json({
      success: true,
      message: "Ticket retrieved successfully.",
      data: ticket,
    });
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

// ---------------------------------------------
// Assign a ticket to an admin
// ---------------------------------------------

export const assignTicketController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !id.trim()) {
      res.status(400).json({
        error: {
          code: "INVALID_TICKET_ID",
          message: "Please provide a valid ticket ID.",
        },
      });
      return;
    }

    const validation = assignTicketSchema.safeParse(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.error.issues);
      return;
    }

    const ticket = await assignTicket({
      ticketId: id,
      userId: validation.data.userId,
    });

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully.",
      data: ticket,
    });
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

// ---------------------------------------------
// Update ticket status
// ---------------------------------------------

export const updateTicketStatusController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !id.trim()) {
      res.status(400).json({
        error: {
          code: "INVALID_TICKET_ID",
          message: "Please provide a valid ticket ID.",
        },
      });
      return;
    }

    const validation = updateStatusSchema.safeParse(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.error.issues);
      return;
    }

    const ticket = await updateTicketStatus({
      ticketId: id,
      status: validation.data.status,
    });

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully.",
      data: ticket,
    });
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

// ---------------------------------------------
// Add a comment
// ---------------------------------------------

export const addCommentController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const user = req.user;

    if (!user) {
      sendUnauthorizedError(res);
      return;
    }

    const id = req.params.id;

    if (typeof id !== "string" || !id.trim()) {
      res.status(400).json({
        error: {
          code: "INVALID_TICKET_ID",
          message: "Please provide a valid ticket ID.",
        },
      });
      return;
    }

    const validation = addCommentSchema.safeParse(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.error.issues);
      return;
    }

    const ticket = await addComment({
      ticketId: id,
      user,
      text: validation.data.text,
    });

    res.status(201).json({
      success: true,
      message: "Your comment has been added successfully.",
      data: ticket,
    });
  } catch (error) {
    handleServiceError(error, res, next);
  }
};

// ---------------------------------------------
// Get admins available for ticket assignment
// ---------------------------------------------

export const getAssignableUsersController: RequestHandler = async (
  _req,
  res,
  next
) => {
  try {
    const admins = await getAllAdmins();

    res.status(200).json({
      success: true,
      message: admins.length
        ? "Available admins retrieved successfully."
        : "No admins are currently available.",
      data: admins,
    });
  } catch (error) {
    handleServiceError(error, res, next);
  }
};
