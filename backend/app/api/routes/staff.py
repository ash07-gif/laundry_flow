from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.all_models import Order, User, Role
from app.models.remaining_models import StaffAssignment

router = APIRouter()

def get_current_staff(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [Role.STAFF, Role.ADMIN]:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

@router.get("/tasks")
def get_staff_tasks(db: Session = Depends(get_db), current_staff: User = Depends(get_current_staff)):
    """Fetch orders assigned to the logged-in staff member."""
    assignments = db.query(StaffAssignment).filter(StaffAssignment.staff_id == current_staff.id).all()
    order_ids = [a.order_id for a in assignments]
    
    if not order_ids:
        return []
        
    orders = db.query(Order).filter(Order.id.in_(order_ids)).all()
    return orders
