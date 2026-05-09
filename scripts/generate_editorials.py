"""
Auto-generate editorial fields for each problem using the LLM + canonical solutions.

For each problem that has canonicalSolutions but an empty editorial, calls the LLM
to produce: approach, explanation, keyInsight, commonMistakes.

This is grounded generation — the model sees the actual correct code and produces
editorial content anchored to it, not hallucinated from memory.

Run:
  python scripts/generate_editorials.py                    # all problems
  python scripts/generate_editorials.py --slug two-sum     # single problem
  python scripts/generate_editorials.py --limit 50         # first N missing
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
LOG_FILE = Path(__file__).parent.parent / "data" / "editorial_log.txt"

LITELLM_URL = "http://localhost:4000/chat/completions"
LITELLM_API_KEY = "placeholder"          # set LITELLM_API_KEY env var or update here
DEFAULT_MODEL  = "deepseek-chat"

SYSTEM_PROMPT = """
You are an expert competitive programmer writing a problem editorial.
You will be given a problem title, description, and one or more canonical correct solutions.

Return a JSON object with exactly these fields:
{
  "approach": "<short name for the technique, e.g. 'Hash map complement lookup'>",
  "explanation": "<step-by-step walkthrough of the algorithm — 3 to 6 sentences>",
  "keyInsight": "<the single most important insight that unlocks the solution — 1 sentence>",
  "commonMistakes": ["<mistake 1>", "<mistake 2>", "<mistake 3>"]
}

Rules:
- commonMistakes must have 3–5 entries describing concrete bugs or wrong approaches
- Be specific to THIS problem, not generic advice
- Do not include code in explanation or keyInsight
- Return only valid JSON, no markdown fences
""".strip()


def log(msg: str) -> None:
    print(msg, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(msg + "\n")


def build_user_message(problem: dict) -> str:
    parts = [
        f"Problem: {problem['title']} ({problem['difficulty']})",
        f"Patterns: {', '.join(problem.get('patterns', []))}",
        "",
        "Description:",
        problem.get("descriptionHtml", "").replace("<", " ").replace(">", " ")[:2000],
        "",
        "Canonical solutions:",
    ]
    for sol in problem.get("canonicalSolutions", []):
        parts.append(f"\n[{sol['language']}]\n{sol['code'][:1500]}")
    return "\n".join(parts)


def call_llm(user_message: str, retries: int = 3) -> dict | None:
    import os
    api_key = os.environ.get("LITELLM_API_KEY", LITELLM_API_KEY)
    for attempt in range(retries):
        try:
            r = httpx.post(
                LITELLM_URL,
                json={
                    "model": DEFAULT_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_message},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 800,
                },
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=30,
            )
            content = r.json()["choices"][0]["message"]["content"].strip()
            # Strip markdown fences if model adds them
            content = re.sub(r"^```json\s*|\s*```$", "", content, flags=re.DOTALL).strip()
            return json.loads(content)
        except json.JSONDecodeError as e:
            log(f"  WARN: JSON parse failed (attempt {attempt+1}): {e}")
        except Exception as e:
            log(f"  WARN: LLM call failed (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(2)
    return None


def needs_editorial(problem: dict) -> bool:
    ed = problem.get("editorial", {})
    return (
        bool(problem.get("canonicalSolutions"))
        and not ed.get("explanation")
    )


def run(slugs: list[str], limit: int | None = None) -> None:
    pending = [s for s in slugs if needs_editorial(
        json.loads((PROBLEMS_DIR / f"{s}.json").read_text(encoding="utf-8"))
    )]

    if limit:
        pending = pending[:limit]

    log(f"Generating editorials for {len(pending)} problems...")

    done = failed = 0
    for i, slug in enumerate(pending):
        path = PROBLEMS_DIR / f"{slug}.json"
        problem = json.loads(path.read_text(encoding="utf-8"))

        log(f"[{i+1}/{len(pending)}] {slug}")
        user_msg = build_user_message(problem)
        editorial = call_llm(user_msg)

        if not editorial:
            log(f"  WARN: skipping {slug} — LLM returned nothing")
            failed += 1
            continue

        problem["editorial"] = {
            "approach":       editorial.get("approach", ""),
            "explanation":    editorial.get("explanation", ""),
            "keyInsight":     editorial.get("keyInsight", ""),
            "commonMistakes": editorial.get("commonMistakes", []),
        }
        path.write_text(json.dumps(problem, indent=2, ensure_ascii=False), encoding="utf-8")
        done += 1

        # ~1s between calls to avoid hammering the model
        time.sleep(1.0)

    log(f"\nDone. Generated: {done}  Failed: {failed}")


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
        log("\nInterrupted — re-run to resume, already-generated editorials are skipped.")
        sys.exit(0)
