import { useState } from "react";
import { formatAmount } from "../../api";
import { useUser } from "../../context";

interface BalanceCardProps {
  loading: boolean;
  onSend: () => void;
}

export function BalanceCard({ loading, onSend }: BalanceCardProps) {
  const { user } = useUser();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  function toggleBalanceVisibility() {
    setIsBalanceVisible((current) => !current);
  }

  return (
    <div className="card card-col-span-3 balance-card">
      <p>Total Balance</p>

      <div className="balance-display">
        {loading ? (
          <h2
            className="skeleton skeleton-balance"
            aria-label="Loading balance"
          />
        ) : (
          <h2>
            {isBalanceVisible
              ? `Rs ${formatAmount(user?.total_balance ?? 0)}`
              : "********"}
          </h2>
        )}

        <button
          type="button"
          aria-label="Toggle balance visibility"
          disabled={loading}
          onClick={toggleBalanceVisibility}
        >
          <i className={`fas fa-eye${isBalanceVisible ? "" : "-slash"}`} />
        </button>
      </div>

      <div className="balance-actions">
        <button type="button" onClick={() => window.alert("Can't Add Funds!")}>
          <i className="fas fa-plus-circle" />
          Add Funds
        </button>
        <button type="button" onClick={onSend}>
          <i className="fas fa-paper-plane" />
          Send
        </button>
      </div>
    </div>
  );
}
