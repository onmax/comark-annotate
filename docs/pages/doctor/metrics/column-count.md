A `::stats` table has three columns: a name, the value before, and the value after. A table with more or fewer columns is shown without a change column, and a row with more or fewer cells has no change. Move other columns to a table of their own.

::incorrect
```md
::stats
| Metric | Before | After | Owner |
| --- | --- | --- | --- |
| Deploy time | 4.2 min | 3.1 min | Duck team |
::
```
::

::correct
```md
::stats
| Metric | Before | After |
| --- | --- | --- |
| Deploy time | 4.2 min | 3.1 min |
::
```
::
