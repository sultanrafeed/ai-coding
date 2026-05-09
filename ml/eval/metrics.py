"""Metric definitions for AI feature evaluation."""
from __future__ import annotations


def hint_helpfulness_score(hint: str, ground_truth_approach: str) -> float:
    # TODO: LLM-as-judge scoring
    return 0.0


def complexity_accuracy(predicted: str, ground_truth: str) -> bool:
    return predicted.strip() == ground_truth.strip()


def explanation_groundedness(explanation: str, code: str) -> float:
    # TODO: check that explanation references actual code elements
    return 0.0
