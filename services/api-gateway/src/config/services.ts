export const services = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  ticket: process.env.TICKET_SERVICE_URL || "http://localhost:4002",
};
