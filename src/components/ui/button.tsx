import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type BaseProps = {
  children: ReactNode;
  className?: string;
  href?: string;
};

type ButtonProps = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export const buttonBaseClasses =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-theme px-5 text-sm font-semibold transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

/** Solid, high-emphasis action — primary token background. */
export function PrimaryButton({ href, className, children, type = "button", ...props }: ButtonProps) {
  const classes = cn(buttonBaseClasses, "bg-primary text-primary-foreground hover:opacity-90", className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

/** Outlined, medium-emphasis action. */
export function SecondaryButton({ href, className, children, type = "button", ...props }: ButtonProps) {
  const classes = cn(buttonBaseClasses, "border border-border bg-card text-foreground hover:bg-secondary", className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
  icon: LucideIcon;
  label: string;
  href?: string;
  className?: string;
  variant?: "default" | "accent";
  withNotificationDot?: boolean;
};

/** Icon-only button — always carries an aria-label since there is no visible text. */
export function IconButton({
  icon: Icon,
  label,
  href,
  className,
  variant = "default",
  withNotificationDot = false,
  type = "button",
  ...props
}: IconButtonProps) {
  const classes = cn(
    "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-theme border border-border bg-card text-foreground shadow-sm transition active:scale-95",
    variant === "accent" && "border-transparent bg-accent text-accent-foreground",
    className,
  );
  const content = (
    <>
      <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
      {withNotificationDot ? (
        <span
          className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-card"
          aria-hidden="true"
        />
      ) : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} aria-label={label} className={classes} {...props}>
      {content}
    </button>
  );
}
