import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import {
  createAuth0Middleware,
  getAllowedFrontendOrigins,
  getAuth0CallbackUrl,
  auth0Enabled,
  isAllowedFrontendOrigin,
} from "./lib/auth0";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import collegeRoutes from "./routes/colleges";
import courseRoutes from "./routes/courses";
import examRoutes from "./routes/exams";
import helpRoutes from "./routes/help";
import newsletterRoutes from "./routes/newsletter";
import savedRoutes from "./routes/saved";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedFrontendOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin ${origin}. Allowed origins: ${getAllowedFrontendOrigins().join(", ")}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const auth0Middleware = createAuth0Middleware();
if (auth0Middleware) {
  app.use(auth0Middleware);
}

app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "gradly-backend",
    routes: ["/health", "/api", "/api/colleges", "/api/auth"],
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Gradly backend API is running",
    auth0CallbackUrl: auth0Enabled() ? getAuth0CallbackUrl() : null,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/help", helpRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/saved", savedRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
