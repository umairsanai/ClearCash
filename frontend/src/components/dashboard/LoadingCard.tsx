type LoadingCardType = "pocket" | "spending" | "transaction";

interface LoadingCardProps {
  type?: LoadingCardType;
}

export function LoadingCard({ type = "pocket" }: LoadingCardProps) {
  if (type === "spending") {
    return (
      <div className="skeleton-spending" aria-hidden="true">
        <div className="skeleton-spending-header">
          <div className="skeleton-spending-category">
            <span className="skeleton skeleton-spending-icon" />
            <span className="skeleton skeleton-spending-name" />
          </div>
          <span className="skeleton skeleton-spending-amount" />
        </div>
        <span className="skeleton skeleton-spending-progress" />
      </div>
    );
  }

  if (type === "transaction") {
    return (
      <div className="transaction-item skeleton-transaction" aria-hidden="true">
        <span className="skeleton skeleton-avatar" />
        <span className="skeleton skeleton-line skeleton-line-medium" />
        <span className="skeleton skeleton-line skeleton-line-amount" />
      </div>
    );
  }

  return (
    <div className="pocket-card skeleton-card" aria-hidden="true">
      <span className="skeleton skeleton-line skeleton-line-short" />
      <span className="skeleton skeleton-line skeleton-line-value" />
      <span className="skeleton skeleton-line" />
    </div>
  );
}
