import pool from "../database.js";
import { AppError, handleAsyncError } from "../error.js";
import { isInteger } from "../helpers.js";

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

    res.status(204).json({
        status: "success"
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
    const data = (await pool.query("SELECT notification_id, message, is_read, created_at FROM notifications WHERE user_id=$1 AND DATE_TRUNC('month', created_at)::DATE = DATE_TRUNC('month', CURRENT_DATE)::DATE ORDER BY created_at DESC", [user_id])).rows;

    // Converting to GMT+5:00 from GMT+0:00
    // Note: The database is sending GMT+5:00 time, but Javascript converts it back to GMT+5:00 (potentially "pg" package). So, we're converting it back to GMT+5:00. 

    return data.map(notification => {
        notification.created_at = notification.created_at.getTime() + 5*60*60*1000;
        return notification;
    });
}