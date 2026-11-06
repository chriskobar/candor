# One real wrong answer: Candor called ordinary UI "AI"

Evidence pack for portfolio Section 3. Every result here was produced by the
real `/api/audit` route (`claude-sonnet-4-6`) on November 5, 2026, between
15:16 and 15:33 EST. The Markdown in `exports/` was produced by the app's own
Markdown export code, and the screenshots are of the app's own results page.

**Every run is saved.** `runs/` holds the raw output of all 16 audits (13 deep,
3 standard). `runs/manifest.json` records each one's completion time, HTTP
status, response time, prompt version and input-image hash. `prompts/` holds
the exact text of each prompt version. `runs/run.sh` is the script that sent
the requests. `runs/analyze.py` recomputes the run log below from the saved
files:

```bash
python3 evidence/ai-surface-check/runs/analyze.py
```

## The design audited

`screenshots/input-airbnb.png`: an Airbnb listing page (Carolina, Puerto Rico
condo), run in **Deep critique** mode with no context or stated intent.

## What Candor said that was wrong

Deep mode scores two AI dimensions: *AI transparency & trust* and *AI control
& agency*. The screen has no visible AI feature. Nothing on it is labelled AI,
there's no sparkle icon or chat box, and no copy says a model produced anything.
Candor decided there was AI anyway and stated it as fact:

> "Two AI-driven signals are visible on this page: the dynamic pricing nudge
> ('These dates are priced lower than usual') and the 'Guest Favorite'
> algorithmic designation … The pricing signal in particular is a non-factual,
> model-generated interpretation presented as an objective statement."
> (`exports/before-v0-original-prompt.md`)

