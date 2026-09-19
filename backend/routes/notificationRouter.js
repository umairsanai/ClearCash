import express from "express";
import {markAllNotificationsRead, deleteNotification, getCurrentMonthNotifications} from "../controllers/notification.js";
import { protect } from "../controllers/auth.js";

const router = express.Router();

router.get("/", protect, getCurrentMonthNotifications);
router.delete("/:notificationID", protect, deleteNotification);
router.post("/mark-all-read", protect, markAllNotificationsRead);


export default router;