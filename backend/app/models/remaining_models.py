from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Enum as SQLEnum, Text, Uuid, JSON
from app.core.database import Base
import enum
import uuid
from datetime import datetime

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class PaymentMethod(str, enum.Enum):
    CASH_ON_DELIVERY = "CASH_ON_DELIVERY"
    ONLINE = "ONLINE"

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    order_id = Column(Uuid, ForeignKey("orders.id"))
    amount = Column(Float, nullable=False)
    method = Column(SQLEnum(PaymentMethod), default=PaymentMethod.CASH_ON_DELIVERY)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    transaction_id = Column(String) # Mock transaction ID for online
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    invoice_number = Column(String, unique=True, index=True)
    order_id = Column(Uuid, ForeignKey("orders.id"))
    s3_url = Column(String) # For production AWS S3 PDF storage
    total_amount = Column(Float, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(DateTime, nullable=True) # Null if unread
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"))
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    metadata_info = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

class StaffAssignment(Base):
    __tablename__ = "staff_assignments"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    order_id = Column(Uuid, ForeignKey("orders.id"))
    staff_id = Column(Uuid, ForeignKey("users.id"))
    assigned_role = Column(String) # PICKUP_AGENT, DELIVERY_AGENT
    assigned_at = Column(DateTime, default=datetime.utcnow)
