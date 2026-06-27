import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Check if .env exists, if so load it
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # GitHub Token to avoid rate limiting
    GITHUB_TOKEN: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_OAUTH_REDIRECT_URI: str = "http://localhost:8000/api/auth/github/callback"
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Supabase credentials
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # Upstash Redis Configuration (REST API endpoints are async-friendly)
    UPSTASH_REDIS_REST_URL: str = ""
    UPSTASH_REDIS_REST_TOKEN: str = ""
    
    # Hugging Face Inference API
    HUGGINGFACE_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
