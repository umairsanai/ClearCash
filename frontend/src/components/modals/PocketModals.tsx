import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../api";
import { useUser } from "../../context";
import { POCKET_COLORS, type Pocket, type PocketColor } from "../../types";
import { FormError, ModalShell } from "./ModalShell";
import { SelectMenu } from "./SelectMenu";

type PocketModalKind = "add" | "manage" | "transfer" | null;

interface PocketModalsProps {
  kind: PocketModalKind;
  selectedPocket: Pocket | null;
  onClose: () => void;
}

function ColorSelect({
  value,
  onChange,
}: {
  value: PocketColor;
  onChange: (value: PocketColor) => void;
}) {
  return (
    <SelectMenu
      id="pocket-color-input"
      value={value}
      options={POCKET_COLORS.map((color) => ({
        value: color,
        label: color.replace("DARKGREEN", "DARK GREEN"),
      }))}
      onChange={(nextColor) => onChange(nextColor as PocketColor)}
    />
  );
}

export function PocketModals({
  kind,
  selectedPocket,
  onClose,
}: PocketModalsProps) {
  const { user, setUser } = useUser();
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [color, setColor] = useState<PocketColor>("RED");
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(selectedPocket?.pocket_name ?? "");
    setLimit(String(selectedPocket?.pocket_limit ?? ""));
    setColor(selectedPocket?.color ?? "RED");
    setTransferTargetId("");
    setTransferAmount("");
    setError("");
  }, [kind, selectedPocket]);

  if (!kind) return null;

  async function submitPocket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericLimit = Math.floor(Number(limit));

    if (!name.trim()) {
      setError("Please enter a pocket name.");
      return;
    }
    if (!Number.isInteger(numericLimit) || numericLimit <= 0) {
      setError("Please enter a valid budget.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (kind === "add") {
        const result = await api.createPocket({
          pocket_name: name.trim(),
          pocket_limit: numericLimit,
          color,
        });
        setUser((currentUser) =>
          currentUser
            ? {
                ...currentUser,
                pockets: [...currentUser.pockets, result.createdPocket],
                notifications: result.notifications,
              }
            : currentUser,
        );
      }

      if (kind === "manage" && selectedPocket) {
        const updatedUser = await api.updatePocket({
          old_pocket_name: selectedPocket.pocket_name,
          new_pocket_name: name.trim(),
          new_pocket_limit: numericLimit,
          new_pocket_color: color,
        });
        setUser(updatedUser);
      }

      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Couldn't save the pocket.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function submitTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Math.floor(Number(transferAmount));
    const mainPocket = user?.pockets.find(
      (pocket) => pocket.pocket_name === "Main",
    );

    if (!transferTargetId || !Number.isInteger(amount) || amount <= 0) {
      setError("Please select a pocket and enter a valid transfer amount.");
      return;
    }
    if (!mainPocket) {
      setError("Main pocket is unavailable.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const result = await api.transferToPocket({
        sender_pocket: mainPocket.pocket_id,
        receiver_pocket: Number(transferTargetId),
        amount,
      });
      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              pockets: result.pockets,
              notifications: result.notifications,
            }
          : currentUser,
      );
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Couldn't transfer funds.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePocket() {
    if (!selectedPocket) return;

    setSaving(true);
    setError("");

    try {
      setUser(await api.deletePocket(selectedPocket.pocket_id));
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Couldn't delete the pocket.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (kind === "transfer") {
    const customPockets =
      user?.pockets.filter((pocket) => pocket.pocket_name !== "Main") ?? [];

    return (
      <ModalShell title="Transfer Funds" onClose={onClose}>
        <form
          className="modal-body"
          onSubmit={(event) => void submitTransfer(event)}
        >
          <div className="form-group">
            <label htmlFor="transfer-from-pocket">From</label>
            <input
              id="transfer-from-pocket"
              className="form-input"
              value="Main Pocket"
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="transfer-to-pocket">To</label>
            <SelectMenu
              id="transfer-to-pocket"
              value={transferTargetId}
              options={[
                { value: "", label: "Select a pocket" },
                ...customPockets.map((pocket) => ({
                  value: String(pocket.pocket_id),
                  label: pocket.pocket_name,
                })),
              ]}
              onChange={setTransferTargetId}
              iconClassName="fas fa-tag"
            />
          </div>
          <div className="form-group">
            <label htmlFor="transfer-amount-input">Amount (Rs)</label>
            <input
              id="transfer-amount-input"
              className="form-input"
              type="number"
              value={transferAmount}
              onChange={(event) => setTransferAmount(event.target.value)}
              placeholder="10,000"
            />
          </div>
          <FormError message={error} />
          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%" }}
              disabled={saving}
            >
              {saving ? "Transferring..." : "Confirm Transfer"}
            </button>
          </div>
        </form>
      </ModalShell>
    );
  }

  const title = kind === "add" ? "Add New Pocket" : "Manage Pocket";

  return (
    <ModalShell title={title} onClose={onClose}>
      <form
        className="modal-body"
        onSubmit={(event) => void submitPocket(event)}
      >
        <div className="form-group">
          <label htmlFor="pocket-name-input">Pocket Name</label>
          <input
            id="pocket-name-input"
            className="form-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g., Groceries"
          />
        </div>
        <div className="form-group">
          <label htmlFor="pocket-budget-input">Total Budget (Rs)</label>
          <input
            id="pocket-budget-input"
            className="form-input"
            type="number"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            placeholder="e.g., 5000"
          />
        </div>
        <div className="form-group">
          <label htmlFor="pocket-color-input">Pocket Color</label>
          <ColorSelect value={color} onChange={setColor} />
        </div>
        <FormError message={error} />
        <div className="form-actions">
          {kind === "manage" && (
            <button
              type="button"
              className="btn-danger"
              disabled={saving}
              onClick={() => void deletePocket()}
            >
              <i className="fas fa-trash-alt" /> Delete Pocket
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving
              ? "Saving..."
              : kind === "add"
                ? "Create Pocket"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
