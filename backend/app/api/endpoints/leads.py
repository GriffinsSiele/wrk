from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.session import get_db
from app.db.models import Lead
from app.schemas.lead import LeadCreate, LeadResponse, LeadStatusUpdate
from app.api.deps import get_current_active_admin
from app.db.models import User

router = APIRouter()

@router.post("/", response_model=LeadResponse)
async def create_lead(lead_in: LeadCreate, db: AsyncSession = Depends(get_db)):
    lead = Lead(**lead_in.model_dump())
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead

@router.get("/", response_model=List[LeadResponse])
async def list_leads(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_admin)):
    result = await db.execute(select(Lead).order_by(Lead.created_at.desc()))
    return result.scalars().all()

@router.patch("/{lead_id}/status")
async def update_lead_status(lead_id: int, update: LeadStatusUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_admin)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalars().first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.status = update.status
    await db.commit()
    return {"message": "Status updated"}
