import express from "express";
import morgan from "morgan";
import cors from "cors";
import { xss } from "express-xss-sanitizer";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import hpp from "hpp-clean";
import helmet from "helmet";
import userRouter from "./routes/userRouter.js";
import pocketRouter from "./routes/pocketRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import authRouter from "./routes/authRouter.js"
import { errorMiddleware } from "./error.js";
import pool from "./database.js";
import { logIP } from "./controllers/helpers.js";

const app = express();

// Trust the first proxy (Render's load balancer)
app.set('trust proxy', 1);

// LOGGING
app.use(logIP);
app.use(morgan("tiny"));

// RATE LIMITING
app.use(rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	limit: 60,
    message: {
        status: "fail",
        statusCode: 429,
        message: "Too many requests, please try again later."
    }
}));

// CORS
app.use(cors({origin: ['https://clearcash-orpin.vercel.app', 'https://www.clearcash-orpin.vercel.app', "http://127.0.0.1:4173", "http://localhost:4173"], credentials: true}));

// BODY PARSING
app.set('query parser', 'extended');    
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());
app.use(express.urlencoded({extended: true, limit:'10kb'}));

// SECURITY
app.use([xss(), helmet(), hpp({ whitelist: [] })]);

// ROUTERS
app.use("/api/v1/users", userRouter);
app.use("/api/v1/pockets", pocketRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/auth", authRouter);
app.use(errorMiddleware);

export default app;