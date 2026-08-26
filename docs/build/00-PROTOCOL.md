# Agent protocol

The operating manual for every session on this build. Read **§1 The Loop** in full. The rest is
reference — consult a section when you reach it, don't read it all up front.

---

## §1 The Loop

Every session, without exception:

```
 1  ORIENT     Read STATE.md → HANDOFF.md → your phase brief → your Reading Map.
 2  CLAIM      Set STATE to in-progress. Create/checkout the phase branch.
 3  PLAN       Write your task plan into the phase record. Confirm acceptance criteria.
 4  BUILD      One task at a time. Commit each completed task.
 5  VERIFY     npm run verify. Fix. Re-run. Repeat until green.
 6  REVIEW     Self-review pass against §6. Fix what you find.
 7  DOCUMENT   Update STATE, HANDOFF, phase record, DECISIONS, ISSUES.
 8  HAND OFF   Final commit. Merge if the phase is complete. Write the next brief.
```

**You may stop at any point** — mid-task, mid-phase. What you may not do is stop without
completing step 7. A session that ends with stale docs has actively damaged the build.

**A session may run several phases.** The Loop is *per phase*, not per session: finish step 8 for
one phase and begin step 1 of the next. `STATE.md`'s scope block says how many phases the current
session is expected to cover. Running four phases does not license running one Loop across four
phases — the per-phase verify and self-review are exactly what stops a long run accumulating
debt, and they get *more* important as the run gets longer, not less.

---

## §2 Orientation — context derivation

You start cold every session. This is how you get to competent without burning your budget.

### The reading order

| # | Read | Why | Skip if |
|---|---|---|---|
| 1 | `CLAUDE.md` | auto-loaded; non-negotiables | never |
| 2 | `docs/build/STATE.md` | where the build actually is | never |
| 3 | `docs/build/HANDOFF.md` | what the last agent left you | never |
| 4 | `docs/build/00-PROTOCOL.md` §1 | this loop | never |
| 5 | Your phase's section in `docs/build/01-PHASES.md` | scope, tasks, acceptance criteria, **Reading Map** | never |
| 6 | The spec sections your Reading Map names | the only spec you should read | never |
| 7 | `docs/build/ISSUES.md` | open problems that may touch your work | never |
| 8 | `docs/build/DECISIONS.md` | only entries tagged for your phase | if none tagged |

**Then stop reading and start working.**

### 9 · Check the extract before you measure anything

`docs/research/03-tonik-extract.md` is tonik's design system read off their **live DOM** — the
container system, the type scale as rendered, the colour set, the transition vocabulary, the
section rhythm, and the hero element by element. Regenerate or extend it with:

```bash
npm run extract:tonik                       # firefox, the default
node tools/extract/tonik.mjs --chromium     # the cross-engine diff
```

> **A capture shows where an element is. It never shows the rule that put it there.**

Phase 2 learned this expensively: a session of correcting the hero by eye against a screenshot,
one number at a time — the foot rail 29px high, the copy column 57px left, the play control
0.2rem out — when every one of those values was in `getComputedStyle` the whole time. The rule
behind all of them was a single `max-width: 80rem` on `.container-large`, and no amount of looking
at a picture would ever have shown it. See D-016 and I-030.

So, in order:

1. **Look in the extract.** If your component's numbers are there, use them.
2. **If they are not, extend `tools/extract/tonik.mjs`** — it takes a selector list, and the
   marginal cost of one more component is a line. Then commit the regenerated extract.
3. **Only then** open a screenshot, and only for composition — where things sit relative to each
   other, which is the one thing a capture is genuinely better at.

**What the extract does and does not collect.** Measurements and structure — the same class of
thing `docs/spec/` is built from. Not their copy, their imagery, their Spline scene or their
logo: those are theirs, ours are ours, and CLAUDE.md's line holds. It is also the cheaper path,
because a layout tuned to their string lengths has to be re-tuned to ours anyway.

