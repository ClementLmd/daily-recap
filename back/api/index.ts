import app from "./app";
import { createServer } from "http";

const port = Number(process.env.PORT) || 5000;

if (process.env.NODE_ENV === "production") {
  // Production: Listen on all interfaces
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
  });
} else {
  // Local development
  const server = createServer(app);
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
