import { useEffect, useState } from "react";
import { api, formatDate } from "../api";
import { useLoadUser, useUser } from "../context";
import { navigate } from "../router";
import type { Pocket } from "../types";
import { AppHeader } from "../components/dashboard/AppHeader";
import { BalanceCard } from "../components/dashboard/BalanceCard";
import { CalculatorPanel } from "../components/dashboard/CalculatorPanel";
import { NotificationPanel } from "../components/dashboard/NotificationPanel";
import { PocketSection } from "../components/dashboard/PocketSection";
import { TransactionsCard } from "../components/dashboard/TransactionsCard";
import { WeeklySpendingCard } from "../components/dashboard/WeeklySpendingCard";
import { PocketModals } from "../components/modals/PocketModals";
import { SendMoneyModal } from "../components/modals/SendMoneyModal";

type PanelName = "calculator" | "notifications" | null;
type ModalName = "add" | "manage" | "transfer" | "send" | null;

export function DashboardPage() {
  const { user, loading } = useLoadUser();
  const { logout } = useUser();
  const [openPanel, setOpenPanel] = useState<PanelName>(null);
  const [openModal, setOpenModal] = useState<ModalName>(null);
  const [selectedPocket, setSelectedPocket] = useState<Pocket | null>(null);
  const [weekEnd, setWeekEnd] = useState(() => new Date());
  const [spendings, setSpendings] = useState(user?.spendings ?? []);
  const [isSpendingLoading, setIsSpendingLoading] = useState(true);

  const isInitialLoading = loading && !user;
  const pockets = user?.pockets ?? [];
  const transactions = user?.transactions ?? [];

  useEffect(() => {
    if (user) setSpendings(user.spendings);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let isCurrentRequest = true;
    const startOfWeek = new Date(weekEnd.getTime() - 6 * 86400000);

    setIsSpendingLoading(true);

    api
      .weeklySpendings(formatDate(startOfWeek), formatDate(weekEnd))
      .then((nextSpendings) => {
        if (isCurrentRequest) setSpendings(nextSpendings);
      })
      .catch(() => {
        if (isCurrentRequest) setSpendings([]);
      })
      .finally(() => {
        if (isCurrentRequest) setIsSpendingLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [user, weekEnd]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user]);

  function closeModal() {
    setOpenModal(null);
    setSelectedPocket(null);
  }

  function openPocketManager(pocket: Pocket) {
    setSelectedPocket(pocket);
    setOpenModal("manage");
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/auth");
    }
  }

  function togglePanel(panel: Exclude<PanelName, null>) {
    setOpenPanel((currentPanel) => (currentPanel === panel ? null : panel));
  }

  return (
    <>
      <AppHeader
        onNotifications={() => togglePanel("notifications")}
        onLogout={() => void handleLogout()}
      />

      <div className="app-container">
        <div id="main-app-wrapper" className="no-scrollbar">
          <div className="main-content">
            <div className="greeting-bar">
              {isInitialLoading ? (
                <h2
                  className="skeleton skeleton-heading"
                  aria-label="Loading greeting"
                />
              ) : (
                <h2>Welcome, {user?.name}!</h2>
              )}
              <button
                type="button"
                aria-label="Open calculator"
                disabled={isInitialLoading}
                onClick={() => togglePanel("calculator")}
              >
                <i className="fas fa-calculator" />
              </button>
            </div>

            <main className="dashboard-grid">
              <BalanceCard
                loading={isInitialLoading}
                onSend={() => setOpenModal("send")}
              />
              <PocketSection
                loading={isInitialLoading}
                onAdd={() => setOpenModal("add")}
                onTransfer={() => setOpenModal("transfer")}
                onManage={openPocketManager}
              />
              <WeeklySpendingCard
                date={weekEnd}
                loading={isInitialLoading || isSpendingLoading}
                pockets={pockets}
                spendings={spendings}
                onPrevious={() =>
                  setWeekEnd((date) => new Date(date.getTime() - 7 * 86400000))
                }
                onNext={() =>
                  setWeekEnd((date) => new Date(date.getTime() + 7 * 86400000))
                }
              />
              <TransactionsCard
                loading={isInitialLoading}
                pockets={pockets}
                transactions={transactions}
              />
            </main>

            <footer className="app-footer">
              <p>&copy; 2026 ClearCash - Umair Anwar</p>
            </footer>
          </div>
        </div>

        <CalculatorPanel
          open={openPanel === "calculator"}
          onClose={() => setOpenPanel(null)}
        />
        <NotificationPanel
          open={openPanel === "notifications"}
          onClose={() => setOpenPanel(null)}
        />
      </div>

      <PocketModals
        kind={
          openModal === "add" ||
          openModal === "manage" ||
          openModal === "transfer"
            ? openModal
            : null
        }
        selectedPocket={selectedPocket}
        onClose={closeModal}
      />
      <SendMoneyModal open={openModal === "send"} onClose={closeModal} />
    </>
  );
}
