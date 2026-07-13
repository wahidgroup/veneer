/**
 * @packageDocumentation
 * `@wahidgroup/veneer`: React component library for Wahid Group apps.
 *
 * Styling: CVA variants + `cn` (`clsx` + `tailwind-merge`). Import
 * `@wahidgroup/veneer/theme.css` in the consumer Tailwind entry and
 * ensure `@source` covers this package's `dist`.
 */

export { Badge, badgeVariants } from "./components/Badge.js";
export type { BadgeProps } from "./components/Badge.js";
export { Button, buttonVariants } from "./components/Button.js";
export type { ButtonProps } from "./components/Button.js";
export { Loading, loadingVariants } from "./components/Loading.js";
export type { LoadingProps } from "./components/Loading.js";
export { cn, cva } from "./utils/index.js";
export type { VariantProps } from "./utils/index.js";
