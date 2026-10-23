/**
 * A QR code as an inline block, dark modules on white whatever the page's scheme, since a phone's camera reads dark on
 * light best. Override `--cqr-size` to resize it. The rules sit in the `comark` layer, so any unlayered rule of the
 * host's wins.
 */
export const css = `@layer comark{${[
  ":where(.cqr){--cqr-size:8rem}",
  ".cqr{display:inline-block;width:var(--cqr-size);max-width:100%;vertical-align:middle;line-height:0}",
  ".cqr svg{display:block;width:100%;height:auto;border-radius:4px;background:#fff;color:#000;shape-rendering:crispEdges}",
  "@media print{.cqr svg{-webkit-print-color-adjust:exact;print-color-adjust:exact}}",
].join("")}}`;
