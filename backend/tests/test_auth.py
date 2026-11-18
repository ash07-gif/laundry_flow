def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "New User",
            "email": "newuser@test.com",
            "password": "newpassword123",
            "phone": "555-0000"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "CUSTOMER"

def test_login_user(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "customer@test.com",
            "password": "testpass"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_user(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "customer@test.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
