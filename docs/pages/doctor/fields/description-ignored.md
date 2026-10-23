`description` is the text a field shows when it has no content of its own. A field with content, such as a paragraph or the `:::field` blocks of an object's properties, shows that instead, so the `description` prop never reaches the reader.

::incorrect
```md
::field{name="flock" type="object" description="How the pigeons fly."}
:::field{name="size" type="number"}
How many pigeons fly together.
:::
::
```
::

::correct
```md
::field{name="flock" type="object"}
How the pigeons fly.

:::field{name="size" type="number"}
How many pigeons fly together.
:::
::
```
::
