import { X } from "lucide-react";
import clsx from "clsx";

const variantClasses = {
  default: "bg-card text-card-foreground border border-border",
  success: "bg-emerald-500/90 text-white",
  error: "bg-destructive text-destructive-foreground",
  info: "bg-secondary text-secondary-foreground",
};

const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col gap-3 px-4 sm:items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 shadow-xl ring-1 ring-black/5 transition",
            "animate-toast-in",
            variantClasses[toast.variant] || variantClasses.default
          )}
        >
          <div className="flex-1">
            <p className="font-semibold">{toast.title}</p>
            {toast.description && (
              <p className="text-sm opacity-80">{toast.description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(toast.id)}
            className="rounded-full bg-black/10 p-1 text-sm text-inherit hover:bg-black/20 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;


