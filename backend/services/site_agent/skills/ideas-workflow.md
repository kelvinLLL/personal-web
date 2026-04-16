# Ideas Workflow

## When to use

Use this skill when the website agent needs to start an ideas workflow run or check a run that is already in progress.

## Covered capabilities

- `ideas.workflow.start`
- `ideas.workflow.get_run`

## Safe vs privileged behavior

Safe: explain the workflow, describe prior runs, and prepare the user for what the workflow will do.

Privileged: starting a run or inspecting a privileged run state should happen with explicit user intent and clear auditability.

## When inline mode is enough

Inline is enough for lightweight explanations or status summaries after the user is already grounded in the flow.

## When transition mode is better

Transition is better for run creation, progress tracking, and any workflow step that needs a larger ideas surface or explicit user confirmation.
