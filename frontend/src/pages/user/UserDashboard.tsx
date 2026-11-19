
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth.ts";
import {
  createTicket,
  getTickets,
  type Ticket,
} from "../../api/ticket.api.ts";

const UserDashboard = () => {
  const { user, logout } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadTickets = async () => {
      try {
        const response = await getTickets();

        if (!ignore) {
          setTickets(response.data);
        }
      } catch {
        if (!ignore) {
          setError("Unable to load your tickets. Please refresh the page.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadTickets();

    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateTicket = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (trimmedTitle.length < 3) {
      setError("Ticket title must contain at least 3 characters.");
      return;
    }

    if (!trimmedDescription) {
      setError("Please describe your issue.");
      return;
    }

    setSubmitting(true);

    try {
      await createTicket({
        title: trimmedTitle,
        description: trimmedDescription,
        priority,
      });

      const response = await getTickets();
      setTickets(response.data);

      setTitle("");
      setDescription("");
      setPriority("medium");
    } catch {
      setError("Unable to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openCount = tickets.filter(
    (ticket) => ticket.status.toLowerCase() === "open"
  ).length;

  const progressCount = tickets.filter(
    (ticket) =>
      ticket.status.toLowerCase() === "in_progress" ||
      ticket.status.toLowerCase() === "in progress"
  ).length;

  const resolvedCount = tickets.filter((ticket) => {
    const status = ticket.status.toLowerCase();
    return status === "resolved" || status === "closed";
  }).length;

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
      case "in progress":
        return "bg-amber-100 text-amber-700";
      case "resolved":
      case "closed":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPriorityStyle = (value: string) => {
    switch (value.toLowerCase()) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-600";
      default:
        return "text-slate-500";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              H
            </div>

            <span className="text-xl font-bold text-slate-900">
              Helpdesk
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500">User account</p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Welcome */}

        <section>
          <p className="text-sm font-medium text-blue-600">
            CUSTOMER SUPPORT
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            My Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Welcome back{user?.name ? `, ${user.name}` : ""}. Manage your support
            requests in one place.
          </p>
        </section>

        {/* Summary cards */}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total tickets
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {tickets.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Open
            </p>
            <p className="mt-3 text-3xl font-bold text-blue-600">
              {openCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              In progress
            </p>
            <p className="mt-3 text-3xl font-bold text-amber-600">
              {progressCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Resolved
            </p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {resolvedCount}
            </p>
          </div>
        </section>

        {/* Create ticket */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Create a support ticket
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tell us what you need help with.
            </p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-5">
            <div>
              <label
                htmlFor="ticket-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Ticket title
              </label>

              <input
                id="ticket-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError("");
                }}
                placeholder="Example: Unable to access my account"
                required
                minLength={3}
                maxLength={120}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="ticket-description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="ticket-description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError("");
                }}
                placeholder="Describe your issue in detail..."
                required
                maxLength={5000}
                rows={4}
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="max-w-xs">
              <label
                htmlFor="ticket-priority"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Priority
              </label>

              <select
                id="ticket-priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating ticket..." : "Create ticket"}
            </button>
          </form>
        </section>

        {/* Ticket list */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                My Tickets
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and track your support requests.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {tickets.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
              Loading your tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                <span aria-hidden="true">+</span>
              </div>

              <h3 className="font-semibold text-slate-800">
                No tickets yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first support ticket using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/user/tickets/${ticket._id}`}
                        className="font-semibold text-slate-900 transition hover:text-blue-600"
                      >
                        {ticket.title}
                      </Link>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {ticket.description}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(ticket.status)}`}
                    >
                      {ticket.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-500">
                      Priority:{" "}
                      <span
                        className={`font-semibold capitalize ${getPriorityStyle(ticket.priority)}`}
                      >
                        {ticket.priority}
                      </span>
                    </p>

                    <Link
                      to={`/user/tickets/${ticket._id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View details →
                    </Link>
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

export default UserDashboard;
