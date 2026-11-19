
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/useAuth.ts";

import {
  getTickets,
  getAssignableUsers,
  assignTicket,
  updateTicketStatus,
  type Ticket,
  type AssignableUser,
} from "../../api/ticket.api.ts";

type TicketStatus = "open" | "in_progress" | "resolved";
type StatusFilter = "all" | TicketStatus;

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<AssignableUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const loadTickets = async () => {
    const response = await getTickets();
    setTickets(response.data);
  };

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
      } catch (err) {
        console.error("Dashboard loading failed:", err);

        if (!ignore) {
          setError("Unable to load dashboard data. Please try again.");
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

  const counts = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "open").length,
      inProgress: tickets.filter(
        (ticket) => ticket.status === "in_progress"
      ).length,
      resolved: tickets.filter(
        (ticket) => ticket.status === "resolved"
      ).length,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const handleStatusChange = async (
    ticketId: string,
    status: TicketStatus
  ) => {
    setUpdatingId(ticketId);
    setError("");

    try {
      await updateTicketStatus(ticketId, status);
      await loadTickets();
    } catch (err) {
      console.error("Status update failed:", err);
      setError("Unable to update ticket status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignTicket = async (
    ticketId: string,
    assignedTo: string
  ) => {
    setAssigningId(ticketId);
    setError("");

    try {
      await assignTicket(ticketId, assignedTo);
      await loadTickets();
    } catch (err) {
      console.error("Ticket assignment failed:", err);
      setError("Unable to assign ticket. Please try again.");
    } finally {
      setAssigningId(null);
    }
  };

  const statusStyles: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-slate-100 text-slate-700",
  };

  const priorityStyles: Record<string, string> = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-orange-100 text-orange-700",
    high: "bg-red-100 text-red-700",
  };

  const summaryCards = [
    {
      label: "Total Tickets",
      value: counts.total,
      color: "bg-blue-50 text-blue-700",
      icon: "T",
    },
    {
      label: "Open",
      value: counts.open,
      color: "bg-sky-50 text-sky-700",
      icon: "O",
    },
    {
      label: "In Progress",
      value: counts.inProgress,
      color: "bg-amber-50 text-amber-700",
      icon: "P",
    },
    {
      label: "Resolved",
      value: counts.resolved,
      color: "bg-green-50 text-green-700",
      icon: "R",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              H
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Helpdesk
              </h1>
              <p className="text-xs text-slate-500">
                Admin workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}

        <section>
          <p className="text-sm font-medium text-blue-600">
            Overview
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Admin Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Monitor, assign, and manage all support tickets.
          </p>
        </section>

        {/* Summary cards */}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>

                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${card.color}`}
                >
                  {card.icon}
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                {loading ? "—" : card.value}
              </p>
            </div>
          ))}
        </section>

        {/* Ticket management */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Tickets
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage incoming support requests.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-64"
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="all">All statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                Loading dashboard...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-14 text-center">
                <p className="font-semibold text-slate-700">
                  {tickets.length === 0
                    ? "No tickets found"
                    : "No matching tickets"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {tickets.length === 0
                    ? "Tickets created by users will appear here."
                    : "Try changing your search or status filter."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-medium text-slate-500">
                  Showing {filteredTickets.length} of {tickets.length} tickets
                </p>

                {filteredTickets.map((ticket) => {
                  const assignedAdmin = users.find(
                    (admin) => admin.id === ticket.assignedTo
                  );

                  return (
                    <article
                      key={ticket._id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 sm:p-5"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        {/* Ticket information */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words text-base font-semibold text-slate-900">
                              {ticket.title}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                statusStyles[ticket.status] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {ticket.status.replace(/_/g, " ")}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                priorityStyles[ticket.priority] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {ticket.priority} priority
                            </span>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                            {ticket.description}
                          </p>

                          <p className="mt-3 text-xs text-slate-500">
                            Assigned to:{" "}
                            <span className="font-medium text-slate-700">
                              {assignedAdmin?.name ?? "Unassigned"}
                            </span>
                          </p>
                        </div>

                        {/* Management controls */}

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[420px]">
                          <div>
                            <label
                              htmlFor={`assign-${ticket._id}`}
                              className="mb-1.5 block text-xs font-semibold text-slate-500"
                            >
                              Assign admin
                            </label>

                            <select
                              id={`assign-${ticket._id}`}
                              value={ticket.assignedTo ?? ""}
                              disabled={assigningId === ticket._id}
                              onChange={(e) =>
                                void handleAssignTicket(
                                  ticket._id,
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                            >
                              <option value="">Unassigned</option>

                              {users.map((admin) => (
                                <option key={admin.id} value={admin.id}>
                                  {admin.name}
                                </option>
                              ))}
                            </select>

                            {assigningId === ticket._id && (
                              <p className="mt-1 text-xs text-blue-600">
                                Assigning...
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor={`status-${ticket._id}`}
                              className="mb-1.5 block text-xs font-semibold text-slate-500"
                            >
                              Update status
                            </label>

                            <select
                              id={`status-${ticket._id}`}
                              value={ticket.status}
                              disabled={updatingId === ticket._id}
                              onChange={(e) =>
                                void handleStatusChange(
                                  ticket._id,
                                  e.target.value as TicketStatus
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>

                            {updatingId === ticket._id && (
                              <p className="mt-1 text-xs text-blue-600">
                                Saving...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
