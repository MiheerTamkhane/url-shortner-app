import express, { Application } from "express";
import cors from "cors";
import userRouter from "./routes/user.routes";
import urlRouter from "./routes/url.routes";
import { authenticate } from "./middlewares/auth.middleware";

const app: Application = express();

/**
 * Middlewares
 */
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  })
);
app.use(express.json());
app.use(authenticate);

app.use('/user', userRouter)

app.use(urlRouter)

export default app;
