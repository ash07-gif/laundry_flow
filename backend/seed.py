import os
import uuid
import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
import app.models.all_models
import app.models.remaining_models
from app.models.all_models import User, Role, Service, Address, Order, OrderItem, OrderService, OrderStatus
from app.models.remaining_models import StaffAssignment, Payment, PaymentStatus, PaymentMethod
from app.core.security import get_password_hash

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    print("Seeding Users...")
    # Admin
    admin = db.query(User).filter(User.email == "admin@laundryflow.com").first()
    if not admin:
        admin = User(
            name="System Admin",
            email="admin@laundryflow.com",
            password_hash=get_password_hash("admin123"),
            phone="+1 (555) 010-0001",
            role=Role.ADMIN
        )
        db.add(admin)
        db.flush()

    # Staff
    staff = db.query(User).filter(User.email == "staff@laundryflow.com").first()
    if not staff:
        staff = User(
            name="Alex Turner (Staff)",
            email="staff@laundryflow.com",
            password_hash=get_password_hash("staff123"),
            phone="+1 (555) 010-0002",
            role=Role.STAFF
        )
        db.add(staff)
        db.flush()

    # Customer
    customer = db.query(User).filter(User.email == "customer@laundryflow.com").first()
    if not customer:
        customer = User(
            name="Sarah Jenkins",
            email="customer@laundryflow.com",
            password_hash=get_password_hash("customer123"),
            phone="+1 (555) 010-0003",
            role=Role.CUSTOMER
        )
        db.add(customer)
        db.flush()

    print("Seeding Customer Address...")
    address = db.query(Address).filter(Address.user_id == customer.id).first()
    if not address:
        address = Address(
            user_id=customer.id,
            address_line_1="742 Evergreen Terrace, Apt 4B",
            address_line_2="Building B",
            city="New York",
            state="NY",
            postal_code="10001",
            country="USA",
            is_default=True
        )
        db.add(address)
        db.flush()

    print("Seeding Services...")
    services_data = [
        {"name": "Wash & Fold", "price": 2.50, "desc": "Everyday clothes washed, dried, and neatly folded"},
        {"name": "Dry Cleaning", "price": 5.00, "desc": "Eco-friendly solvent dry cleaning for delicate garments"},
        {"name": "Ironing & Press", "price": 3.00, "desc": "Crisp steam pressing on hanger or folded"},
        {"name": "Premium Care & Silk", "price": 12.00, "desc": "Hand wash & specialized treatment for luxury fabrics"},
        {"name": "Bedding & Linens", "price": 8.50, "desc": "Duvets, sheets, comforters sanitized & fresh"}
    ]
    
    services_map = {}
    for s in services_data:
        svc = db.query(Service).filter(Service.name == s["name"]).first()
        if not svc:
            svc = Service(name=s["name"], base_price=s["price"], description=s["desc"])
            db.add(svc)
            db.flush()
        services_map[s["name"]] = svc

    print("Seeding Sample Orders...")
    existing_orders = db.query(Order).count()
    if existing_orders == 0:
        now = datetime.datetime.utcnow()
        sample_orders = [
            {
                "num": "LND-2026-000101",
                "status": OrderStatus.PROCESSING,
                "pickup_slot": "09:00 AM - 11:00 AM",
                "delivery_slot": "02:00 PM - 04:00 PM",
                "subtotal": 36.50,
                "tax": 3.65,
                "total": 40.15,
                "items": [("Cotton Shirt", 4), ("Denim Jeans", 2), ("Bath Towel", 3)],
                "services": ["Wash & Fold", "Ironing & Press"]
            },
            {
                "num": "LND-2026-000102",
                "status": OrderStatus.PICKUP_SCHEDULED,
                "pickup_slot": "01:00 PM - 03:00 PM",
                "delivery_slot": "05:00 PM - 07:00 PM",
                "subtotal": 52.00,
                "tax": 5.20,
                "total": 57.20,
                "items": [("Wool Blazer", 1), ("Silk Dress", 2), ("Formal Trouser", 2)],
                "services": ["Dry Cleaning", "Premium Care & Silk"]
            },
            {
                "num": "LND-2026-000103",
                "status": OrderStatus.OUT_FOR_DELIVERY,
                "pickup_slot": "10:00 AM - 12:00 PM",
                "delivery_slot": "04:00 PM - 06:00 PM",
                "subtotal": 44.00,
                "tax": 4.40,
                "total": 48.40,
                "items": [("Bed Sheet Set", 2), ("Pillow Cases", 4), ("T-Shirt", 5)],
                "services": ["Bedding & Linens", "Wash & Fold"]
            },
            {
                "num": "LND-2026-000104",
                "status": OrderStatus.DELIVERED,
                "pickup_slot": "08:00 AM - 10:00 AM",
                "delivery_slot": "12:00 PM - 02:00 PM",
                "subtotal": 28.00,
                "tax": 2.80,
                "total": 30.80,
                "items": [("Casual Shirts", 3), ("Shorts", 2)],
                "services": ["Wash & Fold"]
            }
        ]

        for idx, so in enumerate(sample_orders):
            ord_obj = Order(
                order_number=so["num"],
                user_id=customer.id,
                pickup_address_id=address.id,
                pickup_date=now - datetime.timedelta(days=idx),
                pickup_time_slot=so["pickup_slot"],
                delivery_date=now + datetime.timedelta(days=1 + idx),
                delivery_time_slot=so["delivery_slot"],
                subtotal=so["subtotal"],
                tax=so["tax"],
                total=so["total"],
                status=so["status"]
            )
            db.add(ord_obj)
            db.flush()

            for item_name, qty in so["items"]:
                db.add(OrderItem(order_id=ord_obj.id, item_name=item_name, quantity=qty))

            for s_name in so["services"]:
                if s_name in services_map:
                    db.add(OrderService(order_id=ord_obj.id, service_id=services_map[s_name].id))

            # Add payment
            db.add(Payment(
                order_id=ord_obj.id,
                amount=so["total"],
                method=PaymentMethod.ONLINE if idx % 2 == 0 else PaymentMethod.CASH_ON_DELIVERY,
                status=PaymentStatus.PAID if so["status"] in [OrderStatus.PROCESSING, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED] else PaymentStatus.PENDING,
                transaction_id=f"txn_{uuid.uuid4().hex[:12]}"
            ))

            # Assign staff to non-delivered orders
            if so["status"] != OrderStatus.DELIVERED:
                db.add(StaffAssignment(
                    order_id=ord_obj.id,
                    staff_id=staff.id,
                    assigned_role="PICKUP_AGENT" if so["status"] == OrderStatus.PICKUP_SCHEDULED else "DELIVERY_AGENT"
                ))

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_data()
