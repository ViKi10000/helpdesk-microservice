import "dotenv/config";
import sdk from "./utils/instrumentation.ts";
import app from "./app.ts";

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

const shutdown = async () => {
  server.close(async () => {
    await sdk.shutdown();
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
