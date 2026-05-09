from celery import Celery

from src.core.config import settings

celery_app = Celery("ai-service", broker=settings.redis_url, backend=settings.redis_url)


@celery_app.task(name="embed_problem")
def embed_problem(problem_id: str) -> None:
    # TODO: fetch problem from API, embed statement + solutions, upsert into Qdrant
    pass


@celery_app.task(name="embed_submission")
def embed_submission(submission_id: str, user_id: str) -> None:
    # TODO: embed user submission, store in per-user Qdrant namespace
    pass


@celery_app.task(name="update_skill_graph")
def update_skill_graph(user_id: str, problem_id: str, solved: bool) -> None:
    # TODO: update skill_assessments table based on problem tags
    pass
