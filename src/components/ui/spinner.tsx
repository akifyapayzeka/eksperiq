import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Small inline spinner for buttons mid-request — pairs with a "…ediliyor" label. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden="true" className={cn("h-4 w-4 animate-spin", className)} />;
}
