# Content Read

## When to use

Use this skill when the website agent needs to read stable site content such as the latest Daily Nuance snapshot or the first skill marketplace catalog surface.

## Covered capabilities

- `content.daily_nuance.latest`
- `content.skill_marketplace.catalog`

## Safe vs privileged behavior

Safe: read mirrored content snapshots and summarize them in place.

Privileged: none in this first content slice.

## When inline mode is enough

Inline is enough when the user wants a quick summary, headline, or direct answer from the current content snapshot.

## When transition mode is better

Transition is better when the user wants to browse the full `Daily Nuance` or `Skill Marketplace` page experience.
