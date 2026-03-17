import type { Company, LpSettings } from "@/types/database";

/** hex (#rrggbb) → "r, g, b" 文字列 */
export function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/** hex → HSL の lightness だけ取得 (0-100) */
function getLightness(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return ((max + min) / 2) * 100;
}

/** primary が暗い色かどうか */
export function isDarkPrimary(hex: string): boolean {
  return getLightness(hex) < 50;
}

/** DB の Company + LpSettings → CSS 変数オブジェクト */
export function generateThemeVars(
  company: Company,
  lpSettings: LpSettings | null
): Record<string, string> {
  void lpSettings;
  const primary = company.primary_color || "#1b2a3d";
  const secondary = company.secondary_color || "#b09060";
  const dark = isDarkPrimary(primary);

  return {
    "--lp-primary": primary,
    "--lp-primary-rgb": hexToRgb(primary),
    "--lp-secondary": secondary,
    "--lp-secondary-rgb": hexToRgb(secondary),
    "--lp-cream": dark ? "#f8f5f0" : "#f9fafb",
    "--lp-hero-text": dark ? "#ffffff" : "#111827",
    "--lp-hero-sub": dark ? "rgba(255,255,255,0.75)" : "rgba(17,24,39,0.65)",
  };
}
