from sqlalchemy.orm import Session
from app.models.all_models import Service, OrderItem
from typing import List

class PricingEngine:
    @staticmethod
    def calculate_order_total(db: Session, service_ids: List[str], items: List[dict], is_express: bool = False):
        subtotal = 0.0
        
        # Add base service prices
        if service_ids:
            services = db.query(Service).filter(Service.id.in_(service_ids)).all()
            for s in services:
                subtotal += s.base_price
                
        # Add per-item prices
        item_count = sum([i['quantity'] for i in items])
        subtotal += item_count * 2.0  # Naive baseline pricing for items
        
        # Calculate fees
        tax_rate = 0.10
        tax = subtotal * tax_rate
        delivery_fee = 5.00 if subtotal < 50.0 else 0.00 # Free delivery over $50
        express_fee = 15.00 if is_express else 0.00
        
        total = subtotal + tax + delivery_fee + express_fee
        
        return {
            "subtotal": round(subtotal, 2),
            "tax": round(tax, 2),
            "delivery_fee": round(delivery_fee, 2),
            "express_fee": round(express_fee, 2),
            "total": round(total, 2)
        }
