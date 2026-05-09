"""
Repair corrupted problem JSON files caused by concurrent write collisions.
Re-ingests canonical solutions from disk and re-fetches metadata from LeetCode.

Run:
  python scripts/repair_corrupted.py
"""
from __future__ import annotations

import json
import pathlib
import time
import uuid

import httpx

PROBLEMS_DIR = pathlib.Path(__file__).parent.parent / "data" / "problems"
SOLUTIONS_ROOT = pathlib.Path(
    r"C:\Users\Rafeed\Downloads\LeetCode-Solutions-master\LeetCode-Solutions-master"
)

LANG_MAP = {
    "Python": "python", "Python3": "python", "C++": "cpp",
    "Java": "java", "TypeScript": "typescript", "JavaScript": "javascript",
    "Rust": "rust", "Golang": "golang", "C#": "csharp",
    "Kotlin": "kotlin", "Ruby": "ruby",
}
INCLUDE_LANGS = {"python", "cpp", "javascript", "typescript"}
EXT_MAP = {"python": ".py", "cpp": ".cpp", "typescript": ".ts", "javascript": ".js"}

GRAPHQL_URL = "https://leetcode.com/graphql"
QUERY = """
query problemDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title difficulty content topicTags { slug } exampleTestcases
  }
}
"""
HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": "Mozilla/5.0",
}


def find_corrupted() -> list[pathlib.Path]:
    bad = []
    for f in PROBLEMS_DIR.glob("*.json"):
        if f.name == "schema.json":
            continue
        try:
            json.loads(f.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            bad.append(f)
    return bad


def get_canonical_solutions(slug: str) -> list[dict]:
    solutions = []
    for folder in SOLUTIONS_ROOT.iterdir():
        lang = LANG_MAP.get(folder.name)
        if not lang or lang not in INCLUDE_LANGS or not folder.is_dir():
            continue
        ext = EXT_MAP.get(lang, "")
        sol_file = folder / f"{slug}{ext}"
        if sol_file.exists():
            code = sol_file.read_text(encoding="utf-8", errors="replace").strip()
            if code:
                solutions.append({
                    "language": lang,
                    "code": code,
                    "timeComplexity": "",
                    "spaceComplexity": "",
                })
    return solutions


def fetch_metadata(slug: str) -> dict | None:
    try:
        r = httpx.post(
            GRAPHQL_URL,
            json={"query": QUERY, "variables": {"titleSlug": slug}},
            headers=HEADERS,
            timeout=15,
        )
        return r.json().get("data", {}).get("question")
    except Exception as e:
        print(f"  WARN fetch failed: {e}")
        return None


def repair(path: pathlib.Path) -> None:
    slug = path.stem

    problem = {
        "id": str(uuid.uuid4()),
        "slug": slug,
        "title": slug.replace("-", " ").title(),
        "difficulty": "medium",
        "descriptionHtml": "",
        "patterns": [],
        "constraints": {},
        "examples": [],
        "testCases": [],
        "canonicalSolutions": get_canonical_solutions(slug),
        "editorial": {
            "approach": "",
            "explanation": "",
            "keyInsight": "",
            "commonMistakes": [],
        },
    }

    lc = fetch_metadata(slug)
    if lc:
        problem["title"] = lc.get("title") or problem["title"]
        diff = (lc.get("difficulty") or "").lower()
        if diff in ("easy", "medium", "hard"):
            problem["difficulty"] = diff
        problem["descriptionHtml"] = lc.get("content") or ""
        problem["patterns"] = [t["slug"] for t in (lc.get("topicTags") or [])]

    path.write_text(json.dumps(problem, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> None:
    bad = find_corrupted()
    print(f"Found {len(bad)} corrupted files. Repairing...")

    fixed = failed = 0
    for i, path in enumerate(bad):
        print(f"[{i+1}/{len(bad)}] {path.stem}", flush=True)
        try:
            repair(path)
            fixed += 1
        except Exception as e:
            print(f"  ERROR: {e}")
            failed += 1
        time.sleep(0.3)

    print(f"\nDone. Repaired: {fixed}  Failed: {failed}")


if __name__ == "__main__":
    main()
