import clsx from "clsx";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-secondary/60",
  subtle: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
};

const LoadingButton = ({
  children,
  loading = false,
  className,
  variant = "primary",
  icon,
  ...props
}) => {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variants[variant],
        loading && "cursor-wait opacity-80",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && icon ? <span className="mr-2">{icon}</span> : null}
      {children}
    </button>
  );
};

export default LoadingButton;


