import express, { Application } from "express";
import userRouter from "./routes/user.routes";
import { authenticate } from "./middlewares/auth.middleware";

const app: Application = express();

/**
 * Middlewares
 */
app.use(express.json());
app.use(authenticate);
app.use('/user', userRouter)

export default app;
