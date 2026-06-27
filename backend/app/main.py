import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import search, preferences, saved_repos

app = FastAPI(
    title="GitNiche API",
    description="AI-powered GitHub Discovery Platform MVP API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(preferences.router, prefix="/api", tags=["Preferences"])
app.include_router(saved_repos.router, prefix="/api", tags=["Saved Repositories"])

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "api": "GitNiche API v1.0.0",
        "services": {
            "supabase": "connected" if settings.SUPABASE_URL and settings.SUPABASE_KEY else "mocked",
            "redis": "connected" if settings.UPSTASH_REDIS_REST_URL and settings.UPSTASH_REDIS_REST_TOKEN else "mocked",
            "huggingface": "connected" if settings.HUGGINGFACE_API_KEY else "mocked"
        }
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the GitNiche API! Access API docs at /docs"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
