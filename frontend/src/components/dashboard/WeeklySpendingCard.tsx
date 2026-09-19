import type { Pocket, Spending } from "../../types";
import { formatAmount, pocketTheme } from "../../api";
import { LoadingCard } from "./LoadingCard";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface WeeklySpendingCardProps {
  date: Date;
  loading: boolean;
  pockets: Pocket[];
  spendings: Spending[];
  onNext: () => void;
  onPrevious: () => void;
}

interface SpendingItemProps {
  spending: Spending;
  pocket?: Pocket;
  totalSpending: number;
}

export function SpendingItem({
  spending,
  pocket,
  totalSpending,
}: SpendingItemProps) {
  const theme = pocketTheme(pocket?.color);
  const percentage =
    totalSpending > 0 ? (spending.spending / totalSpending) * 100 : 0;

  return (
    <div className={`spending-theme-${theme}`}>
      <div className="spending-item-header">
        <span className="spending-item-category">
          <i className="fas fa-tag" />
          {spending.pocket_name}
        </span>
        <span className="spending-item-amount">
          Rs {formatAmount(spending.spending)}
        </span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export function WeeklySpendingCard({
  date,
  loading,
  pockets,
  spendings,
  onNext,
  onPrevious,
}: WeeklySpendingCardProps) {
  const startOfWeek = new Date(date.getTime() - 6 * 86400000);
  const visibleSpendings = spendings.filter(
    (spending) => spending.spending > 0,
  );
  const totalSpending = visibleSpendings.reduce(
    (sum, spending) => sum + spending.spending,
    0,
  );

  return (
    <div className="card card-col-span-3 card-hover">
      <div className="spending-header">
        <h3 className="spending-title">This Week</h3>
        <div className="spending-nav">
          <button type="button" aria-label="Previous week" onClick={onPrevious}>
            <i className="fas fa-chevron-left" />
          </button>
          <span>
            {MONTHS[startOfWeek.getUTCMonth()]} {startOfWeek.getUTCDate()} -{" "}
            {MONTHS[date.getUTCMonth()]} {date.getUTCDate()}
          </span>
          <button type="button" aria-label="Next week" onClick={onNext}>
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      </div>

      <div className="spending-list">
        {loading ? (
          <>
            <LoadingCard type="spending" />
            <LoadingCard type="spending" />
          </>
        ) : visibleSpendings.length ? (
          visibleSpendings.map((spending) => (
            <SpendingItem
              key={spending.pocket_name}
              spending={spending}
              pocket={pockets.find(
                (pocket) => pocket.pocket_name === spending.pocket_name,
              )}
              totalSpending={totalSpending}
            />
          ))
        ) : (
          <div className="no-spendings-message">No spendings this week!</div>
        )}
      </div>
    </div>
  );
}
