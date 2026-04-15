# Insight 02 — Make Interactive Controls Truthful

## Core Rule

Every clickable control should have a verified, observable effect that matches its label.

If a control can be clicked but the system state does not change as promised, the product feels unreliable immediately.

## What The Current Codebase Already Does Well

- the UI already exposes many purposeful controls instead of hiding all actions behind forms
- progress feedback in the workflow area is explicit
- state is typed, which makes contract mismatches easier to diagnose

## Methodology Lens

- `Nielsen Norman Group: Visibility of system status`
- `Nielsen Norman Group: Match between system and the real world`
- `Nielsen Norman Group: Error prevention`
- `WCAG semantics`
  - stateful controls should expose their state to more than just color and layout

## How This Lens Exposed Problems Here

This review found several "promise gaps":

- status filter label suggests narrowing, but query naming breaks the behavior
- sort chips suggest immediate reordering, but the list may stay stale
- auth badges suggest admin capability, but session access is inconsistent
- filter chips look like segmented controls, but semantics are too weak

Each one is the same class of problem: the UI is making a claim that the implementation does not fully honor.

## Guidance For Future Work

- for every new control, define:
- what user belief the label creates
- what observable state change proves it worked
- what automated test confirms the promise
- if a control is stateful, expose that state semantically as well as visually

## Simple Example

Bad:

- button says `Newest`
- list order does not change until another filter happens to trigger a reload

Better:

- clicking `Newest` immediately reorders the visible list
- active sort state is announced visually and semantically
- a UI test confirms the first visible card changes after the click

## Design Smell To Watch For

"The control is wired up, but we still need to make the result actually visible."

That means the interaction is not done yet.
