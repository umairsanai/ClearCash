import express from "express";
import { AppError, handleAsyncError } from "../error.js";
import {markAllNotificationsRead, deleteNotification, getCurrentMonthNotifications} from "../controllers/notification.js";

const router = express.Router();

router.get("/", protect, getCurrentMonthNotifications)
router.delete("/:notificationId", protect, deleteNotification);
router.post("/mark-all-read", protect, markAllNotificationsRead);


export default router;