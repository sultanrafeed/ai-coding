"""
Auto-fill timeComplexity / spaceComplexity for each canonicalSolution entry
that has empty complexity fields, using the LLM.

Run after fetch_leetcode_metadata.py and generate_editorials.py.

Run:
  python scripts/fill_complexity.py
  python scripts/fill_complexity.py --slug two-sum
  python scripts/fill_complexity.py --limit 100
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path

import httpx

PROBLEMS_DIR = Path(__file__).parent.parent / "data" / "problems"
LOG_FILE = Path(__file__).parent.parent / "data" / "complexity_log.txt"

LITELLM_URL = "http://localhost:4000/chat/completions"
DEFAULT_MODEL = "deepseek-chat"

SYSTEM_PROMPT = """
You are an algorithm complexity analyst.
Given code, return a JSON object:
{
  "timeComplexity": "<Big-O, e.g. O(n log n)>",
  "spaceComplexity": "<Big-O, e.g. O(n)>"
}

Rules:
- n = primary input size
- Be precise. If it depends on multiple variables, say so (e.g. O(V + E) for graphs)
- Return only valid JSON, no markdown fences, no explanation
""".strip()


def log(msg: str) -> None:
    print(msg, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(msg + "\n")


def call_llm(code: str, language: str, retries: int = 3) -> dict | None:
    import os
    api_key = os.environ.get("LITELLM_API_KEY", "placeholder")
    for attempt in range(retries):
        try:
            r = httpx.post(
                LITELLM_URL,
                json={
                    "model": DEFAULT_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"```{language}\n{code[:2000]}\n```"},
                    ],
                    "temperature": 0.0,
                    "max_tokens": 100,
                },
                headers={"Authorization": f"Bearer {os.environ.get('LITELLM_API_KEY', 'placeholder')}"},
                timeout=20,
            )
            content = r.json()["choices"][0]["message"]["content"].strip()
            content = re.sub(r"^```json\s*|\s*```$", "", content, flags=re.DOTALL).strip()
            return json.loads(content)
        except Exception as e:
            log(f"  WARN attempt {attempt+1}: {e}")
            if attempt < retries - 1:
                time.sleep(1)
    return None


def run(slugs: list[str], limit: int | None = None) -> None:
    pending = []
    for slug in slugs:
        path = PROBLEMS_DIR / f"{slug}.json"
        if not path.exists():
            continue
        p = json.loads(path.read_text(encoding="utf-8"))
        if any(not s.get("timeComplexity") for s in p.get("canonicalSolutions", [])):
            pending.append(slug)

    if limit:
        pending = pending[:limit]

    log(f"Filling complexity for {len(pending)} problems...")

    done = failed = 0
    for i, slug in enumerate(pending):
        path = PROBLEMS_DIR / f"{slug}.json"
        problem = json.loads(path.read_text(encoding="utf-8"))
        changed = False

        for sol in problem.get("canonicalSolutions", []):
            if sol.get("timeComplexity"):
                continue

            log(f"[{i+1}/{len(pending)}] {slug} ({sol['language']})")
            result = call_llm(sol["code"], sol["language"])

            if not result:
                log(f"  WARN: skipping {slug}/{sol['language']}")
                failed += 1
                continue

            sol["timeComplexity"]  = result.get("timeComplexity", "")
            sol["spaceComplexity"] = result.get("spaceComplexity", "")
            changed = True
            done += 1
            time.sleep(0.5)

        if changed:
            path.write_text(json.dumps(problem, indent=2, ensure_ascii=False), encoding="utf-8")

    log(f"\nDone. Filled: {done}  Failed: {failed}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", help="Single problem slug")
    parser.add_argument("--limit", type=int, help="Only process first N missing")
    args = parser.parse_args()

    if not args.slug and LOG_FILE.exists():
        LOG_FILE.unlink()

    try:
        if args.slug:
            run([args.slug])
        else:
            slugs = sorted(p.stem for p in PROBLEMS_DIR.glob("*.json") if p.name != "schema.json")
            run(slugs, limit=args.limit)
    except KeyboardInterrupt:
        log("\nInterrupted — re-run to resume.")
        sys.exit(0)