How "lower than usual" is computed isn't visible on the page. Candor invented a
mechanism, graded the page down for not disclosing it (AI trust **6.2**, AI
control **6.0**), and made it a headline of the Designer's Read: *"The areas
that genuinely need attention are the AI transparency around dynamic pricing
signals…"* So the tool broke the same rule it was enforcing, `[Fact vs.
non-fact]`: it presented an inference about the system as an observed fact.

It wasn't a one-off. All 3 runs on the original prompt did it, with 6 to 10
"AI / model / algorithmic" claims per run (see the run log).

![Before: AI dimension cards](screenshots/before-ai-cards.png)

## Why it happened

Deep mode *always* scores the AI dimensions. For non-AI screens the prompt
only said one thing: "If the design is not AI-powered, assess how well its
structure supports users who are working alongside AI tools". It never asked
the model to *establish* whether AI was present, never said what counts as
evidence, and gave it no way to answer "none". With an AI rubric to fill in,
the model found AI to fill it with.

## What I changed (`prompt-change.diff`)

| Layer | Change |
|---|---|
| **Guardrail** (system prompt) | A grounding rule for all modes: critique what's visible, describe icons literally, and label any guess about how something is computed as inference. Never score a design down for a mechanism you can't see. |
| **Guidance** (deep addendum) | An *AI surface check* before dimensions 9–10. Only on-screen cues count: labels like "AI" or "generated", sparkle icons, chat inputs, attribution copy. Prices, badges, ratings and rankings are explicitly *not* evidence. If no AI is found, the dimensions are scored on system transparency and control instead. |
| **Schema** | A new required field, placed before `dimensions` so the model commits to it before scoring: `aiSurface: { detected: boolean, evidence: string[] }`, where `evidence` must quote the visible elements. |
| **Interface** | The results page and Markdown export show the verdict above the cards: *"No AI features visible · AI dimensions scored on system transparency and control"*, or *"AI features detected: …"* with the quoted evidence. A reader can check the claim against the screenshot. |

### Iteration 2: the first fix was only partly followed

v1 cut the false claims from 6–10 per run to 0–2, but in 3 of 3 runs the model still tagged its
points with the AI heuristic labels (`[Fact vs. non-fact]` …), and one run
still said "algorithmically derived". The cause was a conflicting instruction
in the *user* prompt, "Begin each point with the heuristic name in square
brackets", which is closer to the output and more specific than the
system-prompt rule, so it won. v2 put an explicit `IF aiSurface.detected IS
FALSE / TRUE` branch inside that same note. All 3 runs on v2 complied.

v2 had one cosmetic issue: the model put the "No AI features are visible…"
opener on the suggestions as well as the findings. **v2.1** (the committed
version) limits it to the finding; nothing else changed (6 lines, see
`prompts/`). The single Airbnb run on v2.1 also complied, which is the "after"
export below.

## What it said after

> "No AI features are visible on this screen. The 'lower than usual' price
> badge and the 'Guest favorite' designation are system-generated signals; how
> they are computed is not disclosed on this surface. The price comparison
> badge provides no reference period or methodology, making it difficult for
> users to assess its validity." (`exports/after-v2.1-committed-prompt.md`)

The useful critique survived: the badge still doesn't say what it's compared
against. The invented mechanism is gone. Scores moved to 7.0 / 7.2, and the
Designer's Read now leads with the real issues (booking-card price breakdown,
the odd search field).

![After: AI dimension cards](screenshots/after-ai-cards.png)

## Control: did the fix just switch AI critique off?

To check, I built `screenshots/input-control.png` (source:
`raw/control-screen.html`): the same kind of listing page with one change, a
clearly labelled "✦ AI summary" of reviews, a "Generated by AI · May contain
mistakes" line, and an "Ask about this home" box. Candor detected it in 3 of 3
runs (two on v2, one on v2.1). Each time it quoted those same on-screen cues
as evidence: as three items in the v2 runs (sparkle icon and "AI summary"
label together), and as four in the v2.1 run (icon and label separately). It
gave the full heuristic critique, including a sharp catch in the second v2
run: the summary mixes guest opinions with what read as objective facts
("elevator speed, kitchen size") without telling them apart.

![Control: AI dimension cards](screenshots/control-ai-cards.png)

## Run log (deep critique, all 13 runs)

Generated by `runs/analyze.py`. "Claims" counts phrases asserting how a
feature is computed (algorithmic, AI-generated, model output, …) in the two AI
dimensions. It isn't counted on the control screen, where the AI is real.
"Brackets" counts points tagged with AI sub-heuristic labels, which is correct
only on the control. "Leaf" means the run called the price-tag icon a leaf.

| Prompt | Screen | Time | aiSurface.detected | Evidence items | AI trust | AI control | Claims | Brackets | AI in Designer's Read | Leaf |
|---|---|---|---|---|---|---|---|---|---|---|
| v0 original | Airbnb | 15:17 | — | — | 6.2 | 6.0 | 10 | 7 | yes | no |
| v0 original | Airbnb | 15:19 | — | — | 6.5 | 6.0 | 6 | 9 | no | yes |
| v0 original | Airbnb | 15:19 | — | — | 7.0 | 7.2 | 10 | 7 | no | yes |
| v1 surface check | Airbnb | 15:25 | false | 0 | 7.0 | 7.2 | 0 | 6 | no | yes |
| v1 surface check | Airbnb | 15:25 | false | 0 | 7.0 | 7.0 | 2 | 7 | no | yes |
| v1 surface check | Airbnb | 15:25 | false | 0 | 7.0 | 7.2 | 0 | 6 | no | yes |
| v2 conditional | Airbnb | 15:27 | false | 0 | 7.0 | 7.2 | 0 | 0 | no | no |
| v2 conditional | Airbnb | 15:26 | false | 0 | 7.0 | 7.2 | 0 | 0 | no | yes |
| v2 conditional | Airbnb | 15:27 | false | 0 | 7.0 | 7.2 | 0 | 0 | no | yes |
| v2 conditional | Control | 15:30 | **true** | 3 | 7.3 | 6.1 | n/a | 9 | yes | no |
| v2 conditional | Control | 15:29 | **true** | 3 | 7.9 | 6.8 | n/a | 8 | yes | no |
| v2.1 committed | Airbnb | 15:32 | false | 0 | 7.0 | 7.2 | 0 | 0 | no | no |
| v2.1 committed | Control | 15:32 | **true** | 4 | 7.8 | 6.2 | n/a | 8 | yes | no |

The three standard-mode runs (two on v0, one on v1) aren't in this table
because standard mode has no AI dimensions; they're saved in `runs/` and count
toward the leaf result below.

Score alone doesn't catch the defect. The third v0 run scored 7.0 / 7.2, the
same as the fixed prompt, while still making 10 false claims about how the
page works. You have to read the text to grade it.

## What the prompt didn't fix (worth saying)

The price badge's icon is a **green price tag**. Candor calls it a **"green
leaf"** in 9 of the 13 Airbnb runs (7 of 10 deep, 2 of 3 standard), before
*and* after the fix, and builds on the misread:
*"subconsciously signals value and eco-consciousness"*. In one run (v1, run 2)
it even recommends replacing the leaf with *"a price-tag or downward-trend
icon"*. The grounding rule
("if you cannot identify an icon with confidence, say so") doesn't help,
because the model isn't unsure. It's confidently wrong. This is a perception
limit, not an instruction problem. Fixing it means changing other layers:
higher-resolution input or crops for small UI elements, a stronger vision
model, or an interface that lets the designer mark a finding as wrong and
rerun with that correction as context.
