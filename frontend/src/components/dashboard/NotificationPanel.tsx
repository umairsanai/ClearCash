import { api, isUnread } from "../../api";
import { useUser } from "../../context";
import type { Notification } from "../../types";

const NOTIFICATION_TYPES = [
  {
    keyword: "created",
    label: "Pocket created",
    icon: "fa-folder-plus",
    tone: "created",
  },
  {
    keyword: "updated",
    label: "Pocket updated",
    icon: "fa-pen-to-square",
    tone: "updated",
  },
  {
    keyword: "deleted",
    label: "Pocket deleted",
    icon: "fa-trash-can",
    tone: "deleted",
  },
  {
    keyword: "transferred",
    label: "Pocket transfer",
    icon: "fa-right-left",
    tone: "transferred",
  },
  {
    keyword: "sent",
    label: "Money sent",
    icon: "fa-paper-plane",
    tone: "sent",
  },
  {
    keyword: "received",
    label: "Money received",
    icon: "fa-circle-down",
    tone: "received",
  },
] as const;

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

function getNotificationDetails(message: string) {
  return (
    NOTIFICATION_TYPES.find((item) =>
      message.toLowerCase().includes(item.keyword),
    ) ?? {
      label: "Activity update",
      icon: "fa-bell",
      tone: "updated",
    }
  );
}

function formatNotificationTime(createdAt: string) {
  const secondsAgo = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 1000,
  );

  if (secondsAgo < 60) return "Just now";

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo}m ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo}h ago`;

  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) return `${daysAgo}d ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(createdAt));
}

function NotificationItem({
  notification,
  onDelete,
}: {
  notification: Notification;
  onDelete: (id: number) => void;
}) {
  const { label, icon, tone } = getNotificationDetails(notification.message);
  const unread = isUnread(notification);

  return (
    <li
      className={`notification-item ${unread ? "is-unread" : "is-read"} notification-tone-${tone}`}
    >
      <div className="notification-item-body">
        <div className="notification-icon">
          <i className={`fas ${icon}`} />
        </div>
        <div className="notification-copy">
          <p className="notification-label">{label}</p>
          <p className="notification-message">{notification.message}</p>
          <div className="notification-meta">
            <span>{unread ? "Unread" : "Read"}</span>
            <span className="notification-meta-dot" />
            <span>{formatNotificationTime(notification.created_at)}</span>
          </div>
        </div>
        <button
          type="button"
          className="notification-delete-btn"
          aria-label="Delete notification"
          onClick={() => onDelete(notification.notification_id)}
        >
          <i className="fas fa-times" />
        </button>
      </div>
    </li>
  );
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { user, setUser } = useUser();
  const notifications = user?.notifications ?? [];
  const unreadCount = notifications.filter(isUnread).length;

  async function markAllAsRead() {
    const updatedNotifications = await api.markAllNotificationsRead();
    setUser((currentUser) =>
      currentUser
        ? { ...currentUser, notifications: updatedNotifications }
        : currentUser,
    );
  }

  async function deleteNotification(notificationId: number) {
    const updatedNotifications = await api.deleteNotification(notificationId);
    setUser((currentUser) =>
      currentUser
        ? { ...currentUser, notifications: updatedNotifications }
        : currentUser,
    );
  }

  const summary = !notifications.length
    ? "Your latest activity will appear here."
    : !unreadCount
      ? "Everything is read and organized for later review."
      : `${unreadCount} unread notification${unreadCount === 1 ? " needs" : "s need"} your attention.`;

  return (
    <div
      id="notifications-panel"
      className={`no-scrollbar ${open ? "notifications-open" : ""}`}
    >
      <div className="notifications-content">
        <div className="notifications-header">
          <div className="notifications-header-copy">
            <p className="panel-kicker">Activity Center</p>
            <h3>Notifications</h3>
            <p className="notifications-summary-text">{summary}</p>
          </div>
          <div className="notifications-header-actions">
            <button
              type="button"
              className="mark-all-notifications-btn"
              disabled={!unreadCount}
              onClick={() => void markAllAsRead()}
            >
              Mark all as read
            </button>
            <button
              type="button"
              className="drawer-close-btn"
              aria-label="Close notifications"
              onClick={onClose}
            >
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        <div className="notifications-list-shell">
          {notifications.length ? (
            <ul className="notifications-list no-scrollbar">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.notification_id}
                  notification={notification}
                  onDelete={(id) => void deleteNotification(id)}
                />
              ))}
            </ul>
          ) : (
            <div className="notifications-empty">
              <div className="notifications-empty-icon">
                <i className="fas fa-bell-slash" />
              </div>
              <h4>Nothing here yet</h4>
              <p>
                New pocket activity, transfers, and money updates will appear
                here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
