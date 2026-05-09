"""
Fetch problem metadata from LeetCode's public GraphQL API and merge into
the JSON files that ingest_leetcode_solutions.py created.

Fills in: title, difficulty, descriptionHtml, examples, constraints, patterns (topics).
Does NOT fill editorial or canonicalSolutions — those come from your curated data.

Run:
  python scripts/fetch_leetcode_metadata.py
  python scripts/fetch_leetcode_metadata.py --slug two-sum   # single problem
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import traceback
from pathlib import Path

import httpx

PROBLEMS_DIR = Path(__file__).parent.parent / "data" / "problems"
LOG_FILE = Path(__file__).parent.parent / "data" / "fetch_log.txt"

GRAPHQL_URL = "https://leetcode.com/graphql"
QUERY = """
query problemDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    difficulty
    content
    topicTags { slug }
    exampleTestcases
  }
}
"""

HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": "Mozilla/5.0",
}


def log(msg: str) -> None:
    print(msg, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(msg + "\n")


def fetch(slug: str, retries: int = 3) -> dict | None:
    for attempt in range(retries):
        try:
            r = httpx.post(
                GRAPHQL_URL,
                json={"query": QUERY, "variables": {"titleSlug": slug}},
                headers=HEADERS,
                timeout=15,
            )
            if r.status_code == 429:
                wait = 10 * (attempt + 1)
                log(f"  WARN: rate limited on {slug}, waiting {wait}s")
                time.sleep(wait)
                continue
            payload = r.json()
            return payload.get("data", {}).get("question")
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2)
            else:
                log(f"  WARN: failed to fetch {slug} after {retries} attempts: {e}")
    return None


def merge(problem: dict, lc: dict) -> dict:
    if not problem.get("title") or problem["title"] == problem["slug"].replace("-", " ").title():
        problem["title"] = lc.get("title") or problem["title"]

    diff = (lc.get("difficulty") or "").lower()
    if diff in ("easy", "medium", "hard"):
        problem["difficulty"] = diff

    if not problem.get("descriptionHtml"):
        problem["descriptionHtml"] = lc.get("content") or ""

    if not problem.get("patterns"):
        problem["patterns"] = [t["slug"] for t in (lc.get("topicTags") or [])]

    # Extract visible test cases from exampleTestcases field
    if not problem.get("testCases") and lc.get("exampleTestcases"):
        raw = lc["exampleTestcases"].strip()
        if raw:
            problem["testCases"] = [
                {"input": raw, "expectedOutput": "", "isHidden": False}
            ]

    return problem


def run(slugs: list[str]) -> None:
    done = skipped = failed = 0
    for i, slug in enumerate(slugs):
        path = PROBLEMS_DIR / f"{slug}.json"
        if not path.exists():
            continue

        try:
            problem = json.loads(path.read_text(encoding="utf-8"))
        except Exception as e:
            log(f"  WARN: could not read {slug}.json: {e}")
            continue

        if problem.get("descriptionHtml") and problem.get("patterns"):
            log(f"[{i+1}/{len(slugs)}] skip {slug} (already populated)")
            skipped += 1
            continue

        log(f"[{i+1}/{len(slugs)}] fetching {slug}...")
        lc = fetch(slug)

        if lc is None:
            log(f"  WARN: no data returned for {slug} (premium or removed?)")
            failed += 1
            time.sleep(0.3)
            continue

        try:
            problem = merge(problem, lc)
            path.write_text(json.dumps(problem, indent=2, ensure_ascii=False), encoding="utf-8")
            done += 1
        except Exception:
            log(f"  ERROR merging/writing {slug}:\n{traceback.format_exc()}")
            failed += 1

        time.sleep(0.3)

    log(f"\nDone. Fetched: {done}  Skipped: {skipped}  Failed/premium: {failed}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", help="Fetch a single problem by slug")
    args = parser.parse_args()

    # Clear log on fresh full run (ignore if locked by another process)
    if not args.slug and LOG_FILE.exists():
        try:
            LOG_FILE.unlink()
        except OSError:
            pass

    if args.slug:
        run([args.slug])
    else:
        slugs = sorted(p.stem for p in PROBLEMS_DIR.glob("*.json") if p.name != "schema.json")
        log(f"Fetching metadata for {len(slugs)} problems...")
        try:
            run(slugs)
        except KeyboardInterrupt:
            log("\nInterrupted. Re-run to resume — already-fetched problems will be skipped.")
            sys.exit(0)
