import pool from "../database.js";
import { AppError, handleAsyncError } from "../error.js";
import { isInteger } from "./helpers.js";

export const markAllNotificationsRead = handleAsyncError(async (req, res, next) => {
    const newNotifications = (await pool.query("UPDATE notifications SET is_read = 1 WHERE user_id = $1 RETURNING notification_id, message, is_read, created_at", [req.user.user_id])).rows;

    res.status(200).json({
        status: "success",
        data: newNotifications
    });
});

export const deleteNotification = handleAsyncError(async (req, res, next) => {
    const notificationID = +req.params.notificationID;
    
    if (!notificationID || !isInteger(notificationID))
        return next(new AppError("Please specify which notification to delete. No Notification ID provided.", 400));

    await pool.query("DELETE FROM notifications WHERE notification_id = $1", [notificationID]);

    const notifications = await fetchCurrentMonthNotifications(req.user.user_id);

    res.status(200).json({
        status: "success",
        data: notifications
    });
});

export const getCurrentMonthNotifications = handleAsyncError(async (req, res, next) => {
    const notifications = await fetchCurrentMonthNotifications(req.user.user_id);

    res.status(200).json({
        status: "success",
        data: notifications
    });
});

export async function fetchCurrentMonthNotifications(user_id) {
    return (await pool.query("SELECT notification_id, message, is_read, created_at FROM notifications WHERE user_id=$1 AND DATE_TRUNC('month', created_at)::DATE = DATE_TRUNC('month', CURRENT_DATE)::DATE ORDER BY created_at DESC", [user_id])).rows;
}