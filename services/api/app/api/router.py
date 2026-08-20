"""Main API router aggregating all route modules."""

from fastapi import APIRouter

from app.api.endpoints import health

api_router = APIRouter()

# Health check
api_router.include_router(health.router, tags=["health"])

# TODO: Add additional route modules
# api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
# api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
# api_router.include_router(learning.router, prefix="/learning", tags=["learning"])
