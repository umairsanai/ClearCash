import express from "express";
import { protect } from "../controllers/auth.js";
import { createPocket, deletePocket, getAllUserPockets, udpatePocket } from "../controllers/pockets.js";

const router = express.Router();

router.get("/", protect, getAllUserPockets);
router.put("/create", protect, createPocket);
router.patch("/update", protect, udpatePocket);
router.delete("/delete/:pocket_id", protect, deletePocket);

export default router;