import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LaundryFlow API"
    API_V1_STR: str = "/api/v1"
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # DATABASE
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./laundryflow.db"
    )
    
    # AUTH
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-key-for-dev-only")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    AUTH_PROVIDER: str = os.getenv("AUTH_PROVIDER", "local") # local or cognito
    
    # AWS (Optional)
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "laundryflow-bucket")
    COGNITO_USER_POOL_ID: str = os.getenv("COGNITO_USER_POOL_ID", "")
    COGNITO_CLIENT_ID: str = os.getenv("COGNITO_CLIENT_ID", "")
    
    CORS_ORIGINS: list[str] = ["*"]
    
    class Config:
        case_sensitive = True

settings = Settings()
