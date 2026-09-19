import { isUnread } from "../../api";
import { useUser } from "../../context";
import logoUrl from "../../../assets/logo.png";

interface AppHeaderProps {
  onNotifications: () => void;
  onLogout: () => void;
}

export function AppHeader({ onNotifications, onLogout }: AppHeaderProps) {
  const { user } = useUser();
  const hasUnreadNotifications = user?.notifications.some(isUnread);

  return (
    <header className="header">
      <nav className="header-nav">
        <div className="header-logo">
          <img src={logoUrl} alt="ClearCash logo" />
          <h1 id="app-name">
            <span className="brand-clear">Clear</span>
            <span className="brand-cash">Cash</span>
          </h1>
        </div>

        <div className="header-actions">
          <button
            type="button"
            id="notifications-btn"
            aria-label="Notifications"
            onClick={onNotifications}
          >
            <i className="fas fa-bell" />
            {hasUnreadNotifications && (
              <span
                className="notification-badge"
                aria-label="Unread notifications"
              />
            )}
          </button>

          <button
            type="button"
            id="logout-btn"
            aria-label="Log out"
            onClick={onLogout}
          >
            <i className="fa fa-sign-out" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>
  );
}
