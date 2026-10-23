A `#fragment` link that matches no heading id or `{#id}` in the same document. The message lists the ids it has and the closest one. Links to other documents and external links aren't checked.

::incorrect
```md
# Pigeon census

Read the [method](#methods) first.

## Method
```
::

::correct
```md
# Pigeon census

Read the [method](#method) first.

## Method
```
::
