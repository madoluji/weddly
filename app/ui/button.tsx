import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  success?: boolean;
  outline?: boolean;
  danger?: boolean;
}

export function Button({
  children,
  className,
  success,
  outline,
  danger,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        "flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        className,
        {
          "bg-primary-600 focus-visible:outline-primary-500 active:bg-primary-500":
            !success && !outline && !danger,
          "bg-success-600 focus-visible:outline-success-500 active:bg-success-500":
            success && !outline,
          "border border-primary-500 hover:bg-zinc-100 text-primary-600 bg-transparent":
            outline && !success && !danger,
          "border border-success-600 text-success-600 bg-transparent":
            outline && success,
          "bg-danger-600 focus-visible:outline-danger-500 active:bg-danger-500":
            danger && !outline,
          "border border-danger-600 text-danger-600 bg-transparent":
            outline && danger,
        }
      )}
    >
      {children}
    </button>
  );
}
