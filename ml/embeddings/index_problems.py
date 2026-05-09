"""One-shot script to index all problems from data/problems/ into Qdrant."""
from __future__ import annotations

import json
from pathlib import Path

# TODO: implement indexing logic


PROBLEMS_DIR = Path(__file__).parent.parent.parent / "data" / "problems"


def load_problems() -> list[dict]:
    return [json.loads(p.read_text()) for p in PROBLEMS_DIR.glob("*.json")]


if __name__ == "__main__":
    problems = load_problems()
    print(f"Found {len(problems)} problems to index")
    # TODO: embed and upsert into Qdrant
