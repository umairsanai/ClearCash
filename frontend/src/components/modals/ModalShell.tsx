import type { ReactNode } from "react";

interface ModalShellProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function ModalShell({ title, onClose, children }: ModalShellProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <p className="form-message is-error" role="alert">
      {message}
    </p>
  );
}
