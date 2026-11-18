from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional, List
from datetime import datetime
from app.models.all_models import Role, OrderStatus

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str

class UserResponse(BaseModel):
    id: UUID4
    name: str
    email: EmailStr
    phone: str
    role: Role
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class Login(BaseModel):
    email: EmailStr
    password: str

class AddressCreate(BaseModel):
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: Optional[str] = "USA"
    is_default: Optional[bool] = False

class ServiceResponse(BaseModel):
    id: UUID4
    name: str
    description: str
    base_price: float
    is_active: bool
    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    item_name: str
    quantity: int

class OrderCreate(BaseModel):
    pickup_address_id: UUID4
    pickup_date: datetime
    pickup_time_slot: str
    delivery_date: datetime
    delivery_time_slot: str
    service_ids: List[UUID4]
    items: List[OrderItemCreate]

class AddressResponse(BaseModel):
    id: UUID4
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    is_default: bool
    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderItemResponse(BaseModel):
    id: UUID4
    item_name: str
    quantity: int
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: UUID4
    order_number: str
    pickup_date: datetime
    delivery_date: datetime
    pickup_time_slot: Optional[str] = None
    delivery_time_slot: Optional[str] = None
    status: OrderStatus
    subtotal: Optional[float] = 0.0
    tax: Optional[float] = 0.0
    total: float
    items: Optional[List[OrderItemResponse]] = []
    created_at: datetime
    class Config:
        from_attributes = True
