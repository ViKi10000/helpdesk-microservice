
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addTicketComment,
  getTicketById,
  type Ticket,
} from "../../api/ticket.api.ts";

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadTicket = async () => {
      if (!id) {
        setError("Invalid ticket ID.");
        setLoading(false);
        return;
      }

      try {
        const result = await getTicketById(id);

        if (!ignore) {
          setTicket(result);
          setError("");
        }
      } catch {
        if (!ignore) {
          setError("Unable to load this ticket. Please try again.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadTicket();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleComment = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!id || !comment.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await addTicketComment(id, comment.trim());
      setComment("");

      const updatedTicket = await getTicketById(id);
      setTicket(updatedTicket);
    } catch {
      setError("Unable to add comment. Please try again.");
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Loading ticket...
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">
            !
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            Ticket unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Ticket not found."}
          </p>

          <Link
            to="/user/dashboard"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Navigation */}

        <Link
          to="/user/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <span>←</span>
          Back to Dashboard
        </Link>

        {/* Ticket information */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Support Ticket
            </p>

            <span className="text-xs text-slate-400">
              ID: {ticket._id}
            </span>
          </div>

          <h1 className="mt-4 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
            {ticket.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[ticket.status] || "bg-slate-100 text-slate-700"
              }`}
            >
              {ticket.status.replaceAll("_", " ")}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                priorityStyles[ticket.priority] || "bg-slate-100 text-slate-700"
              }`}
            >
              {ticket.priority} priority
            </span>
          </div>

          <div className="my-6 border-t border-slate-100" />

          <h2 className="text-sm font-semibold text-slate-900">
            Description
          </h2>

          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
            {ticket.description}
          </p>
        </section>

        {/* Comments */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Conversation
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {ticket.comments.length} comments
            </span>
          </div>

          {/* Comment list */}

          {ticket.comments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No comments yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Start the conversation by adding a comment below.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ticket.comments.map((item, index) => (
                <div
                  key={`${item.createdAt}-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {item.text}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add comment */}

          <form onSubmit={handleComment} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="comment"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Add a comment
              </label>

              <textarea
                id="comment"
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setError("");
                }}
                placeholder="Write your message here..."
                required
                maxLength={2000}
                rows={4}
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {comment.length}/2000
              </p>
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
              disabled={submitting || !comment.trim()}
              className="flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send comment"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default TicketDetails;
