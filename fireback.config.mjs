export default {
  // Dynamically choose database based on environment
  database:
    process.env.NODE_ENV === "production"
      ? {
          dialect: "postgres",
          host: process.env.DB_HOST || "localhost",
          port: process.env.DB_PORT || 5432,
          username: process.env.DB_USER || "postgres",
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME || "fireback_prod",
        }
      : {
          dialect: "sqlite",
          storage: "./fireback.sqlite",
        },
  // Register custom modules (where your schemas and data models live)
  modules: [
    "./modules/basic"
  ],
  // Configure CORS to allow your Vite frontend to communicate with this backend
  cors: {
    origin: [
      "https://localhost:5173",
      "http://localhost:5173",
      "https://127.0.0.1:5173",
    ],
  },
  // Directory to serve static files from
  // publicDir: "./public"
};
