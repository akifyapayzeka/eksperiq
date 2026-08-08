import type { ReactNode } from "react";
import { AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function AlertBase({
  icon: Icon,
  className,
  iconClassName,
  children,
  role,
}: {
  icon: typeof Info;
  className: string;
  iconClassName: string;
  children: ReactNode;
  role?: "status" | "alert";
}) {
  return (
    <aside role={role} className={cn("flex gap-3 rounded-theme border px-4 py-3.5 text-sm leading-5", className)}>
      <Icon aria-hidden="true" className={cn("mt-0.5 h-[18px] w-[18px] shrink-0", iconClassName)} strokeWidth={1.8} />
      <div className="min-w-0 flex-1">{children}</div>
    </aside>
  );
}

/** Neutral informational note — e.g. how a flow works, a data-source explainer. */
export function InfoAlert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AlertBase icon={Info} className={cn("border-border bg-muted text-muted-foreground", className)} iconClassName="text-accent">
      {children}
    </AlertBase>
  );
}

/** Attention-needed note — upcoming deadlines, fields to double check. Not used for hard errors. */
export function WarningAlert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AlertBase
      role="status"
      icon={AlertTriangle}
      className={cn("border-warning/30 bg-warning/10 text-foreground", className)}
      iconClassName="text-warning"
    >
      {children}
    </AlertBase>
  );
}

/** Certainty-language guardrail — used near scores/reports to remind users this is not a final verdict. */
export function DisclaimerCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AlertBase icon={ShieldCheck} className={cn("border-border bg-muted text-muted-foreground", className)} iconClassName="text-success">
      {children}
    </AlertBase>
  );
}
