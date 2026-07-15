from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import datetime, timezone

from app.db.session import get_db
from app.db.models import Project, Operator, ProjectAssignment, CoachAttribute, User, AssignmentStatus
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ClientCreate,
    ClientResponse,
    AssignmentCreate,
    AssignmentResponse,
)
from app.api.deps import get_current_active_admin
from app.services.certification import agreements_fully_signed, refresh_placement_eligibility

router = APIRouter()


@router.get("/clients", response_model=List[ClientResponse])
@router.get("/operators", response_model=List[ClientResponse])
async def list_operators(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_admin)):
    result = await db.execute(select(Operator))
    return result.scalars().all()


@router.post("/clients", response_model=ClientResponse)
@router.post("/operators", response_model=ClientResponse)
async def create_operator(
    client_in: ClientCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    operator = Operator(**client_in.model_dump())
    db.add(operator)
    await db.commit()
    await db.refresh(operator)
    return operator


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_admin)):
    result = await db.execute(select(Project))
    projects = result.scalars().all()
    return [
        ProjectResponse(
            id=p.id,
            client_id=p.operator_id,
            operator_id=p.operator_id,
            client_name=p.client_name,
            title=p.title,
            description=p.description,
            project_type=p.project_type,
            start_date=p.start_date,
            end_date=p.end_date,
            status=p.status,
            created_at=p.created_at,
        )
        for p in projects
    ]


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    data = project_in.model_dump(exclude_none=True)
    operator_id = data.pop("operator_id", None) or data.pop("client_id", None)
    client_name = data.pop("client_name", None)
    if operator_id and not client_name:
        op_result = await db.execute(select(Operator).where(Operator.id == operator_id))
        operator = op_result.scalars().first()
        if operator:
            client_name = operator.name
    project = Project(operator_id=operator_id, client_name=client_name, **data)
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return ProjectResponse(
        id=project.id,
        client_id=project.operator_id,
        operator_id=project.operator_id,
        client_name=project.client_name,
        title=project.title,
        description=project.description,
        project_type=project.project_type,
        start_date=project.start_date,
        end_date=project.end_date,
        status=project.status,
        created_at=project.created_at,
    )


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    data = project_in.model_dump(exclude_none=True)
    if "operator_id" in data or "client_id" in data:
        project.operator_id = data.pop("operator_id", None) or data.pop("client_id", None)
    for field, value in data.items():
        if field == "client_id":
            continue
        setattr(project, field, value)
    await db.commit()
    await db.refresh(project)
    return ProjectResponse(
        id=project.id,
        client_id=project.operator_id,
        operator_id=project.operator_id,
        client_name=project.client_name,
        title=project.title,
        description=project.description,
        project_type=project.project_type,
        start_date=project.start_date,
        end_date=project.end_date,
        status=project.status,
        created_at=project.created_at,
    )


@router.post("/{project_id}/assign", response_model=AssignmentResponse)
async def assign_coach_to_project(
    project_id: int,
    assignment_in: AssignmentCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_admin),
):
    project_result = await db.execute(select(Project).where(Project.id == project_id))
    if not project_result.scalars().first():
        raise HTTPException(status_code=404, detail="Project not found")

    ca_result = await db.execute(select(CoachAttribute).where(CoachAttribute.id == assignment_in.coach_id))
    coach = ca_result.scalars().first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")

    # Placement gate: placement_eligible + mandatory signed agreements
    await refresh_placement_eligibility(db, coach.user_id)
    await db.refresh(coach)
    if not coach.placement_eligible:
        signed = await agreements_fully_signed(db, coach.user_id)
        raise HTTPException(
            status_code=400,
            detail=(
                "Placement gate blocked assignment. Coach must be placement_eligible "
                f"(active certificate + signed NDA & Code of Conduct). agreements_signed={signed}"
            ),
        )

    assignment = ProjectAssignment(
        project_id=project_id,
        coach_id=assignment_in.coach_id,
        notes=assignment_in.notes,
        status=AssignmentStatus.PENDING,
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment
