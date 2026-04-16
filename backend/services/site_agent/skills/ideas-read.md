# Ideas Read

## When to use

Use this skill when the website agent only needs to read idea data: list ideas, inspect one idea, or check idea metadata.

## Covered capabilities

- `ideas.list`
- `ideas.get`
- `ideas.meta`

## Safe vs privileged behavior

Safe: read idea records and summarize them for the user.

Privileged: do not create, update, delete, or start workflows from this skill.

## When inline mode is enough

Inline is enough for quick filters, short summaries, and fetching one idea by id.

## When transition mode is better

Transition is better when the user wants to browse many ideas, compare multiple candidates, or continue work in the full `/ideas` page.
