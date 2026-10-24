---
title: Syntax
description: Markers, comments, and the list of notes.
---

## Markers

End a line with a comment that holds its note's number in angle brackets:

````md
```ts
const res = await fetch(url) // <1>
```

1. The note for that line.
````

The comment goes away and a numbered marker takes its place. A comment with words before the marker keeps the words: `// retry once <2>` shows `// retry once` and marker 2. A line can carry several markers, such as `// <1> <2>`, and two lines can share a number.

| Comment | Languages |
| --- | --- |
| `// <1>` | JavaScript, TypeScript, Go, Rust, C, Java, Swift, Kotlin |
| `# <1>` | Python, Ruby, shell, YAML, TOML |
| `-- <1>` | SQL, Lua, Haskell |
| `; <1>` and `% <1>` | Lisp, INI, assembly, LaTeX, Erlang |
| `/* <1> */` and `<!-- <1> -->` | CSS, HTML, XML, Vue |

The plugin accepts any of these in any fence, so pick the one that keeps your code valid.

## Notes

The numbered list right after the fence holds the notes: item 1 is note 1. Each note starts with its marker, which links back to the line, and each marker in the code links to its note. A list that starts at another number, such as `3.`, numbers its notes from there.

Without a numbered list right after it, a fence keeps its markers as written. A ` ```md ` fence is never changed, since the markers in it belong to the fences it shows.

## Issues

The plugin adds every problem to `meta.issues`, as [Validation](/guide/validation/) describes: a fence with markers but no list after it, a marker with no note, a note with no marker, and `shiki` running after the plugin. Each issue names its fence and says how to fix it, and each has its own rule in [Doctor](/doctor/):

```txt
The ```ts fence 2: marker <3> has no note, since the list after it has 2 items. Add its note, or remove the marker.
The ```py fence 1 has markers like `<1>` but no numbered list right after it, so they stay in the code. Write the notes as a numbered list right after the fence.
```
