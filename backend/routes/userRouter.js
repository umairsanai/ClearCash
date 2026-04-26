import express from "express";
import { login, logout, protect, signup } from "../controllers/auth.js";
import { AppError } from "../error.js";
import { getMe, getCurrentMonthTransactions, getWeeklySpendings, sendMoney } from "../controllers/users.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.get("/weekly-spendings", protect, getWeeklySpendings);
router.get("/transactions", protect, getCurrentMonthTransactions);

router.post("/send", protect, sendMoney);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect, logout);

export default router;