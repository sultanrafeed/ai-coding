"""Extract DPO training pairs from ai_interactions table."""
from __future__ import annotations

# DPO pair format: { prompt, chosen, rejected }
# chosen = response with feedback = 1
# rejected = response with feedback = -1


def extract_dpo_pairs(db_url: str, output_path: str) -> None:
    # TODO: query ai_interactions WHERE feedback IS NOT NULL
    pass


if __name__ == "__main__":
    import sys
    extract_dpo_pairs(db_url=sys.argv[1], output_path=sys.argv[2])
