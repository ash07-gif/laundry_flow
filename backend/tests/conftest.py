import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.core.security import get_password_hash
from app.models.all_models import User, Role, Service

# Use SQLite for quick testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Seed test data
    admin = User(name="Admin", email="admin@test.com", password_hash=get_password_hash("testpass"), role=Role.ADMIN)
    customer = User(name="Customer", email="customer@test.com", password_hash=get_password_hash("testpass"), role=Role.CUSTOMER)
    staff = User(name="Staff", email="staff@test.com", password_hash=get_password_hash("testpass"), role=Role.STAFF)
    
    db.add_all([admin, customer, staff])
    
    # Seed services
    db.add(Service(name="Wash & Fold", base_price=2.50))
    
    db.commit()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client():
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
