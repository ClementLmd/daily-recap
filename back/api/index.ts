import app from "./app";

const port =
  Number(process.env.PORT) ||
  (process.env.NODE_ENV === "production" ? 8080 : 4000);

if (process.env.NODE_ENV === "production") {
  // Production: Listen on all interfaces
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
  });
} else {
  // Local development
  const server = require("http").createServer(app);
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
