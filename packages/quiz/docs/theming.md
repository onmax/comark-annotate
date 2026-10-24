---
title: Theming
description: The shared tokens, the quiz's own colors, and the slots and states a page can target.
---

Every block is a card in the style of shadcn/ui's Card, with options like its RadioGroup, so it follows the shared tokens in [Theming](/guide/theming/) and turns dark with them. Color comes only from state: the primary color for a selection, green for right, red for wrong, and a fill for results. The rules sit in a `comark` CSS layer, so any plain rule of your own wins.

## Shared tokens

| Token | Used for |
| --- | --- |
| `--comark-background` | The options and outline buttons |
| `--comark-foreground` | Text, and the primary color when the page has none |
| `--comark-muted` | The number, reasons, hints, and the counts |
| `--comark-border` | The card, the options, and the line over the explanation |
| `--comark-accent` | Hovered options and buttons, and a pressed grade |
| `--comark-ring` | Focus rings |
| `--comark-radius` | Corners: the card's a little rounder, the options' a little less |
| `--comark-font` | All of it |

## Variables

Set these on `.cqz` or any ancestor, such as `:root`:

| Variable | Default | Used for |
| --- | --- | --- |
| `--cqz-primary` | Nuxt UI's `--ui-primary`, else shadcn/ui's `--primary`, else `--comark-foreground` | A selected option, the Check button, a poll vote |
| `--cqz-primary-foreground` | `--primary-foreground`, else `--comark-background` | Text on the Check button, and a checked box's tick |
| `--cqz-correct` | `--ui-success`, else `--success`, else `oklch(0.62 0.14 155)` | A right option's icon, border, and tint, and the "Correct" verdict |
| `--cqz-incorrect` | `--ui-error`, else `--destructive`, else shadcn/ui's red | A wrong pick's icon, border, and tint, and the "Not quite" verdict |
| `--cqz-bar` | `--comark-foreground` at 6% | Each option's share of the results |
| `--cqz-bar-strong` | The primary color at 14% | A poll's leading option and the reader's vote |
| `--cqz-surface` | `--comark-foreground` at 2% over `--comark-background` | The card |

A state's color always comes with an icon, a border, and a tint of 8%, and the status line under the options says the verdict in words, so color never carries it alone.

## Slots and states

Every part has a `data-slot`, and the block and each option a `data-state`:

| Selector | Is |
| --- | --- |
| `[data-slot="root"]` | The block, `.cqz`, with `data-quiz-id`, `data-quiz-kind` (`question`, `poll`, or `recall`), `data-state`, and `data-results` once results show |
| `[data-slot="number"]`, `[data-slot="prompt"]` | The number and the prompt |
| `[data-slot="options"]` | The `fieldset` of options |
| `[data-slot="option"]` | Each option, with `data-key`, `data-state`, `data-correct` on a question's right ones, and `data-leading` on a poll's most chosen |
| `[data-slot="indicator"]` | The radio or checkbox, and the icon that replaces it once answered |
| `[data-slot="label"]`, `[data-slot="rationale"]` | An option's text and its reason |
| `[data-slot="verdict"]`, `[data-slot="percent"]`, `[data-slot="bar"]` | An option's label ("Your answer" or "Correct answer"), percent, and fill |
| `[data-slot="actions"]`, `[data-slot="status"]` | The buttons, and the status line: the verdict and the count of answers, read out after each check |
| `[data-slot="hint"]`, `[data-slot="explain"]`, `[data-slot="answer"]` | The slots |
| `[data-slot="footer"]`, `[data-slot="total"]`, `[data-slot="notice"]` | A poll's footer: the count of votes and the host's notice |
| `[data-slot="reveal"]` | A recall card's answer, blurred until it's shown |

| `data-state` | On |
| --- | --- |
| `idle`, `selected` | A block or option before a check |
| `correct`, `incorrect` | A block after a check, and each checked option |
| `revealed` | A question after Show answer, its right options the reader didn't pick, and a recall card once shown |
| `voted`, `closed` | A poll after a vote or once voting closes, and the reader's options |

Buttons carry `data-variant` (`default`, `outline`, `ghost`, or `link`) and `data-action`. `<html>` gets `data-quiz-ready` once the script runs.

A recall card also gets `data-grade` (`knew` or `missed`) once the reader grades it.

Only one kind of declaration uses `!important`: the first and last blocks of the prompt, an option, a reason, the hint, the explanation, and the answer drop their top and bottom margins. A page's paragraph margins are almost always plain rules, which beat the layer, and would push the text off the card's edges.

## Example

A brand color for selections and the Check button, and calmer results:

```css
:root {
  --cqz-primary: oklch(0.55 0.2 260);
  --cqz-bar-strong: oklch(0.55 0.2 260 / 0.12);
}
```
