import express, { Application } from "express";
import userRouter from "./routes/user.routes";

const app: Application = express();

/**
 * Middlewares
 */
app.use(express.json());
app.use('/user', userRouter)

export default app;