### The rule that matters

> **Read the Reading Map, not the spec.** `docs/spec/` is ~2,500 lines. Your phase needs
> 200–500 of them. Every extra line you read is context you cannot spend on the work.

If you genuinely need a section outside your map, read it — then **add it to that phase's
Reading Map** in `01-PHASES.md` so the next agent doesn't have to rediscover it.

### Verify your orientation before building

Answer these to yourself. If you cannot, you are not oriented:

- What phase am I on, and what are its exact acceptance criteria?
- What did the last agent leave unfinished or warn me about?
- Which spec sections govern my work, and have I read them?
- Are there open issues touching my components?
- What does "done" look like, in evidence, not in feeling?

---

## §3 Claiming work

```bash
git checkout main && git pull
git checkout -b phase/04-works-grid        # branch name from 01-PHASES.md
```

Then set the phase status in `STATE.md` to `🔨 in-progress`, stamp the date and the session, and
commit that immediately:

```bash
git commit -am "chore(state): claim phase 04"
```

This is how a future agent knows work is underway rather than abandoned.

**If STATE says a phase is already in-progress** and the handoff shows it was left mid-flight:
you are resuming, not starting. Read the phase record's task table, pick up the first task not
marked done, and continue. Do not restart completed tasks.

---

## §4 Building

### Task granularity

Tasks are defined in the phase brief. Each is 1–3 commits. Work strictly in order unless the
brief marks tasks as parallel-safe.

### Commit conventions

```
feat(loader): page-enter timeline with IX2 easing
fix(works): sibling dim was targeting all cards including self
chore(verify): add motion assertion for accordion open
docs(state): mark T4.3 complete
refactor(tokens): collapse duplicate fluid-root media query
```

Scope = the component or area. One logical change per commit. Reference the task id in the body
when useful (`T4.3`).

**Commit each task as you complete it.** Not at the end of the phase. If your session dies, the
work survives and `git log` tells the next agent exactly how far you got.

### When the spec is ambiguous or wrong

Do **not** guess and move on. In order:

1. Check `docs/research/` — the teardown often has the detail the spec compressed.
2. Check `docs/research/source/` — if the local recovered files are present, the answer is
   probably in `tonik-ix2.json` or `tonik-animations.js`. Use the decoders.
3. Re-measure against the live site with Playwright MCP (see §8).
4. Still unresolved → log in `ISSUES.md`, implement the **most conservative** reading, mark the
   task `⚠️ done-with-caveat`, and state it plainly in your handoff.

Never silently change a specced value. If you believe a value is wrong, log the evidence in
`ISSUES.md` and leave the spec value in place — a human decides.

### When you're blocked

Set the task to `🚧 blocked` in the phase record with a one-line reason and what would unblock
it. Move to the next parallel-safe task if there is one. If nothing can proceed, complete step 7
and hand off with a `BLOCKED` banner at the top of `HANDOFF.md`.

---

## §5 Verification — the gate

```bash
npm run verify
```

Four checks, all must pass. Details in `02-VERIFICATION.md`.

| Check | Proves |
|---|---|
| `verify:tokens` | computed styles match the token table exactly |
| `verify:motion` | GSAP timelines have the specced durations, eases, staggers |
| `verify:visual` | our build vs tonik at matched viewports and scroll positions |
| `verify:budget` | bundle size and Lighthouse within `60-architecture-and-build.md` §5 |

The run writes `tools/verify/output/report.md`. **Commit that report** — it is the evidence
that the phase passed, and the next agent reads it.

`verify:visual` produces a contact sheet requiring human-ish judgment. You are expected to
actually look at it, not just note that it ran. Differences that are intentional (our content,
our brand) are fine. Differences in layout, spacing, type scale or motion are bugs.

---

## §6 Self-review — before you hand off

Run this pass deliberately. It is not optional, and it is not the same as `npm run verify`.

