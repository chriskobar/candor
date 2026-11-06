"""Recompute the README run log from the saved run outputs.

Usage:  python3 evidence/ai-surface-check/runs/analyze.py
Reads manifest.json and every run file next to it; prints a Markdown table.
"""
import json
import pathlib
import re

HERE = pathlib.Path(__file__).parent
manifest = json.loads((HERE / "manifest.json").read_text())

# Phrases that assert how a feature is computed (the defect being measured).
MECHANISM = re.compile(
    r"algorithm\w*|AI-generated|AI-driven|model-generated|model output|"
    r"pricing model|machine learning",
    re.I,
)

rows = []
for r in manifest["runs"]:
    if r["mode"] != "deep":
        continue
    d = json.loads((HERE / r["file"]).read_text())
    ai = [x for x in d["dimensions"] if x["label"].startswith("AI")]
    surface = d.get("aiSurface")
    real_ai = r["screen"] == "control"
    rows.append({
        "prompt": r["prompt"].split("/")[1].removesuffix(".ts"),
        "screen": r["screen"],
        "time": r["completed_local_time"][11:16],
        "detected": "—" if surface is None else str(surface["detected"]).lower(),
        "evidence": "—" if surface is None else len(surface["evidence"]),
        "trust": ai[0]["score"],
        "control": ai[1]["score"],
        "claims": "n/a" if real_ai else len(MECHANISM.findall(json.dumps(ai))),
        "brackets": sum(p.startswith("[") for x in ai for p in x["points"]),
        "read_ai": "yes" if re.search(r"\bAI\b", d["designersRead"]) else "no",
        "leaf": "yes" if re.search(r"\bleaf\b", json.dumps(d), re.I) else "no",
    })

cols = ["prompt", "screen", "time", "detected", "evidence", "trust", "control",
        "claims", "brackets", "read_ai", "leaf"]
print("| " + " | ".join(cols) + " |")
print("|" + "---|" * len(cols))
for row in rows:
    print("| " + " | ".join(str(row[c]) for c in cols) + " |")
