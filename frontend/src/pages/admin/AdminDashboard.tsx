
import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.ts";

import {
  getTickets,
  getAssignableUsers,
  assignTicket,
  updateTicketStatus,
  type Ticket,
  type AssignableUser,
} from "../../api/ticket.api.ts";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<AssignableUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Load tickets and assignable admins
  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const [ticketResponse, usersResponse] = await Promise.all([
          getTickets(),
          getAssignableUsers(),
        ]);

        if (!ignore) {
          setTickets(ticketResponse.data);
          setUsers(usersResponse);
        }
      } catch (error) {
        console.error("Dashboard loading failed:", error);

        if (!ignore) {
          setError("Unable to load dashboard data.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  // Update ticket status
  const handleStatusChange = async (
    ticketId: string,
    status: "open" | "in_progress" | "resolved"
  ) => {
    setUpdatingId(ticketId);
    setError("");

    try {
      await updateTicketStatus(ticketId, status);

      setTickets((current) =>
        current.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, status } : ticket
        )
      );
    } catch {
      setError("Unable to update ticket status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Assign ticket to an admin
  const handleAssignTicket = async (
    ticketId: string,
    assignedTo: string
  ) => {
    setAssigningId(ticketId);
    setError("");

    try {
      await assignTicket(ticketId, assignedTo);

      setTickets((current) =>
        current.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, assignedTo } : ticket
        )
      );
    } catch {
      setError("Unable to assign ticket.");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between bg-white px-8 py-5 shadow-sm">
        <h1 className="text-xl font-bold">Helpdesk Admin</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.name}</span>

          <button
            onClick={logout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <section>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="mt-1 text-slate-500">
            Manage all support tickets.
          </p>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">All Tickets</h2>

          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}

          {loading ? (
            <p className="text-slate-500">Loading dashboard...</p>
          ) : tickets.length === 0 ? (
            <p className="text-slate-500">No tickets found.</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center"
                >
                  <div>
                    <h3 className="font-semibold">{ticket.title}</h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {ticket.description}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Priority: {ticket.priority}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Assigned to:{" "}
                      {users.find((u) => u.id === ticket.assignedTo)?.name ??
                        "Unassigned"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {/* Assign admin */}
                    <select
                      value={ticket.assignedTo ?? ""}
                      disabled={assigningId === ticket._id}
                      onChange={(e) =>
                        void handleAssignTicket(ticket._id, e.target.value)
                      }
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">Unassigned</option>

                      {users.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} ({admin.email})
                        </option>
                      ))}
                    </select>

                    {/* Update status */}
                    <select
                      value={ticket.status}
                      disabled={updatingId === ticket._id}
                      onChange={(e) =>
                        void handleStatusChange(
                          ticket._id,
                          e.target.value as
                            | "open"
                            | "in_progress"
                            | "resolved"
                        )
                      }
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    {assigningId === ticket._id && (
                      <span className="text-xs text-slate-500">
                        Assigning...
                      </span>
                    )}

                    {updatingId === ticket._id && (
                      <span className="text-xs text-slate-500">
                        Saving...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
