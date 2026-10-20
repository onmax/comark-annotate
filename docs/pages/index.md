---
title: Comark plugins
description: Plugins for Comark that make review documents easier to read.
tagline: Annotated screenshots, zoom, carousels, tabs, callouts, and embeds for Comark documents. Each plugin is its own package, and they all share one version.
---

## Plugins

::plugins
::

## Shared behavior

Zoom, carousel, and tabs are scripts that add to plain HTML: without them a page still reads top to bottom, carousels still swipe, and every tab shows under its label. With them, every zoomable item closes with Escape, Back, or a click around it, keeps focus inside the zoomed view, and returns it when the view closes. The HTML renderer inlines each script and its styles once per document; Vue, React, and Svelte components start them on mount.
