import express from "express";
import { protect } from "../controllers/auth.js";
import { getMe, getWeeklySpendings, sendMoney, transferMoneyToAnotherPocket, findRecipient } from "../controllers/users.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.get("/weekly-spendings", protect, getWeeklySpendings);

router.post("/send", protect, sendMoney);

router.get("/find", protect, findRecipient);
router.post("/transfer-to-pocket", protect, transferMoneyToAnotherPocket);

export default router;