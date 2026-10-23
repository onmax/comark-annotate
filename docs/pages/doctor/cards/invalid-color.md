A card's `color` tints its icon and a hovered link card's border. It takes one of Nuxt UI's colors: `primary`, `secondary`, `success`, `info`, `warning`, `error`, or `neutral`. Any other value, such as a CSS color, shows as primary.

::incorrect
```md
::card{title="Pond report" color="green"}
14 ducks, 3 pigeons.
::
```
::

::correct
```md
::card{title="Pond report" color="success"}
14 ducks, 3 pigeons.
::
```
::
