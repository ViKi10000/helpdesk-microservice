
import "dotenv/config";
import "./utils/instrumentation.ts";
import app from "./app.ts";
import connectDB from "./config/database.ts";

const PORT = process.env.PORT || 4002;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Ticket Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Ticket Service:", error);
    process.exit(1);
  }
};

void startServer();
