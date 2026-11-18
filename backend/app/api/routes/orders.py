from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.all_models import Order, User, OrderItem, OrderService, Service, Address, OrderStatusHistory, Role
from app.schemas.all_schemas import OrderCreate, OrderResponse, AddressCreate, AddressResponse, OrderStatusUpdate
import uuid
import datetime

router = APIRouter()

def generate_order_number(db: Session):
    count = db.query(Order).count() + 1
    year = datetime.datetime.now().year
    return f"LND-{year}-{count:06d}"

@router.get("/addresses", response_model=List[AddressResponse])
def get_user_addresses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    addresses = db.query(Address).filter(Address.user_id == current_user.id).all()
    return addresses

@router.post("/addresses", response_model=AddressResponse)
def create_user_address(addr_in: AddressCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_addr = Address(
        user_id=current_user.id,
        address_line_1=addr_in.address_line_1,
        address_line_2=addr_in.address_line_2,
        city=addr_in.city,
        state=addr_in.state,
        postal_code=addr_in.postal_code,
        country=addr_in.country or "USA",
        is_default=addr_in.is_default or False
    )
    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)
    return new_addr

@router.post("/", response_model=OrderResponse)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subtotal = 0.0
    services = db.query(Service).filter(Service.id.in_(order_in.service_ids)).all()
    for s in services:
        subtotal += s.base_price
    
    item_count = sum([i.quantity for i in order_in.items])
    subtotal += item_count * 2.0
    
    tax = round(subtotal * 0.10, 2)
    total = round(subtotal + tax, 2)
    
    new_order = Order(
        order_number=generate_order_number(db),
        user_id=current_user.id,
        pickup_address_id=order_in.pickup_address_id,
        pickup_date=order_in.pickup_date,
        pickup_time_slot=order_in.pickup_time_slot,
        delivery_date=order_in.delivery_date,
        delivery_time_slot=order_in.delivery_time_slot,
        subtotal=subtotal,
        tax=tax,
        total=total
    )
    db.add(new_order)
    db.flush()
    
    for item in order_in.items:
        db.add(OrderItem(order_id=new_order.id, item_name=item.item_name, quantity=item.quantity))
        
    for sid in order_in.service_ids:
        db.add(OrderService(order_id=new_order.id, service_id=sid))
        
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/all", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Staff & Admin can view all orders
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return orders

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: uuid.UUID, status_update: OrderStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    prev = order.status.value if order.status else None
    order.status = status_update.status
    
    history = OrderStatusHistory(
        order_id=order.id,
        previous_status=prev,
        new_status=status_update.status.value,
        changed_by=current_user.id
    )
    db.add(history)
    db.commit()
    db.refresh(order)
    return order
