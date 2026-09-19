import { useState } from "react";
import { formatAmount, pocketTheme } from "../../api";
import type { Pocket, Transaction } from "../../types";
import { LoadingCard } from "./LoadingCard";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface TransactionsCardProps {
  loading: boolean;
  pockets: Pocket[];
  transactions: Transaction[];
}

function TransactionItem({
  transaction,
  pockets,
}: {
  transaction: Transaction;
  pockets: Pocket[];
}) {
  const pocket = pockets.find(
    (item) => item.pocket_name === transaction.pocket_name,
  );
  const color = pocketTheme(pocket?.color);
  const [year, month, day] = transaction.transaction_date.split("-");

  return (
    <div className="transaction-item">
      <div className="transaction-details">
        <div className={`transaction-icon icon-${color}`}>
          <i className="fas fa-money-bill-wave" />
        </div>
        <div className="transaction-info">
          <p className="title">{transaction.transaction_message}</p>
          <p className="subtitle">
            {transaction.pocket_name} Pocket • {MONTHS[Number(month) - 1]}{" "}
            {Number(day)}
          </p>
        </div>
      </div>
      <p
        className={`transaction-amount amount-${transaction.transaction_amount < 0 ? "debit" : "credit"}`}
      >
        {transaction.transaction_amount < 0 ? "-" : "+"} Rs{" "}
        {formatAmount(Math.abs(transaction.transaction_amount))}
      </p>
    </div>
  );
}

export function TransactionsCard({
  loading,
  pockets,
  transactions,
}: TransactionsCardProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleTransactions = showAll ? transactions : transactions.slice(0, 4);

  return (
    <div className="transactions card card-col-span-3 card-hover">
      <h3 className="card-title">Recent Transactions</h3>

      <div className="transaction-list">
        {loading ? (
          <>
            <LoadingCard type="transaction" />
            <LoadingCard type="transaction" />
            <LoadingCard type="transaction" />
            <LoadingCard type="transaction" />
          </>
        ) : (
          visibleTransactions.map((transaction, index) => (
            <TransactionItem
              key={`${transaction.transaction_date}-${index}`}
              transaction={transaction}
              pockets={pockets}
            />
          ))
        )}
      </div>

      <button
        type="button"
        className="view-all-btn"
        disabled={loading}
        onClick={() => setShowAll((current) => !current)}
      >
        View {showAll ? "Few" : "All"} Transactions
      </button>
    </div>
  );
}
