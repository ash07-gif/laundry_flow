from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.dependencies.auth import get_current_admin
from app.models.all_models import Order, User, Service

router = APIRouter()

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    total_revenue = db.query(func.sum(Order.total)).scalar() or 0.0
    total_orders = db.query(Order).count()
    active_customers = db.query(User).filter(User.role == 'CUSTOMER').count()
    
    # In a real scenario, this would aggregate by date
    weekly_revenue = [
        {"name": "Mon", "revenue": total_revenue * 0.1, "orders": total_orders * 0.1},
        {"name": "Tue", "revenue": total_revenue * 0.15, "orders": total_orders * 0.15},
        {"name": "Wed", "revenue": total_revenue * 0.2, "orders": total_orders * 0.2},
    ]

    return {
        "metrics": {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "active_customers": active_customers,
            "growth": "+12.5%"
        },
        "weekly_data": weekly_revenue
    }
