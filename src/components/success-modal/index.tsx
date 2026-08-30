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
        className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 text-left text-neutral-900 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <CheckCircle2
            className="shrink-0 text-blue-600"
            size={36}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h2 id="success-modal-title" className="text-xl font-bold">
            Sent to Notion
          </h2>
        </div>
        <p className="mt-4 text-sm text-neutral-600">
          The album was added successfully to your Notion board.
        </p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="mt-6 w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
