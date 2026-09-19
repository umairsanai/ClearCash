import { useEffect, useRef, useState } from "react";
import { api, formatAmount } from "../../api";
import { useUser } from "../../context";
import type { Recipient } from "../../types";
import { FormError, ModalShell } from "./ModalShell";
import { SelectMenu } from "./SelectMenu";

interface SendMoneyModalProps {
  open: boolean;
  onClose: () => void;
}

function RecipientSearch({
  recipients,
  onSelect,
}: {
  recipients: Recipient[];
  onSelect: (recipient: Recipient) => void;
}) {
  return (
    <div className="matching-contact-results">
      <ul className="matching-contacts-list-container">
        {recipients.map((recipient) => (
          <li
            key={recipient.user_id}
            className="contact-item"
            onClick={() => onSelect(recipient)}
          >
            <div className="contact-info">
              <div className="contact-icon">
                <i className="fas fa-user-circle" />
              </div>
              <div>
                <p className="name">{recipient.name}</p>
                <p className="handle">{recipient.username}</p>
              </div>
            </div>
            <i className="fas fa-chevron-right" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SendMoneyModal({ open, onClose }: SendMoneyModalProps) {
  const { user, setUser } = useUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [sendingPocketId, setSendingPocketId] = useState("");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const latestSearchId = useRef(0);

  useEffect(() => {
    if (!open) return;

    const mainPocket = user?.pockets.find(
      (pocket) => pocket.pocket_name === "Main",
    );
    setStep(1);
    setSearch("");
    setRecipients([]);
    setRecipient(null);
    setSendingPocketId(String(mainPocket?.pocket_id ?? ""));
    setAmount(0);
    setError("");
  }, [open, user]);

  useEffect(() => {
    const searchId = ++latestSearchId.current;

    if (!open || !search.trim()) {
      setRecipients([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const foundRecipients = await api.findRecipients(search.trim());
        if (searchId === latestSearchId.current) setRecipients(foundRecipients);
      } catch {
        if (searchId === latestSearchId.current)
          setError("Couldn't find recipients.");
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [open, search]);

  if (!open) return null;

  function chooseRecipient(nextRecipient: Recipient) {
    setRecipient(nextRecipient);
    setStep(2);
    setError("");
  }

  function appendDigit(digit: number) {
    setAmount((currentAmount) => currentAmount * 10 + digit);
  }

  async function sendMoney() {
    if (!recipient || !sendingPocketId || !amount) {
      setError("Choose a recipient and enter an amount.");
      return;
    }

    setSending(true);
    setError("");

    try {
      const updatedUser = await api.sendMoney({
        sender_pocket_id: Number(sendingPocketId),
        recipient_user_id: recipient.user_id,
        amount,
      });
      setUser(updatedUser);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Transaction failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <ModalShell title="Send Money" onClose={onClose}>
      {step === 1 ? (
        <div id="send-money-step-1">
          <div className="form-group">
            <label htmlFor="send-from-pocket">Send From</label>
            <SelectMenu
              id="send-from-pocket"
              value={sendingPocketId}
              options={
                user?.pockets.map((pocket) => ({
                  value: String(pocket.pocket_id),
                  label: pocket.pocket_name,
                })) ?? []
              }
              onChange={setSendingPocketId}
              iconClassName="fas fa-wallet"
            />
          </div>

          <div className="search-input-container">
            <input
              className="form-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Phone, or @clearcash Username"
            />
            <i className="fas fa-search" />
          </div>

          <RecipientSearch recipients={recipients} onSelect={chooseRecipient} />
          <FormError message={error} />
        </div>
      ) : (
        <div id="send-money-step-2">
          <div className="recipient-info">
            <p>Sending to</p>
            <div className="recipient-display">
              <div className="contact-icon">
                <i className="fas fa-user" />
              </div>
              <p>{recipient?.name}</p>
            </div>
          </div>

          <div className="amount-display">
            <input readOnly value={formatAmount(amount)} />
            <p>Rs</p>
          </div>

          <div className="dialpad-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                className="dialpad-num"
                onClick={() => appendDigit(digit)}
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              type="button"
              className="dialpad-num"
              onClick={() => appendDigit(0)}
            >
              0
            </button>
            <button
              type="button"
              className="dialpad-back"
              onClick={() =>
                setAmount((currentAmount) => Math.floor(currentAmount / 10))
              }
            >
              <i className="fas fa-backspace" />
            </button>
          </div>

          <FormError message={error} />
          <button
            type="button"
            className="confirm-send-btn"
            disabled={sending || !amount}
            onClick={() => void sendMoney()}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      )}
    </ModalShell>
  );
}
