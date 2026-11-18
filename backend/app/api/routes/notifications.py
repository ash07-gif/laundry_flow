from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.all_models import User
from app.models.remaining_models import Notification
from datetime import datetime

router = APIRouter()

@router.get("/")
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch notifications for the logged-in user."""
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()

@router.post("/{notification_id}/read")
def mark_as_read(notification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Mark a specific notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if notif and not notif.is_read:
        notif.is_read = datetime.utcnow()
        db.commit()
    return {"success": True}
