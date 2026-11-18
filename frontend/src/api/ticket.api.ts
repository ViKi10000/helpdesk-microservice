
import api from "./axios.ts";

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdBy: string;
  assignedTo: string | null;
  comments: {
    authorId: string;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

export interface TicketListResponse {
  success: boolean;
  message: string;
  data: Ticket[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AssignableUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export const createTicket = async (data: CreateTicketInput) => {
  const response = await api.post("/tickets", data);
  return response.data;
};

export const getTickets = async (): Promise<TicketListResponse> => {
  const response = await api.get<TicketListResponse>("/tickets");
  return response.data;
};

export const getTicketById = async (id: string): Promise<Ticket> => {
  const response = await api.get(`/tickets/${id}`);
  return response.data.data;
};

export const addTicketComment = async (
  id: string,
  text: string
) => {
  const response = await api.post(`/tickets/${id}/comments`, { text });
  return response.data;
};



export const updateTicketStatus = async (
  id: string,
  status: "open" | "in_progress" | "resolved"
) => {
  const response = await api.patch(`/tickets/${id}/status`, { status });
  return response.data;
};

export const assignTicket = async (
  id: string,
  userId: string
) => {
  const response = await api.patch(`/tickets/${id}/assign`, {
    userId,
  });
  return response.data;
};


export const getAssignableUsers = async (): Promise<AssignableUser[]> => {
  const response = await api.get("/tickets/assignable-users");
  return response.data.data;
};
