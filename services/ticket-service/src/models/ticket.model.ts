
import mongoose, {
  Schema,
  type HydratedDocument,
} from "mongoose";

// Comment interface
export interface TicketComment {
  authorId: string;
  text: string;
  createdAt: Date;
}

// Ticket interface
export interface Ticket {
  title: string;
  description: string;

  status: "open" | "in_progress" | "resolved";

  priority: "low" | "medium" | "high";

  createdBy: string;
  assignedTo: string | null;

  comments: TicketComment[];

  createdAt: Date;
  updatedAt: Date;
}

// Embedded Comment Schema
const commentSchema = new Schema<TicketComment>(
  {
    authorId: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

// Ticket Schema
const ticketSchema = new Schema<Ticket>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength:1,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    createdBy: {
      type: String,
      required: true,
    },

    assignedTo: {
      type: String,
      default: null,
    },

    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB Indexes

// User ticket listing
ticketSchema.index({
  createdBy: 1,
  createdAt: -1,
});

// Admin ticket filtering
ticketSchema.index({
  status: 1,
  priority: 1,
});

// Ticket Model
export type TicketDocument = HydratedDocument<Ticket>;

const TicketModel = mongoose.model<Ticket>(
  "Ticket",
  ticketSchema
);

export default TicketModel;
