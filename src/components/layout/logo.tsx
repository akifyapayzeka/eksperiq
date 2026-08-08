/**
 * Official EksperIQ brand marks (public/brand/*.svg — vectorized from the
 * user-provided renders, colors/shapes preserved as-is). All variants are
 * navy-based and were designed for light backgrounds; rather than hand-edit
 * the SVG files for dark mode, dark surfaces get a CSS `invert`/`brightness`
 * filter (no `variant="light"` file exists) so the mark reads as a white
 * silhouette instead of disappearing on a dark background.
 */
type LogoVariant = "amblem" | "yatay" | "dikey" | "dikey-mono";

const SOURCES: Record<LogoVariant, string> = {
  amblem: "/brand/eksperiq-amblem-renkli.svg",
  yatay: "/brand/eksperiq-logo-yatay-renkli.svg",
  dikey: "/brand/eksperiq-logo-dikey-renkli.svg",
  "dikey-mono": "/brand/eksperiq-logo-dikey-mono.svg",
};

const ALT_TEXT: Record<LogoVariant, string> = {
  amblem: "EksperIQ amblemi",
  yatay: "EksperIQ",
  dikey: "EksperIQ",
  "dikey-mono": "EksperIQ",
};

export function Logo({
  variant,
  className = "h-8 w-auto",
  invertOnDark = true,
}: {
  variant: LogoVariant;
  className?: string;
  invertOnDark?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export app; brand SVGs are local files, not remote/next/image sources
    <img
      src={SOURCES[variant]}
      alt={ALT_TEXT[variant]}
      className={`${className} ${invertOnDark ? "dark:brightness-0 dark:invert" : ""}`}
    />
  );
}
