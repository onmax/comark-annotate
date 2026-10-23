import { Icon, type IconData } from "comark-icon/react";
import { createElement, type ReactNode, useEffect } from "react";
import { addStyles, external, rel } from "./client.ts";

export { colors, default } from "./index.ts";
export type {
  CardAttributes,
  CardColor,
  CardsMeta,
  CardsOptions,
  ColumnsAttributes,
} from "./index.ts";

type Children = { children?: ReactNode };

const arrow = () =>
  createElement(
    "svg",
    {
      className: "ccr-external",
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
    },
    createElement("path", { d: external }),
  );

type CardProps = Children & {
  color?: string;
  to?: string;
  target?: string;
  external?: string | boolean;
  label?: string;
  icon?: IconData;
};

/** `::card` for `@comark/react`. */
export function Card({
  color = "primary",
  to,
  target,
  external: opens,
  label,
  icon,
  children,
}: CardProps) {
  useEffect(addStyles, []);
  return createElement(
    "div",
    { className: "ccr", "data-color": color },
    to
      ? createElement("a", {
          className: "ccr-link",
          href: to,
          target: target || undefined,
          rel: rel(target),
          "aria-label": label,
        })
      : null,
    icon?.src ? createElement(Icon, icon) : null,
    opens ? arrow() : null,
    children,
  );
}

/** A card's title for `@comark/react`. */
export function CardTitle({ children }: Children) {
  return createElement("p", { className: "ccr-title" }, children);
}

/** `::card-group` for `@comark/react`. */
export function CardGroup({ children }: Children) {
  useEffect(addStyles, []);
  return createElement("div", { className: "ccr-group" }, children);
}

/** `::columns` for `@comark/react`. */
export function Columns({ cols = "2", children }: Children & { cols?: string | number }) {
  useEffect(addStyles, []);
  return createElement("div", { className: "ccr-columns", "data-cols": String(cols) }, children);
}

/** Each cell of a `::columns` for `@comark/react`. */
export function Column({ children }: Children) {
  return createElement("div", { className: "ccr-column" }, children);
}

/** Pass these as `components` to `@comark/react`. */
export const components = { Card, CardTitle, CardGroup, Columns, Column };
