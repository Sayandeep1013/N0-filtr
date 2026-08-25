# The build system

A 13-phase, multi-session build run by agents working one after another. This folder is the
machinery that keeps them coherent.

## The files

| File | Kind | Read when |
|---|---|---|
| `STATE.md` | **live** | first, every session |
| `HANDOFF.md` | **live** | second, every session — overwritten each session |
| `00-PROTOCOL.md` | reference | §1 every session; rest on demand |
| `01-PHASES.md` | reference | your phase's section, every session |
| `02-VERIFICATION.md` | reference | phase 0 in full; later when extending the harness |
| `DECISIONS.md` | append-only | entries tagged for your phase |
| `ISSUES.md` | append-only | every session — check for anything touching your work |
| `phases/PHASE-NN.md` | permanent | created by you, from `templates/PHASE-RECORD.md` |

## The idea

Three problems break a build like this, and each file exists to solve one:

| Problem | Solution |
|---|---|
| An agent doesn't know where things stand | `STATE.md` — true at all times, updated as you go |
| An agent doesn't know what the last one left behind | `HANDOFF.md` — a letter, with a mandatory *Known gaps* section |
| An agent says "done" when it isn't | `npm run verify` — a committed report, not an assertion |

Plus a fourth, quieter one: **context exhaustion**. The specs are ~2,500 lines and no session
should read them all. Every phase has a **Reading Map** naming the 200–500 lines it actually
needs.

## The loop, in one line

`Orient → Claim → Plan → Build → Verify → Review → Document → Hand off`

Full version in `00-PROTOCOL.md` §1.

## How to check progress without reading anything

```bash
git tag -l              # phase-00-complete, phase-01-complete, ...
git log --oneline -15   # what actually happened
cat docs/build/STATE.md # what we claim happened
```

If the tags and STATE disagree, **the tags are right** and STATE needs fixing.

## Starting a session

Open Claude Code in the repo root. `CLAUDE.md` loads automatically and points here. Then just:

> Read docs/build/STATE.md and HANDOFF.md and continue the build.

That is the whole prompt. The system does the rest.
