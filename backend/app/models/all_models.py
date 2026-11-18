import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey, Integer, Enum as SQLEnum, Text, Uuid, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class Role(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    STAFF = "STAFF"
    ADMIN = "ADMIN"

class StaffRole(str, enum.Enum):
    PICKUP_AGENT = "PICKUP_AGENT"
    LAUNDRY_OPERATOR = "LAUNDRY_OPERATOR"
    DELIVERY_AGENT = "DELIVERY_AGENT"
    MANAGER = "MANAGER"

class OrderStatus(str, enum.Enum):
    PLACED = "PLACED"
    CONFIRMED = "CONFIRMED"
    PICKUP_SCHEDULED = "PICKUP_SCHEDULED"
    PICKED_UP = "PICKED_UP"
    RECEIVED = "RECEIVED"
    PROCESSING = "PROCESSING"
    WASHING = "WASHING"
    DRYING = "DRYING"
    IRONING = "IRONING"
    QUALITY_CHECK = "QUALITY_CHECK"
    READY_FOR_DELIVERY = "READY_FOR_DELIVERY"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class User(Base):
    __tablename__ = "users"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String)
    role = Column(SQLEnum(Role), default=Role.CUSTOMER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Address(Base):
    __tablename__ = "addresses"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"))
    address_line_1 = Column(String, nullable=False)
    address_line_2 = Column(String)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    country = Column(String, default="USA")
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Service(Base):
    __tablename__ = "services"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String)
    base_price = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    order_number = Column(String, unique=True, index=True) # e.g. LND-2026-000001
    user_id = Column(Uuid, ForeignKey("users.id"))
    pickup_address_id = Column(Uuid, ForeignKey("addresses.id"))
    pickup_date = Column(DateTime, nullable=False)
    pickup_time_slot = Column(String, nullable=False)
    delivery_date = Column(DateTime, nullable=False)
    delivery_time_slot = Column(String, nullable=False)
    
    subtotal = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    delivery_fee = Column(Float, default=0.0)
    express_fee = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PLACED)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    items = relationship("OrderItem", back_populates="order")
    services = relationship("OrderService", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    order_id = Column(Uuid, ForeignKey("orders.id"))
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    order = relationship("Order", back_populates="items")

class OrderService(Base):
    __tablename__ = "order_services"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    order_id = Column(Uuid, ForeignKey("orders.id"))
    service_id = Column(Uuid, ForeignKey("services.id"))
    order = relationship("Order", back_populates="services")

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    order_id = Column(Uuid, ForeignKey("orders.id"))
    previous_status = Column(String)
    new_status = Column(String, nullable=False)
    changed_by = Column(Uuid, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
