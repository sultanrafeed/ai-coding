"""
Ingest LeetCode-Solutions-master into data/problems/.

Folder structure expected:
  LeetCode-Solutions-master/
    Python/         two-sum.py, ...
    Python3/        two-sum.py, ...
    C++/            two-sum.cpp, ...
    Java/           two-sum.java, ...
    TypeScript/     two-sum.ts, ...
    Rust/           two-sum.rs, ...
    Golang/         two-sum.go, ...
    C#/             two-sum.cs, ...
    Kotlin/         two-sum.kt, ...
    Ruby/           two-sum.rb, ...

Output: data/problems/{slug}.json
  - If a JSON already exists: merges new canonicalSolutions entries, skips existing languages.
  - If not: creates a skeleton JSON (no testCases / editorial — fill those manually or via LeetCode API later).

Run:
  python scripts/ingest_leetcode_solutions.py <path-to-LeetCode-Solutions-master>
"""
from __future__ import annotations

import json
import sys
import uuid
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────

PROBLEMS_DIR = Path(__file__).parent.parent / "data" / "problems"

# Maps folder name → canonical language identifier
LANG_MAP: dict[str, str] = {
    "Python":     "python",
    "Python3":    "python",
    "C++":        "cpp",
    "Java":       "java",
    "TypeScript": "typescript",
    "JavaScript": "javascript",
    "Rust":       "rust",
    "Golang":     "golang",
    "Go":         "golang",
    "C#":         "csharp",
    "Kotlin":     "kotlin",
    "Ruby":       "ruby",
    "Swift":      "swift",
    "Shell":      "bash",
    "MySQL":      "sql",
    "PHP":        "php",
}

# Languages we actually care about for the platform (skip the rest)
INCLUDE_LANGS = {"python", "cpp", "javascript", "typescript"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def slug_from_filename(filename: str) -> str:
    return Path(filename).stem  # "two-sum.py" → "two-sum"


def load_existing(slug: str) -> dict | None:
    path = PROBLEMS_DIR / f"{slug}.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return None


def skeleton(slug: str) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "slug": slug,
        "title": slug.replace("-", " ").title(),
        "difficulty": "medium",          # update manually
        "descriptionHtml": "",           # fill from LeetCode or manually
        "patterns": [],                  # tag manually or via LLM
        "constraints": {},
        "examples": [],
        "testCases": [],                 # add before indexing
        "canonicalSolutions": [],
        "editorial": {
            "approach": "",
            "explanation": "",
            "keyInsight": "",
            "commonMistakes": [],
        },
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def ingest(solutions_root: Path) -> None:
    PROBLEMS_DIR.mkdir(parents=True, exist_ok=True)

    # Collect all solutions: slug → {language → code}
    collected: dict[str, dict[str, str]] = {}

    for folder in solutions_root.iterdir():
        lang = LANG_MAP.get(folder.name)
        if not lang or lang not in INCLUDE_LANGS:
            continue
        if not folder.is_dir():
            continue

        for file in folder.iterdir():
            if not file.is_file():
                continue
            slug = slug_from_filename(file.name)
            code = file.read_text(encoding="utf-8", errors="replace").strip()
            if not code:
                continue
            collected.setdefault(slug, {})[lang] = code

    created = updated = skipped = 0

    for slug, solutions_by_lang in collected.items():
        problem = load_existing(slug) or skeleton(slug)
        existing_langs = {s["language"] for s in problem.get("canonicalSolutions", [])}

        added = False
        for lang, code in solutions_by_lang.items():
            if lang in existing_langs:
                continue  # don't overwrite manually curated solutions
            problem["canonicalSolutions"].append({
                "language": lang,
                "code": code,
                "timeComplexity": "",   # fill manually or via complexity agent
                "spaceComplexity": "",
            })
            added = True

        if not added:
            skipped += 1
            continue

        out = PROBLEMS_DIR / f"{slug}.json"
        out.write_text(json.dumps(problem, indent=2, ensure_ascii=False), encoding="utf-8")

        if load_existing(slug) is None:
            created += 1
        else:
            updated += 1

    print(f"Done. Created: {created}  Updated: {updated}  Skipped (already complete): {skipped}")
    print(f"Problems are in: {PROBLEMS_DIR}")
    print()
    print("Next steps:")
    print("  1. Fill in descriptionHtml, testCases, patterns, editorial for each problem")
    print("     (or run a bulk-fill script using the LeetCode GraphQL API)")
    print("  2. Run:  python ml/embeddings/index_problems.py")
    print("     to embed everything into Qdrant")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/ingest_leetcode_solutions.py <path-to-LeetCode-Solutions-master>")
        sys.exit(1)

    root = Path(sys.argv[1])
    if not root.exists():
        print(f"Path not found: {root}")
        sys.exit(1)

    ingest(root)
