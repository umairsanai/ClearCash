import { hideCalculator } from "./calculator.js";
import { escapeHtml, request } from "./helpers.js";

const notificationsContainer = document.getElementById("notifications-panel");
const notificationsIcon = document.getElementById("notifications-btn");
const notificationsBadge = document.getElementById("notifications-badge");
const notificationsCloseButton = document.getElementById("close-notifications-btn");
const notificationsList = document.getElementById("notifications-list-container");
const notificationsSummary = document.getElementById("notifications-summary");
const notificationsCountLabel = document.getElementById("notifications-count-label");
const notificationsUnreadLabel = document.getElementById("notifications-unread-label");
const notificationsEmptyState = document.getElementById("notifications-empty-state");
const markAllReadButton = document.getElementById("mark-all-notifications-read-btn");

let initialized = false;




/* ===============    Functions    =============== */





const notificationTypes = [
    { keyword: "created", label: "Pocket created", icon: "fa-folder-plus", tone: "created" },
    { keyword: "updated", label: "Pocket updated", icon: "fa-pen-to-square", tone: "updated" },
    { keyword: "deleted", label: "Pocket deleted", icon: "fa-trash-can", tone: "deleted" },
    { keyword: "transferred", label: "Pocket transfer", icon: "fa-right-left", tone: "transferred" },
    { keyword: "sent", label: "Money sent", icon: "fa-paper-plane", tone: "sent" },
    { keyword: "received", label: "Money received", icon: "fa-circle-down", tone: "received" },
    { keyword: "activity", label: "Activity update", icon: "fa-bell", tone: "updated" }
]

function formatNotificationTime(createdAt) {
    const timezoneOffsetMilliseconds = new Date(createdAt).getTimezoneOffset() * 60 * 1000;
    const secondsAgo = Math.floor((Date.now() - (new Date(createdAt).getTime() + timezoneOffsetMilliseconds)) / 1000);    
    const minutesAgo = Math.floor(secondsAgo / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);
    const daysAgo = Math.floor(hoursAgo / 24);

    if (secondsAgo < 60) return "Just now";
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    if (daysAgo < 7) return `${daysAgo}d ago`;

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    }).format(new Date(createdAt));
}

function getNotificationMeta(message) {
    return notificationTypes.find(({ keyword }) => message.toLowerCase().includes(keyword)) ?? notificationTypes.at(-1);
}

function updateHeaderState(notifications) {
    const unreadCount = notifications.filter(notification => !notification.is_read).length;
    
    if (notificationsCountLabel)
        notificationsCountLabel.textContent = `${notifications.length} notification${notifications.length === 1 ? "" : "s"}`;

    if (notificationsUnreadLabel) 
        notificationsUnreadLabel.textContent = `${unreadCount} unread`;

    if (!notifications.length) 
        notificationsSummary.textContent = "Your latest activity will appear here.";
    else if (!unreadCount) 
        notificationsSummary.textContent = "Everything is read and organized for later review.";
    else 
        notificationsSummary.textContent = `${unreadCount} unread notification${unreadCount === 1 ? " needs" : "s need"} your attention.`;

    if (notificationsBadge)
        notificationsBadge.classList.toggle("hidden", unreadCount === 0);
    if (markAllReadButton)
        markAllReadButton.disabled = unreadCount === 0;
}

export function renderNotifications() {
    const notifications = window.user.notifications;
    updateHeaderState(notifications);

    if (!notifications.length) {
        notificationsList.innerHTML = "";
        notificationsEmptyState.classList.remove("hidden");
        return;
    }

    notificationsEmptyState.classList.add("hidden");
    notificationsList.innerHTML = notifications.map(notification => {
        const meta = getNotificationMeta(notification.message);

        return `
            <li class="notification-item ${notification.is_read ? "is-read" : "is-unread"} notification-tone-${meta.tone}" data-notification-id="${notification.notification_id}">
                <div class="notification-item-body">
                    <div class="notification-icon">
                        <i class="fas ${meta.icon}"></i>
                    </div>
                    <div class="notification-copy">
                        <p class="notification-label">${meta.label}</p>
                        <p class="notification-message">${escapeHtml(notification.message)}</p>
                        <div class="notification-meta">
                            <span>${notification.is_read ? "Read" : "Unread"}</span>
                            <span class="notification-meta-dot"></span>
                            <span>${formatNotificationTime(notification.created_at)}</span>
                        </div>
                    </div>
                    <button class="notification-delete-btn" type="button" data-action="delete-notification" data-notification-id="${notification.notification_id}" aria-label="Delete notification">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </li>
        `;
    }).join("");
}

function showNotifications() {
    hideCalculator();
    notificationsContainer.classList.add("notifications-open");
    notificationsIcon.classList.add("hidden");
    renderNotifications();
}

export function closeNotifications() {
    notificationsContainer.classList.remove("notifications-open");
    notificationsIcon.classList.remove("hidden");
}

async function markAllNotificationsRead() {
    if (!window.user.notifications.some(notification => !notification.is_read)) return;

    window.user.notifications = await request(`${import.meta.env.VITE_API_URL}/notifications/mark-all-read`, {
        credentials: "include",
        method: "POST"
    });
    renderNotifications();
}

async function handleNotificationClick(event) {
    event.preventDefault();

    const deleteButton = event.target.closest("[data-action='delete-notification']");
    if (!deleteButton) return;

    const notificationID = +deleteButton.dataset.notificationId;

    window.user.notifications = await request(`${import.meta.env.VITE_API_URL}/notifications/${notificationID}`, {
        credentials: "include",
        method: "DELETE"
    });
    renderNotifications();
}

export function initializeNotifications() {
    if (initialized) 
        return renderNotifications();

    initialized = true;

    notificationsIcon?.addEventListener("click", showNotifications);
    notificationsCloseButton?.addEventListener("click", closeNotifications);
    markAllReadButton?.addEventListener("click", markAllNotificationsRead);
    notificationsList?.addEventListener("click", handleNotificationClick);

    renderNotifications();
}