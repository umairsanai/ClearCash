import express from "express";
import { login, logout, protect, signup } from "../controllers/auth.js";
import { AppError } from "../error.js";
import { getMe, sendMoney } from "../controllers/users.js";
import { createPocket, deletePocket, udpatePocket } from "../controllers/pockets.js";

const router = express.Router();

router.put("/create", protect, createPocket);
router.patch("/update", protect, udpatePocket);
router.delete("/delete/:pocket_id", protect, deletePocket);

export default router;