import { CheckCircle2 } from "lucide-react";

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SuccessModal = ({ isOpen, onClose }: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        className="app-modal-panel w-full max-w-sm rounded-lg border border-palette-line p-6 text-left shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <CheckCircle2
            className="shrink-0 text-palette-paper"
            size={36}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h2 id="success-modal-title" className="font-serif text-xl font-bold">
            Sent to Notion
          </h2>
        </div>
        <p className="mt-4 text-sm text-palette-muted">
          The album was added successfully to your Notion board.
        </p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="mt-6 w-full rounded bg-palette-paper px-4 py-2 font-medium text-palette-ink hover:bg-palette-highlight focus:outline-none focus:ring-2 focus:ring-palette-paper focus:ring-offset-2 focus:ring-offset-palette-raised"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
