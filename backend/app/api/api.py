from fastapi import APIRouter
from app.api.endpoints import (
    auth, users, courses, video, exams, coaches, projects,
    certificates, admin, leads, modules, quizzes, compliance,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(modules.router, tags=["modules"])
api_router.include_router(quizzes.router, tags=["quizzes"])
api_router.include_router(video.router, prefix="/video", tags=["video"])
api_router.include_router(exams.router, prefix="/exams", tags=["exams"])
api_router.include_router(coaches.router, prefix="/coaches", tags=["coaches"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["certificates"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])

