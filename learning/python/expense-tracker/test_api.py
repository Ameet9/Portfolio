import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from jose import jwt
from datetime import datetime, timedelta

from main import app
from database import Base, get_db
from auth import SECRET_KEY, ALGORITHM

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_expenses.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_signup_creates_user():
    res = client.post("/signup", json={"email": "test@example.com", "password": "password123"})
    assert res.status_code == 201
    assert res.json()["email"] == "test@example.com"
    assert "id" in res.json()

def test_duplicate_email_returns_400():
    client.post("/signup", json={"email": "test@example.com", "password": "password123"})
    res = client.post("/signup", json={"email": "test@example.com", "password": "password123"})
    assert res.status_code == 400

def test_login_returns_jwt():
    client.post("/signup", json={"email": "test@example.com", "password": "password123"})
    res = client.post("/login", json={"email": "test@example.com", "password": "password123"})
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert res.json()["token_type"] == "bearer"

def test_wrong_password_returns_401():
    client.post("/signup", json={"email": "test@example.com", "password": "password123"})
    res = client.post("/login", json={"email": "test@example.com", "password": "wrongpassword"})
    assert res.status_code == 401

def test_protected_route_without_token_returns_401():
    res = client.get("/expenses")
    assert res.status_code == 401

def test_crud_operations_with_valid_token():
    client.post("/signup", json={"email": "test@example.com", "password": "password123"})
    token_res = client.post("/login", json={"email": "test@example.com", "password": "password123"})
    token = token_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create expense
    exp_res = client.post("/expenses", json={"amount": 100.5, "category": "Food", "description": "Lunch"}, headers=headers)
    assert exp_res.status_code == 201
    assert exp_res.json()["amount"] == 100.5
    exp_id = exp_res.json()["id"]
    
    # Get expenses
    get_res = client.get("/expenses", headers=headers)
    assert get_res.status_code == 200
    assert len(get_res.json()) == 1
    
    # Delete expense
    del_res = client.delete(f"/expenses/{exp_id}", headers=headers)
    assert del_res.status_code == 204

def test_user_cannot_see_other_users_expenses_idor():
    # User 1
    client.post("/signup", json={"email": "user1@example.com", "password": "password123"})
    t1 = client.post("/login", json={"email": "user1@example.com", "password": "password123"}).json()["access_token"]
    h1 = {"Authorization": f"Bearer {t1}"}
    client.post("/expenses", json={"amount": 50, "category": "Transport"}, headers=h1)
    
    # User 2
    client.post("/signup", json={"email": "user2@example.com", "password": "password123"})
    t2 = client.post("/login", json={"email": "user2@example.com", "password": "password123"}).json()["access_token"]
    h2 = {"Authorization": f"Bearer {t2}"}
    
    # User 2 lists expenses
    res = client.get("/expenses", headers=h2)
    assert res.status_code == 200
    # Should be empty for user 2
    assert len(res.json()) == 0

def test_expired_token_returns_401():
    # Generate expired token manually
    to_encode = {"sub": "test@example.com", "exp": datetime.utcnow() - timedelta(minutes=10)}
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.get("/expenses", headers=headers)
    assert res.status_code == 401
