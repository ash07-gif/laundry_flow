from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.remaining_models import Payment, PaymentStatus
from app.api.dependencies.auth import get_current_user
from pydantic import BaseModel
import uuid

router = APIRouter()

class PaymentIntent(BaseModel):
    order_id: uuid.UUID
    amount: float
    card_number: str  # Mocking logic only

@router.post("/process")
def process_payment(intent: PaymentIntent, db: Session = Depends(get_db)):
    """
    Mock payment processing endpoint. 
    In production, this would integrate with Stripe or a Payment Gateway.
    Never store card_number in the DB!
    """
    
    # Mocking a payment gateway logic
    is_successful = not intent.card_number.startswith("4") # Arbitrary failure condition for mocking
    
    payment = db.query(Payment).filter(Payment.order_id == intent.order_id).first()
    if not payment:
        payment = Payment(order_id=intent.order_id, amount=intent.amount)
        db.add(payment)
        
    if is_successful:
        payment.status = PaymentStatus.PAID
        payment.transaction_id = f"txn_{uuid.uuid4().hex[:16]}"
        message = "Payment successful"
    else:
        payment.status = PaymentStatus.FAILED
        message = "Payment failed. Please try a different card."
        
    db.commit()
    db.refresh(payment)
    
    return {
        "success": is_successful,
        "message": message,
        "payment_status": payment.status,
        "transaction_id": payment.transaction_id
    }