**Correctness**
- [ ] Every value I typed matches the spec — durations, eases, hex, rem. Spot-check five at random against `docs/spec/`.
- [ ] Reverses use `timeScale(1.2)` (panels) or `1.5` (buttons).
- [ ] Every hover/parallax/reveal is inside `gsap.matchMedia('(min-width: 992px)')`.
- [ ] No second `requestAnimationFrame` loop. No `Matter.Runner`.
- [ ] `prefers-reduced-motion` path exists and was tested by actually toggling it.

**Cleanup**
- [ ] No commented-out code, no `console.log`, no `TODO` I didn't log in `ISSUES.md`.
- [ ] No orphaned files from experiments.
- [ ] Every GSAP context uses `useGSAP` with a scope, so it reverts on unmount.
- [ ] No duplicated logic that belongs in `lib/` or a shared component.

**Honesty**
- [ ] Every task marked done has evidence — a report line, a screenshot, a file.
- [ ] Anything I skipped, faked, stubbed or half-did is written in `HANDOFF.md` under
      **Known gaps**. This is the single most important line in the protocol.

> An agent that hides a shortcut costs the next agent hours. An agent that writes
> "the culture collage positions are placeholder, needs real composition" costs them nothing.

**Then fix what you found.** Do not hand off a list of things you noticed and left.

---

## §7 Documenting — the handoff contract

Four files. All four, every session.

### `STATE.md` — where the build is
Update the phase table and the task checklist. This is the file the next agent reads first, so
it must be true. Include: current phase, task-level status, what's verified, what's not.

### `HANDOFF.md` — a letter to the next agent
Overwrite it entirely. See the template at the bottom of that file. It must contain:
- What you did, in one paragraph
- **Known gaps** — everything imperfect, stubbed, or skipped
- Exactly what the next agent should do first
- Anything surprising you learned that isn't in the specs
- Any command, path or credential they'll need

### `phases/PHASE-XX.md` — the permanent record
Created by **you**, at step 3, by copying `templates/PHASE-RECORD.md`. (If it already exists,
a previous session started this phase — you are resuming it, so continue that record rather than
starting a new one.)

Holds your plan, your task table with final statuses, decisions, evidence links, the harness
assertions you added, and the verification state at completion. This is history; it is never
overwritten. The **brief** lives in `01-PHASES.md`; the **record** lives here.

### `DECISIONS.md` and `ISSUES.md`
Append-only. Every technical decision you made that a future agent could reasonably question,
and every problem you found and didn't fully solve.

---

## §8 Tools — what to use for what

| Job | Tool | Notes |
|---|---|---|
| Read/edit code | `Read`, `Edit`, `Write`, `Glob`, `Grep` | prefer over shell equivalents |
| Run things | `Bash` (git bash) or `PowerShell` | prefer `npm run` scripts so shell doesn't matter |
| **Drive our dev server** | `mcp__playwright__*` | screenshots, scroll, hover, computed styles |
| **Re-measure tonik** | `mcp__playwright__*` | when a spec value needs re-verification |
| Read tonik's IX2 data | `Webflow.require('ix2').store.getState().ixData` via `browser_evaluate` | see `docs/research/source/README.md` |
| Perf / Lighthouse | `mcp__chrome-devtools__lighthouse_audit`, `performance_start_trace` | for `verify:budget` and phase 12 |
| Console / network debugging | `mcp__chrome-devtools__list_console_messages`, `list_network_requests` | |
| Look up a library API | `WebFetch` on the official docs | do not rely on recall for API defaults — **verify** |
| Find a technique | `WebSearch` | |
| 3D asset pipeline (phase 2) | `mint-threejs-skills` skill | invoke via `Skill` if the aperture needs asset work |
| Reviewing your own diff | `/code-review` skill | optional, useful before a gate phase |

### Verifying against the live tonik site

This is a first-class move, not a fallback. When a value is disputed:

