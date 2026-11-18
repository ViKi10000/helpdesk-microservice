
import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.ts";
import {
  createTicket,
  getTickets,
  type Ticket,
} from "../../api/ticket.api.ts";
import { Link } from "react-router-dom";

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
          setError("Unable to load tickets.");
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
    setSubmitting(true);

    try {
      await createTicket({ title, description, priority });

      setTitle("");
      setDescription("");
      setPriority("medium");

      const response = await getTickets();
      setTickets(response.data);
    } catch {
      setError("Unable to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between bg-white px-8 py-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Helpdesk</h1>

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

      <main className="mx-auto max-w-5xl space-y-8 p-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-900">
            My Dashboard
          </h2>
          <p className="mt-1 text-slate-500">
            Create and manage your support tickets.
          </p>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">Create a ticket</h2>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ticket title"
              required
              minLength={3}
              maxLength={120}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue..."
              required
              maxLength={5000}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "low" | "medium" | "high")
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create ticket"}
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">
            My Tickets ({tickets.length})
          </h2>

          {loading ? (
            <p className="text-slate-500">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-slate-500">
              You haven't created any tickets yet.
            </p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to={`/user/tickets/${ticket._id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {ticket.title}
                    </Link>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    {ticket.description}
                  </p>

                  <p className="mt-3 text-xs text-slate-500">
                    Priority: {ticket.priority}
                  </p>
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
