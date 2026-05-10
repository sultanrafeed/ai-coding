"""
Bulk-index all problems from data/problems/ into Qdrant via the AI service.

Usage (from repo root, with the AI service running on localhost:8000):
    python scripts/index_problems.py [--ai-url http://localhost:8000] [--concurrency 4]
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path

import httpx

DATA_DIR = Path(__file__).parent.parent / "data" / "problems"


async def index_one(client: httpx.AsyncClient, ai_url: str, slug: str, semaphore: asyncio.Semaphore) -> tuple[str, bool]:
    async with semaphore:
        try:
            resp = await client.post(
                f"{ai_url}/embeddings/index-problem",
                json={"problem_slug": slug},
                timeout=30,
            )
            return slug, resp.status_code == 200
        except Exception as exc:
            print(f"  ERROR {slug}: {exc}", file=sys.stderr)
            return slug, False


async def main(ai_url: str, concurrency: int) -> None:
    files = sorted(DATA_DIR.glob("*.json"))
    print(f"Found {len(files)} problem files — indexing with concurrency={concurrency}")

    slugs = []
    for f in files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            slugs.append(data["slug"])
        except Exception as exc:
            print(f"  SKIP {f.name}: {exc}", file=sys.stderr)

    semaphore = asyncio.Semaphore(concurrency)
    async with httpx.AsyncClient() as client:
        tasks = [index_one(client, ai_url, slug, semaphore) for slug in slugs]
        results = await asyncio.gather(*tasks)

    ok = sum(1 for _, success in results if success)
    failed = [slug for slug, success in results if not success]
    print(f"\nDone: {ok}/{len(slugs)} indexed successfully.")
    if failed:
        print(f"Failed ({len(failed)}): {', '.join(failed[:10])}{'...' if len(failed) > 10 else ''}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Bulk-index problems into Qdrant")
    parser.add_argument("--ai-url", default="http://localhost:8000", help="AI service base URL")
    parser.add_argument("--concurrency", type=int, default=4, help="Parallel requests")
    args = parser.parse_args()
    asyncio.run(main(args.ai_url, args.concurrency))
