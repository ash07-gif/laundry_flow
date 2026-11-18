from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.all_models import Service
from app.schemas.all_schemas import ServiceResponse

router = APIRouter()

@router.get("/", response_model=List[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    """Fetch all active laundry services"""
    return db.query(Service).filter(Service.is_active == True).all()
