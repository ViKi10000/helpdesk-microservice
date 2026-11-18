
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
        }
      } catch {
        if (!ignore) {
          setError("Unable to load this ticket.");
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
      setError("Unable to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="p-8">Loading ticket...</p>;
  }

  if (!ticket) {
    return (
      <div className="p-8">
        <p className="text-red-600">
          {error || "Ticket not found."}
        </p>
        <Link to="/user/dashboard" className="mt-4 inline-block text-blue-600">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/user/dashboard" className="text-blue-600">
          ← Back to Dashboard
        </Link>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">{ticket.title}</h1>

          <p className="mt-4 text-slate-600">
            {ticket.description}
          </p>

          <div className="mt-5 flex gap-3 text-sm">
            <span>
              Status: {ticket.status.replace("_", " ")}
            </span>
            <span>Priority: {ticket.priority}</span>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Comments</h2>

          <div className="space-y-4">
            {ticket.comments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No comments yet.
              </p>
            ) : (
              ticket.comments.map((item, index) => (
                <div
                  key={`${item.createdAt}-${index}`}
                  className="rounded-lg bg-slate-50 p-4"
                >
                  <p>{item.text}</p>

                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleComment} className="mt-6 space-y-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              required
              maxLength={2000}
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-3"
            />

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Add comment"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default TicketDetails;
