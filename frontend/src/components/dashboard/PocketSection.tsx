import { formatAmount, pocketTheme } from "../../api";
import { useUser } from "../../context";
import type { Pocket } from "../../types";
import { LoadingCard } from "./LoadingCard";

interface PocketSectionProps {
  loading: boolean;
  onAdd: () => void;
  onManage: (pocket: Pocket) => void;
  onTransfer: () => void;
}

interface PocketCardProps {
  pocket: Pocket;
  onManage: (pocket: Pocket) => void;
  onTransfer: () => void;
}

function PocketCard({ pocket, onManage, onTransfer }: PocketCardProps) {
  const isMainPocket = pocket.pocket_name === "Main";
  const limit = pocket.pocket_limit ?? 0;
  const remainingPercentage =
    limit > 0 ? Math.min(100, (pocket.pocket_balance / limit) * 100) : 0;

  return (
    <div className={`pocket-card pocket-theme-${pocketTheme(pocket.color)}`}>
      <div className="pocket-card-header">
        <i className="fas fa-archive" />
        <span>{pocket.pocket_name}</span>
      </div>

      <p className="pocket-card-balance">
        Rs {formatAmount(pocket.pocket_balance)}
      </p>

      {!isMainPocket && (
        <>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${remainingPercentage}%` }}
            />
          </div>
          <p className="pocket-card-info">
            Rs {formatAmount(pocket.pocket_balance)} left of{" "}
            {formatAmount(limit)}
          </p>
        </>
      )}

      <button
        type="button"
        className={`pocket-card-action ${isMainPocket ? "transfer" : "manage"}-pocket-btn`}
        onClick={() => (isMainPocket ? onTransfer() : onManage(pocket))}
      >
        {isMainPocket ? "Transfer Funds" : "Manage"}
      </button>
    </div>
  );
}

export function PocketSection({
  loading,
  onAdd,
  onManage,
  onTransfer,
}: PocketSectionProps) {
  const { user } = useUser();
  const pockets = user?.pockets ?? [];
  const mainPocket = pockets.find((pocket) => pocket.pocket_name === "Main");
  const customPockets = pockets.filter(
    (pocket) => pocket.pocket_name !== "Main",
  );

  return (
    <div className="card card-col-span-3 card-hover">
      <h3 className="card-title">My Pockets</h3>

      <div className="pocket-grid">
        {loading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : (
          <>
            {mainPocket && (
              <PocketCard
                pocket={mainPocket}
                onManage={onManage}
                onTransfer={onTransfer}
              />
            )}
            {customPockets.map((pocket) => (
              <PocketCard
                key={pocket.pocket_id}
                pocket={pocket}
                onManage={onManage}
                onTransfer={onTransfer}
              />
            ))}
          </>
        )}
      </div>

      <button
        type="button"
        className="add-pocket-btn"
        disabled={loading}
        onClick={onAdd}
      >
        <i className="fas fa-plus" />
        Add New Pocket
      </button>
    </div>
  );
}
