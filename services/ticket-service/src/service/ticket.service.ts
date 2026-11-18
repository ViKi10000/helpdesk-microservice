
import mongoose from "mongoose";

import TicketModel from "../models/ticket.model.ts";
import type { CreateTicketInput } from "../utils/ticket.validation.ts";
import type { TicketQuery } from "../utils/ticket-query.validation.ts";
import { getUserById } from "./auth.service.ts";

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

export const getTickets = async (
  user: { id: string; role: "user" | "admin" },
  query: TicketQuery
) => {
  const { page, limit, status, priority } = query;

  const filter: TicketFilter = {};

  // Users see only their own tickets. Admins see all tickets.
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

export const getTicketById = async (
  ticketId: string,
  user: { id: string; role: "user" | "admin" }
) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new Error("INVALID_TICKET_ID");
  }

  const ticket = await TicketModel.findById(ticketId);

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  const hasAccess =
    user.role === "admin" || ticket.createdBy === user.id;

  if (!hasAccess) {
    throw new Error("TICKET_ACCESS_DENIED");
  }

  return ticket;
};

export const assignTicket = async ({
  ticketId,
  userId,
}: AssignTicketParams) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new Error("INVALID_TICKET_ID");
  }

  const ticket = await TicketModel.findById(ticketId);

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  const assignedUser = await getUserById(userId);

  if (assignedUser.role !== "admin") {
    throw new Error("INVALID_ASSIGNEE_ROLE");
  }

  ticket.assignedTo = assignedUser.id;

  await ticket.save();

  return ticket;
};

export const updateTicketStatus = async ({
  ticketId,
  status,
}: UpdateTicketStatusParams) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new Error("INVALID_TICKET_ID");
  }

  const ticket = await TicketModel.findById(ticketId);

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  ticket.status = status;

  await ticket.save();

  return ticket;
};

export const addComment = async ({
  ticketId,
  user,
  text,
}: AddCommentParams) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new Error("INVALID_TICKET_ID");
  }

  const ticket = await TicketModel.findById(ticketId);

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  const hasAccess =
    user.role === "admin" || ticket.createdBy === user.id;

  if (!hasAccess) {
    throw new Error("TICKET_ACCESS_DENIED");
  }

  ticket.comments.push({
    authorId: user.id,
    text,
    createdAt: new Date(),
  });

  await ticket.save();

  return ticket;
};
