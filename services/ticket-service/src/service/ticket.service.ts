
import mongoose from "mongoose";

import TicketModel from "../models/ticket.model.ts";
import type { CreateTicketInput } from "../utils/ticket.validation.ts";
import type { TicketQuery } from "../utils/ticket-query.validation.ts";
import { getUserById } from "./auth.service.ts";

// ---------------------------------------------
// Types
// ---------------------------------------------

interface CreateTicketParams {
  input: CreateTicketInput;
  userId: string;
}

interface AssignTicketParams {
  ticketId: string;
  userId: string;
}

interface UpdateTicketStatusParams {
  ticketId: string;
  status: "open" | "in_progress" | "resolved";
}

interface AddCommentParams {
  ticketId: string;
  user: {
    id: string;
    role: "user" | "admin";
  };
  text: string;
}

interface TicketFilter {
  createdBy?: string;
  status?: "open" | "in_progress" | "resolved";
  priority?: "low" | "medium" | "high";
}

// ---------------------------------------------
// Shared validation
// ---------------------------------------------

const validateTicketId = (ticketId: string): void => {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw new Error("INVALID_TICKET_ID");
  }
};

const findTicketOrThrow = async (ticketId: string) => {
  const ticket = await TicketModel.findById(ticketId);

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  return ticket;
};

const checkTicketAccess = (
  ticket: { createdBy: unknown },
  user: { id: string; role: "user" | "admin" }
): void => {
  const isAdmin = user.role === "admin";
  const isOwner = String(ticket.createdBy) === user.id;

  if (!isAdmin && !isOwner) {
    throw new Error("TICKET_ACCESS_DENIED");
  }
};

// ---------------------------------------------
// Create a new ticket
// ---------------------------------------------

export const createTicket = async ({
  input,
  userId,
}: CreateTicketParams) => {
  const ticket = await TicketModel.create({
    title: input.title,
    description: input.description,
    priority: input.priority,
    createdBy: userId,
  });

  return ticket;
};

// ---------------------------------------------
// Get tickets
// ---------------------------------------------

export const getTickets = async (
  user: { id: string; role: "user" | "admin" },
  query: TicketQuery
) => {
  const { page, limit, status, priority } = query;

  const filter: TicketFilter = {};

  // Regular users can only see their own tickets.
  // Admins can see all tickets.
  if (user.role !== "admin") {
    filter.createdBy = user.id;
  }

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    TicketModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    TicketModel.countDocuments(filter),
  ]);

  return {
    tickets,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

// ---------------------------------------------
// Get a ticket by ID
// ---------------------------------------------

export const getTicketById = async (
  ticketId: string,
  user: { id: string; role: "user" | "admin" }
) => {
  validateTicketId(ticketId);

  const ticket = await findTicketOrThrow(ticketId);

  checkTicketAccess(ticket, user);

  return ticket;
};

// ---------------------------------------------
// Assign a ticket to an admin
// ---------------------------------------------

export const assignTicket = async ({
  ticketId,
  userId,
}: AssignTicketParams) => {
  validateTicketId(ticketId);

  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("USER_NOT_FOUND");
  }

  const ticket = await findTicketOrThrow(ticketId);

  const assignedUser = await getUserById(userId);

  if (assignedUser.role !== "admin") {
    throw new Error("INVALID_ASSIGNEE_ROLE");
  }

  ticket.assignedTo = assignedUser.id;

  await ticket.save();

  return ticket;
};

// ---------------------------------------------
// Update ticket status
// ---------------------------------------------

export const updateTicketStatus = async ({
  ticketId,
  status,
}: UpdateTicketStatusParams) => {
  validateTicketId(ticketId);

  const ticket = await findTicketOrThrow(ticketId);

  ticket.status = status;

  await ticket.save();

  return ticket;
};

// ---------------------------------------------
// Add a comment
// ---------------------------------------------

export const addComment = async ({
  ticketId,
  user,
  text,
}: AddCommentParams) => {
  validateTicketId(ticketId);

  const ticket = await findTicketOrThrow(ticketId);

  checkTicketAccess(ticket, user);

  ticket.comments.push({
    authorId: user.id,
    text: text.trim(),
    createdAt: new Date(),
  });

  await ticket.save();

  return ticket;
};
