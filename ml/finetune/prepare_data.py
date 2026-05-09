"""
Build DPO training pairs from two sources:

Source 1 — Live preference data (Phase 2+):
  Query ai_interactions WHERE feedback IS NOT NULL.
  chosen = response with feedback=1, rejected = response with feedback=-1.

Source 2 — Synthetic pairs from canonical solutions (available from day 1):
  For each problem's canonicalSolutions + editorial.commonMistakes:
    - Each commonMistake describes a bug pattern → use it to produce a buggy variant
      and a correct grounded explanation as the chosen response.
    - rejected = vague/hallucinated explanation that ignores the actual bug.
  Gives unlimited training data from a small curated problem set.
"""
from __future__ import annotations

import json
from pathlib import Path

PROBLEMS_DIR = Path(__file__).parent.parent.parent / "data" / "problems"


def load_problems() -> list[dict]:
    return [
        json.loads(p.read_text())
        for p in PROBLEMS_DIR.glob("*.json")
        if p.name != "schema.json"
    ]


def extract_live_dpo_pairs(db_url: str) -> list[dict]:
    """Pull (prompt, chosen, rejected) from ai_interactions table."""
    # TODO: query pairs where both +1 and -1 responses exist for the same prompt
    return []


def generate_synthetic_pairs(problems: list[dict]) -> list[dict]:
    """
    Each problem's canonicalSolutions + editorial.commonMistakes becomes a template.
    The LLM generation step (TODO) fills in chosen/rejected from these templates.
    """
    pairs = []
    for problem in problems:
        editorial = problem.get("editorial", {})
        canonical = problem.get("canonicalSolutions", [])
        if not canonical or not editorial:
            continue

        for mistake in editorial.get("commonMistakes", []):
            pairs.append({
                "problem_id": problem["id"],
                "bug_description": mistake,
                "canonical_code": canonical[0]["code"],
                "canonical_language": canonical[0]["language"],
                "editorial_explanation": editorial["explanation"],
                "key_insight": editorial["keyInsight"],
                # TODO: generate via LLM — chosen = grounded explanation, rejected = hallucinated
                "chosen": None,
                "rejected": None,
            })

    return pairs


if __name__ == "__main__":
    import sys

    problems = load_problems()
    synthetic = generate_synthetic_pairs(problems)
    print(f"Generated {len(synthetic)} synthetic pair templates from {len(problems)} problems")

    if len(sys.argv) > 1:
        live = extract_live_dpo_pairs(sys.argv[1])
        print(f"Loaded {len(live)} live preference pairs from DB")
