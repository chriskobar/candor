// ─── Candor design tokens ─────────────────────────────────────────
// Single source of truth for all color values.
// Import as: import { c } from "@/lib/tokens";

export const c = {
  // Backgrounds
  bgBase:        "#FAFAF8",  // page / nav backgrounds
  bgSurface:     "#F5F1EB",  // cards, input areas, elevated surfaces
  bgElevated:    "#FFFFFF",  // pure white inputs, modals

  // Text
  textPrimary:   "#1C1917",  // headings, dominant copy
  textSecondary: "#6D6861",  // supporting copy, labels
  textTertiary:  "#A09890",  // hints, metadata, placeholders

  // Borders
  borderSubtle:  "#EAE5DE",  // dividers, nav underlines
  borderDefault: "#D4CEC5",  // input borders, card edges

  // Accent (green)
  accentBold:    "#2D7D62",  // primary buttons, active states
  accentSubtle:  "#E5F3EE",  // button backgrounds, low-emphasis highlights
  accentHover:   "#D0EDDF",  // hover backgrounds on accent elements
  accentText:    "#1D5A46",  // accent text, hover text, links

  // Warm (error / destructive)
  warmBold:      "#C05C35",  // errors, destructive actions
  warmHover:     "#8C3918",  // hover on destructive elements
  warmSubtle:    "#FAEEE7",  // error state backgrounds

  // Amber (warning / mid scores)
  amber:         "#C9893A",  // caution, mid-range scores
  amberSubtle:   "#FDF4E7",  // amber state backgrounds

  // UI states
  uiInactive:    "#E0DDD2",  // toggle/switch inactive background
} as const;