```js
// computed style check
mcp__playwright__browser_evaluate({ function: `() => getComputedStyle(
  document.querySelector('.navbar_link')).backgroundColor` })

// IX2 action list
mcp__playwright__browser_evaluate({ function: `() => Webflow.require('ix2')
  .store.getState().ixData.actionLists['a-23']` })
```

### Subagents

Allowed, and useful, for **isolated read-heavy work that would pollute your context**:

- a screenshot sweep across many viewports
- searching the specs for every mention of a pattern
- an independent audit of your own work

Rules:
- Spawn at most 2 per session. Each starts cold and costs real budget.
- Never delegate the *building* — you own the code.
- Give the subagent a self-contained prompt: it cannot see your conversation.
- Relay what matters into your handoff; the user never sees the subagent's report.

Prompt template:

```
Repo: D:/Projects/NoFilterPortfolio  (Next.js, dev server: npm run dev on :3000)
Context: read docs/build/STATE.md and docs/spec/<the one file you need>.
Task: <one precise, verifiable task>
Return: <exact shape of the answer you need — a list, a table, a yes/no with evidence>
Do not modify any files.
```

---

## §9 Git

| | |
|---|---|
| Default branch | `main` |
| Phase branch | `phase/NN-slug`, e.g. `phase/04-works-grid` |
| Merge | `git checkout main && git merge --no-ff phase/NN-slug` |
| Tag on completion | `git tag phase-NN-complete && git push --tags` |
| Push | after each phase merge, and any time you end a session |

**`git tag -l` is the machine-readable progress trail.** A fresh agent can run it and know
exactly how far the build has come, even if the docs lie.

### Identity — do not touch it

**Never set `git config user.name` or `user.email` in this repo.** The machine's global config
is already correct:

```
Sayandeep1013 <saaiyaan1013@gmail.com>
```

GitHub attributes a commit by matching its **email** to an account. The email in your session
context (`xetalabsindia@gmail.com`) is the user's *Claude* account, **not** their GitHub
identity — it resolves to a different GitHub user entirely. Setting it locally misattributes
every commit.

This already happened once, in the first commit of this repo. Don't repeat it.
If you ever need to check: `git config user.email` should print `saaiyaan1013@gmail.com`.

Never force-push. Never rewrite published history. Never commit `.env` or anything from
`docs/research/source/` that is gitignored — those are tonik's assets and this repo is public.

---

## §10 Anti-patterns

The specific ways this build will go wrong:

| Anti-pattern | Why it happens | Guard |
|---|---|---|
| **Declaring done without evidence** | the code looks right | §6 honesty checklist; commit the verify report |
| **Reading all the specs** | feels thorough | Reading Maps; budget discipline |
| **Silently "improving" a value** | `.7s` feels slow | values are measured; log in ISSUES instead |
| **Rebuilding what exists** | didn't read STATE | §2 orientation; `git log` |
| **Leaving docs stale** | ran out of context | step 7 is mandatory; do it before you're empty |
| **Bolding a heading** | habit | display face is always 400 |
| **Hover outside matchMedia** | works on your screen | §6 correctness checklist |
| **A second rAF loop** | it's what the library docs show | one GSAP ticker, always |
| **Guessing a library default** | recall feels certain | `WebFetch` the docs, or verify in a live runtime |
| **Hiding a shortcut** | it's embarrassing | it's much worse to discover later |

---

## §11 Escalation to the user

Ask the user (`Sayandeep`) when — and only when — the decision is **not technical**:

- content, copy, brand, or scope
- anything that changes what the site *claims* (e.g. presenting work as client work)
- the two gate phases (2 and 6) — stop and show, don't push through
- a spec value that appears wrong and would be expensive to redo

Everything technical is yours. Decide, log it in `DECISIONS.md`, move on.

When you do ask: batch the questions, give a recommendation first, and keep working on
everything that doesn't depend on the answer.
