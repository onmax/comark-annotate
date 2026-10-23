import type { ComarkPlugin } from "comark";
import type { ChartsOptions } from "comark-charts";
import type { ChipsOptions } from "comark-chips";
import type { CodeOptions } from "comark-code";
import type { CalloutsOptions, ReferencesOptions } from "comark-github";
import { createIcons, type IconOptions, type Icons } from "comark-icon";
import include, { type IncludeOptions } from "comark-include";
import type { TabsOptions } from "comark-tabs";
import type { ZoomOptions } from "comark-zoom";

/** `false` turns a plugin off, and an object turns it on with those options. Everything but `include` is on. */
export type PresetOptions = {
  /** Pastes files into the Markdown before the other plugins read it. Off, since it reads from disk by default. */
  include?: IncludeOptions | boolean;
  /** HTML only: Vue, React, and Svelte have no annotate components. */
  annotate?: boolean;
  badge?: boolean;
  /** Cards draw their icons with the resolver from `icon`'s options. */
  cards?: boolean;
  carousel?: boolean;
  charts?: ChartsOptions | boolean;
  /** Pass `{ download: false }` when parsing in a browser, which may not download another site's images. */
  chips?: ChipsOptions | boolean;
  code?: CodeOptions | boolean;
  /** HTML only: Vue, React, and Svelte have no diff components. */
  diff?: boolean;
  embed?: boolean;
  github?:
    | {
        callouts?: CalloutsOptions | boolean;
        references?: ReferencesOptions | boolean;
        html?: boolean;
      }
    | boolean;
  /** Also resolves the icons of cards, tabs, and code actions, so they all share its `collections` and `fetch`. */
  icon?: IconOptions | boolean;
  steps?: boolean;
  tabs?: TabsOptions | boolean;
  zoom?: ZoomOptions | boolean;
};

// oxlint-disable-next-line no-explicit-any -- each plugin types its own meta, as in Comark's ParserOptions.
export type AnyPlugin = ComarkPlugin<any, any>;
// A package's renderer entry, which exports the parse plugin as `default` beside its `components`.
type Part<C, O = void> = { default: (options?: O) => AnyPlugin; components: Record<string, C> };

/** One renderer's entry of each package, by the option that turns it on. */
export type Renderer<C> = {
  annotate?: Part<C>;
  badge: Part<C>;
  cards: Part<C, { iconResolver?: Icons }>;
  carousel: Part<C>;
  charts: Part<C, ChartsOptions>;
  chips: Part<C, ChipsOptions>;
  code: Part<C, CodeOptions>;
  diff?: Part<C>;
  embed: Part<C>;
  github: {
    callouts: (options?: CalloutsOptions) => AnyPlugin;
    references: (options?: ReferencesOptions) => AnyPlugin;
    html: () => AnyPlugin;
    components: Record<string, C>;
  };
  icon: Part<C, IconOptions | Icons>;
  steps: Part<C>;
  tabs: Part<C, TabsOptions>;
  zoom: Part<C, ZoomOptions>;
};

export type Preset<C> = { plugins: AnyPlugin[]; components: Record<string, C> };

const on = (value: unknown, fallback = true) => (value === undefined ? fallback : value !== false);
const optionsOf = <T>(value: T | boolean | undefined): T | undefined =>
  value === true || value === false ? undefined : value;

/** Builds a renderer's preset. Use the one from `@onmax/comark/html`, `/vue`, `/react`, or `/svelte`. */
export function preset<C>(renderer: Renderer<C>, options: PresetOptions = {}): Preset<C> {
  const plugins: AnyPlugin[] = [];
  const components: Record<string, C> = {};
  const add = <O>(
    part: Part<C, O> | undefined,
    value: O | boolean | undefined,
    settings = optionsOf(value),
  ) => {
    if (!part || !on(value)) return;
    plugins.push(part.default(settings));
    Object.assign(components, part.components);
  };
  const icons = createIcons(optionsOf(options.icon));

  // Include goes first, so the others read what it pastes.
  if (on(options.include, false)) plugins.push(include(optionsOf(options.include)));
  add(renderer.annotate, options.annotate);
  add(renderer.badge, options.badge);
  add(renderer.carousel, options.carousel);
  add(renderer.code, options.code, { iconResolver: icons, ...optionsOf(options.code) });
  add(renderer.charts, options.charts);
  add(renderer.chips, options.chips);
  add(renderer.diff, options.diff);
  add(renderer.embed, options.embed);
  if (on(options.github)) {
    const github = optionsOf(options.github) ?? {};
    if (on(github.callouts)) {
      plugins.push(renderer.github.callouts(optionsOf(github.callouts)));
      Object.assign(components, renderer.github.components);
    }
    if (on(github.references))
      plugins.push(renderer.github.references(optionsOf(github.references)));
    if (on(github.html)) plugins.push(renderer.github.html());
  }
  add(renderer.icon, options.icon, icons);
  add(renderer.cards, options.cards, { iconResolver: icons });
  add(renderer.steps, options.steps);
  add(renderer.tabs, options.tabs, { iconResolver: icons, ...optionsOf(options.tabs) });
  add(renderer.zoom, options.zoom);
  return { plugins, components };
}
