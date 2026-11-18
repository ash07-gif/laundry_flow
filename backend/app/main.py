from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
import app.models.all_models
import app.models.remaining_models
from app.api.routes import auth, orders

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(orders.router, prefix=f"{settings.API_V1_STR}/orders", tags=["orders"])

# Dynamically importing to prevent circular/missing module errors in initial setup
from app.api.routes import admin, staff, notifications, payments, services
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(staff.router, prefix=f"{settings.API_V1_STR}/staff", tags=["staff"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(payments.router, prefix=f"{settings.API_V1_STR}/payments", tags=["payments"])
app.include_router(services.router, prefix=f"{settings.API_V1_STR}/services", tags=["services"])

@app.get("/")
def root():
    return {"message": "Welcome to LaundryFlow API"}
